import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const prismaMock = vi.hoisted(() => ({
  character: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
  },
}));

vi.mock("../lib/prisma", () => ({
  prisma: prismaMock,
}));

import {
  getCharacters,
  getCharacterById,
} from "./character.service";

describe("getCharacters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return paginated characters", async () => {
    const characters = [
      {
        id: 1,
        externalId: 1,
        name: "Rick Sanchez",
        status: "Alive",
        species: "Human",
        type: "",
        gender: "Male",
        image: "rick.png",
        locationId: 1,
        location: {
          id: 1,
          externalId: 1,
          name: "Earth",
          type: "Planet",
          dimension: "Dimension C-137",
        },
      },
      {
        id: 2,
        externalId: 2,
        name: "Morty Smith",
        status: "Alive",
        species: "Human",
        type: "",
        gender: "Male",
        image: "morty.png",
        locationId: 1,
        location: {
          id: 1,
          externalId: 1,
          name: "Earth",
          type: "Planet",
          dimension: "Dimension C-137",
        },
      },
    ];

    prismaMock.character.findMany.mockResolvedValue(
      characters,
    );

    prismaMock.character.count.mockResolvedValue(826);

    const result = await getCharacters({
      page: 1,
      limit: 2,
    });

    expect(result).toEqual({
      data: characters,
      pagination: {
        page: 1,
        limit: 2,
        total: 826,
        totalPages: 413,
      },
      filters: {
        name: null,
        status: null,
        species: null,
        gender: null,
      },
    });

    expect(
      prismaMock.character.findMany,
    ).toHaveBeenCalledTimes(1);

    expect(
      prismaMock.character.count,
    ).toHaveBeenCalledTimes(1);
  });

  it("should calculate pagination correctly", async () => {
    prismaMock.character.findMany.mockResolvedValue([]);

    prismaMock.character.count.mockResolvedValue(50);

    const result = await getCharacters({
      page: 3,
      limit: 10,
    });

    expect(
      prismaMock.character.findMany,
    ).toHaveBeenCalledWith({
      where: {},
      skip: 20,
      take: 10,
      include: {
        location: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    expect(
      prismaMock.character.count,
    ).toHaveBeenCalledWith({
      where: {},
    });

    expect(result.pagination).toEqual({
      page: 3,
      limit: 10,
      total: 50,
      totalPages: 5,
    });
  });

  it("should filter characters by name", async () => {
    prismaMock.character.findMany.mockResolvedValue([]);

    prismaMock.character.count.mockResolvedValue(1);

    await getCharacters({
      page: 1,
      limit: 20,
      name: "rick",
    });

    expect(
      prismaMock.character.findMany,
    ).toHaveBeenCalledWith({
      where: {
        name: {
          contains: "rick",
          mode: "insensitive",
        },
      },
      skip: 0,
      take: 20,
      include: {
        location: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    expect(
      prismaMock.character.count,
    ).toHaveBeenCalledWith({
      where: {
        name: {
          contains: "rick",
          mode: "insensitive",
        },
      },
    });
  });

  it("should apply multiple filters", async () => {
    prismaMock.character.findMany.mockResolvedValue([]);

    prismaMock.character.count.mockResolvedValue(2);

    await getCharacters({
      page: 2,
      limit: 10,
      name: "rick",
      status: "alive",
      species: "human",
      gender: "male",
    });

    expect(
      prismaMock.character.findMany,
    ).toHaveBeenCalledWith({
      where: {
        name: {
          contains: "rick",
          mode: "insensitive",
        },
        status: {
          equals: "alive",
          mode: "insensitive",
        },
        species: {
          equals: "human",
          mode: "insensitive",
        },
        gender: {
          equals: "male",
          mode: "insensitive",
        },
      },
      skip: 10,
      take: 10,
      include: {
        location: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    expect(
      prismaMock.character.count,
    ).toHaveBeenCalledWith({
      where: {
        name: {
          contains: "rick",
          mode: "insensitive",
        },
        status: {
          equals: "alive",
          mode: "insensitive",
        },
        species: {
          equals: "human",
          mode: "insensitive",
        },
        gender: {
          equals: "male",
          mode: "insensitive",
        },
      },
    });
  });
  it("should not include undefined filters", async () => {
    prismaMock.character.findMany.mockResolvedValue([]);

    prismaMock.character.count.mockResolvedValue(826);

    await getCharacters({
      page: 1,
      limit: 20,
      name: undefined,
      status: undefined,
      species: undefined,
      gender: undefined,
    });

    expect(
      prismaMock.character.findMany,
    ).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 20,
      include: {
        location: true,
      },
      orderBy: {
        id: "asc",
      },
    });
  });

  it("should return an empty result when no characters are found", async () => {
    prismaMock.character.findMany.mockResolvedValue([]);

    prismaMock.character.count.mockResolvedValue(0);

    const result = await getCharacters({
      page: 1,
      limit: 20,
      name: "does-not-exist",
    });

    expect(result).toEqual({
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
      filters: {
        name: "does-not-exist",
        status: null,
        species: null,
        gender: null,
      },
    });
  });

describe("getCharacterById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a character with its location and episodes", async () => {
    const character = {
      id: 1,
      externalId: 1,
      name: "Rick Sanchez",
      status: "Alive",
      species: "Human",
      type: "",
      gender: "Male",
      image: "rick.png",
      locationId: 1,
      location: {
        id: 1,
        externalId: 1,
        name: "Earth",
      },
      characterEpisodes: [
        {
          characterId: 1,
          episodeId: 1,
          episode: {
            id: 1,
            externalId: 1,
            name: "Pilot",
            airDate: "December 2, 2013",
            episodeCode: "S01E01",
          },
        },
      ],
    };

    prismaMock.character.findUnique.mockResolvedValue(
      character,
    );

    const result = await getCharacterById(1);

    expect(result).toEqual(character);

    expect(
      prismaMock.character.findUnique,
    ).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      include: {
        location: true,
        characterEpisodes: {
          include: {
            episode: true,
          },
        },
      },
    });
  });

  it("should return null when the character does not exist", async () => {
      prismaMock.character.findUnique.mockResolvedValue(
        null,
      );

      const result = await getCharacterById(9999);

      expect(result).toBeNull();

      expect(
        prismaMock.character.findUnique,
      ).toHaveBeenCalledWith({
        where: {
          id: 9999,
        },
        include: {
          location: true,
          characterEpisodes: {
            include: {
              episode: true,
            },
          },
        },
      });
    });
  });

  it("should propagate database errors", async () => {
    const databaseError = new Error(
      "Database connection failed",
    );

    prismaMock.character.findMany.mockRejectedValue(
      databaseError,
    );

    prismaMock.character.count.mockResolvedValue(0);

    await expect(
      getCharacters({
        page: 1,
        limit: 20,
      }),
    ).rejects.toThrow(
      "Database connection failed",
    );
  });

  it("should propagate database errors when finding a character", async () => {
    const databaseError = new Error(
      "Database connection failed",
    );

    prismaMock.character.findUnique.mockRejectedValue(
      databaseError,
    );

    await expect(
      getCharacterById(1),
    ).rejects.toThrow(
      "Database connection failed",
    );
  });
});