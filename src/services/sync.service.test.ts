import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  location: {
    upsert: vi.fn(),
  },
  character: {
    upsert: vi.fn(),
  },
  episode: {
    upsert: vi.fn(),
  },
  characterEpisode: {
    upsert: vi.fn(),
  },
}));

vi.mock("../lib/prisma", () => ({
  prisma: prismaMock,
}));

import { syncCharacters } from "./sync.service";

describe("syncCharacters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    vi.stubGlobal(
      "fetch",
      vi
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
        ),
    );

    prismaMock.episode.upsert
      .mockResolvedValueOnce({
        id: 10,
        externalId: 1,
      })
      .mockResolvedValueOnce({
        id: 11,
        externalId: 2,
      });

    prismaMock.location.upsert.mockResolvedValue({
      id: 20,
      externalId: 1,
      name: "Earth",
    });

    prismaMock.character.upsert.mockResolvedValue({
      id: 30,
      externalId: 1,
      name: "Rick Sanchez",
    });

    prismaMock.characterEpisode.upsert.mockResolvedValue({});

    const result = await syncCharacters();

    expect(result).toEqual({
      synced: 1,
      episodes: 2,
      relationships: 2,
    });

    expect(prismaMock.location.upsert).toHaveBeenCalledTimes(1);
    expect(prismaMock.character.upsert).toHaveBeenCalledTimes(1);
    expect(prismaMock.episode.upsert).toHaveBeenCalledTimes(2);
    expect(
      prismaMock.characterEpisode.upsert,
    ).toHaveBeenCalledTimes(2);
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

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
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
      ),
    );

    prismaMock.character.upsert.mockResolvedValue({
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

    expect(prismaMock.location.upsert).not.toHaveBeenCalled();

    expect(prismaMock.character.upsert).toHaveBeenCalledTimes(1);
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

    const fetchMock = vi
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

    vi.stubGlobal("fetch", fetchMock);

    prismaMock.character.upsert
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
      episode: [
        "https://rickandmortyapi.com/api/episode/1",
      ],
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
      episode: [
        "https://rickandmortyapi.com/api/episode/1",
      ],
    };

    const fetchMock = vi
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

    vi.stubGlobal("fetch", fetchMock);

    prismaMock.episode.upsert.mockResolvedValue({
      id: 10,
      externalId: 1,
    });

    prismaMock.character.upsert
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

    prismaMock.characterEpisode.upsert.mockResolvedValue({});

    const result = await syncCharacters();

    expect(fetchMock).toHaveBeenCalledTimes(2);

    expect(prismaMock.episode.upsert).toHaveBeenCalledTimes(1);

    expect(
      prismaMock.characterEpisode.upsert,
    ).toHaveBeenCalledTimes(2);

    expect(result).toEqual({
      synced: 2,
      episodes: 1,
      relationships: 2,
    });
  });

  it("should throw when the external API returns a non-429 error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 500,
        }),
      ),
    );

    await expect(
      syncCharacters(),
    ).rejects.toThrow(
      "External API request failed: 500",
    );

    expect(prismaMock.character.upsert).not.toHaveBeenCalled();
    expect(prismaMock.episode.upsert).not.toHaveBeenCalled();
  });

  it("should retry when the external API returns 429", async () => {
    vi.useFakeTimers();

    const fetchMock = vi
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

    vi.stubGlobal("fetch", fetchMock);

    const promise = syncCharacters();

    await vi.advanceTimersByTimeAsync(2000);

    const result = await promise;

    expect(fetchMock).toHaveBeenCalledTimes(2);

    expect(result).toEqual({
      synced: 0,
      episodes: 0,
      relationships: 0,
    });

    vi.useRealTimers();
  });

  it("should fail after three 429 responses", async () => {
    vi.useFakeTimers();

    try {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(
          new Response(null, {
            status: 429,
          }),
        );

      vi.stubGlobal("fetch", fetchMock);

      const promise = expect(
        syncCharacters(),
      ).rejects.toThrow(
        "External API rate limit exceeded after 3 attempts",
      );

      await vi.advanceTimersByTimeAsync(6000);

      await promise;

      expect(fetchMock).toHaveBeenCalledTimes(3);
    } finally {
      vi.useRealTimers();
    }
  });
});