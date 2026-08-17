const mockPrisma = {
  location: {
    upsert: jest.fn(),
  },
  character: {
    upsert: jest.fn(),
  },
  episode: {
    upsert: jest.fn(),
  },
  characterEpisode: {
    upsert: jest.fn(),
  },
};

// En Jest el factory de jest.mock se levanta (hoist) automáticamente.
// La variable debe empezar por "mock" para ser usada aquí dentro.
jest.mock("../lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { syncCharacters } from "./sync.service";

describe("syncCharacters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should synchronize characters, episodes and relationships", async () => {
    const character = {
      id: 1,
      name: "Rick Sanchez",
      status: "Alive",
      species: "Human",
      type: "",
      gender: "Male",
      image: "https://example.com/rick.png",
      location: {
        name: "Earth",
        url: "https://rickandmortyapi.com/api/location/1",
      },
      episode: [
        "https://rickandmortyapi.com/api/episode/1",
        "https://rickandmortyapi.com/api/episode/2",
      ],
    };

    const episode1 = {
      id: 1,
      name: "Pilot",
      air_date: "December 2, 2013",
      episode: "S01E01",
    };

    const episode2 = {
      id: 2,
      name: "Lawnmower Dog",
      air_date: "December 9, 2013",
      episode: "S01E02",
    };

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            info: {
              count: 1,
              pages: 1,
              next: null,
              prev: null,
            },
            results: [character],
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([episode1, episode2]),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      ) as any;

    mockPrisma.episode.upsert
      .mockResolvedValueOnce({
        id: 10,
        externalId: 1,
      })
      .mockResolvedValueOnce({
        id: 11,
        externalId: 2,
      });

    mockPrisma.location.upsert.mockResolvedValue({
      id: 20,
      externalId: 1,
      name: "Earth",
    });

    mockPrisma.character.upsert.mockResolvedValue({
      id: 30,
      externalId: 1,
      name: "Rick Sanchez",
    });

    mockPrisma.characterEpisode.upsert.mockResolvedValue({});

    const result = await syncCharacters();

    expect(result).toEqual({
      synced: 1,
      episodes: 2,
      relationships: 2,
    });

    expect(mockPrisma.location.upsert).toHaveBeenCalledTimes(1);
    expect(mockPrisma.character.upsert).toHaveBeenCalledTimes(1);
    expect(mockPrisma.episode.upsert).toHaveBeenCalledTimes(2);
    expect(mockPrisma.characterEpisode.upsert).toHaveBeenCalledTimes(2);
  });

  it("should synchronize a character without a location", async () => {
    const character = {
      id: 2,
      name: "Morty Smith",
      status: "Alive",
      species: "Human",
      type: "",
      gender: "Male",
      image: "https://example.com/morty.png",
      location: {
        name: "unknown",
        url: "",
      },
      episode: [],
    };

    global.fetch = jest.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          info: {
            count: 1,
            pages: 1,
            next: null,
            prev: null,
          },
          results: [character],
        }),
      ),
    ) as any;

    mockPrisma.character.upsert.mockResolvedValue({
      id: 40,
      externalId: 2,
      name: "Morty Smith",
    });

    const result = await syncCharacters();

    expect(result).toEqual({
      synced: 1,
      episodes: 0,
      relationships: 0,
    });

    expect(mockPrisma.location.upsert).not.toHaveBeenCalled();
    expect(mockPrisma.character.upsert).toHaveBeenCalledTimes(1);
  });

  it("should fetch characters from multiple pages", async () => {
    const character1 = {
      id: 1,
      name: "Rick Sanchez",
      status: "Alive",
      species: "Human",
      type: "",
      gender: "Male",
      image: "rick.png",
      location: {
        name: "unknown",
        url: "",
      },
      episode: [],
    };

    const character2 = {
      id: 2,
      name: "Morty Smith",
      status: "Alive",
      species: "Human",
      type: "",
      gender: "Male",
      image: "morty.png",
      location: {
        name: "unknown",
        url: "",
      },
      episode: [],
    };

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            info: {
              count: 2,
              pages: 2,
              next: "https://rickandmortyapi.com/api/character?page=2",
              prev: null,
            },
            results: [character1],
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            info: {
              count: 2,
              pages: 2,
              next: null,
              prev: "https://rickandmortyapi.com/api/character?page=1",
            },
            results: [character2],
          }),
        ),
      );

    global.fetch = fetchMock as any;

    mockPrisma.character.upsert
      .mockResolvedValueOnce({
        id: 1,
        externalId: 1,
        name: "Rick Sanchez",
      })
      .mockResolvedValueOnce({
        id: 2,
        externalId: 2,
        name: "Morty Smith",
      });

    const result = await syncCharacters();

    expect(fetchMock).toHaveBeenCalledTimes(2);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://rickandmortyapi.com/api/character?page=1",
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://rickandmortyapi.com/api/character?page=2",
    );

    expect(result.synced).toBe(2);
  });

  it("should fetch each episode only once when multiple characters share it", async () => {
    const character1 = {
      id: 1,
      name: "Rick Sanchez",
      status: "Alive",
      species: "Human",
      type: "",
      gender: "Male",
      image: "rick.png",
      location: {
        name: "unknown",
        url: "",
      },
      episode: ["https://rickandmortyapi.com/api/episode/1"],
    };

    const character2 = {
      id: 2,
      name: "Morty Smith",
      status: "Alive",
      species: "Human",
      type: "",
      gender: "Male",
      image: "morty.png",
      location: {
        name: "unknown",
        url: "",
      },
      episode: ["https://rickandmortyapi.com/api/episode/1"],
    };

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            info: {
              count: 2,
              pages: 1,
              next: null,
              prev: null,
            },
            results: [character1, character2],
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 1,
            name: "Pilot",
            air_date: "December 2, 2013",
            episode: "S01E01",
          }),
        ),
      );

    global.fetch = fetchMock as any;

    mockPrisma.episode.upsert.mockResolvedValue({
      id: 10,
      externalId: 1,
    });

    mockPrisma.character.upsert
      .mockResolvedValueOnce({
        id: 20,
        externalId: 1,
        name: "Rick Sanchez",
      })
      .mockResolvedValueOnce({
        id: 21,
        externalId: 2,
        name: "Morty Smith",
      });

    mockPrisma.characterEpisode.upsert.mockResolvedValue({});

    const result = await syncCharacters();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(mockPrisma.episode.upsert).toHaveBeenCalledTimes(1);
    expect(mockPrisma.characterEpisode.upsert).toHaveBeenCalledTimes(2);

    expect(result).toEqual({
      synced: 2,
      episodes: 1,
      relationships: 2,
    });
  });

  it("should throw when the external API returns a non-429 error", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(null, {
        status: 500,
      }),
    ) as any;

    await expect(syncCharacters()).rejects.toThrow(
      "External API request failed: 500",
    );

    expect(mockPrisma.character.upsert).not.toHaveBeenCalled();
    expect(mockPrisma.episode.upsert).not.toHaveBeenCalled();
  });

  it("should retry when the external API returns 429", async () => {
    jest.useFakeTimers();

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(null, {
          status: 429,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            info: {
              count: 0,
              pages: 1,
              next: null,
              prev: null,
            },
            results: [],
          }),
        ),
      );

    global.fetch = fetchMock as any;

    const promise = syncCharacters();

    await jest.advanceTimersByTimeAsync(2000);

    const result = await promise;

    expect(fetchMock).toHaveBeenCalledTimes(2);

    expect(result).toEqual({
      synced: 0,
      episodes: 0,
      relationships: 0,
    });

    jest.useRealTimers();
  });

  it("should fail after three 429 responses", async () => {
    jest.useFakeTimers();

    try {
      const fetchMock = jest.fn().mockResolvedValue(
        new Response(null, {
          status: 429,
        }),
      );

      global.fetch = fetchMock as any;

      const promise = expect(syncCharacters()).rejects.toThrow(
        "External API rate limit exceeded after 3 attempts",
      );

      await jest.advanceTimersByTimeAsync(6000);

      await promise;

      expect(fetchMock).toHaveBeenCalledTimes(3);
    } finally {
      jest.useRealTimers();
    }
  });
});