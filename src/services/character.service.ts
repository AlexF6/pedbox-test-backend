import { prisma } from "../lib/prisma";

interface GetCharactersParams {
  page: number;
  limit: number;
  name?: string;
  status?: string;
  species?: string;
  gender?: string;
}

export async function getCharacters({
  page,
  limit,
  name,
  status,
  species,
  gender,
}: GetCharactersParams) {
  const skip = (page - 1) * limit;

  const where = {
    ...(name && {
      name: {
        contains: name,
        mode: "insensitive" as const,
      },
    }),

    ...(status && {
      status: {
        equals: status,
        mode: "insensitive" as const,
      },
    }),

    ...(species && {
      species: {
        equals: species,
        mode: "insensitive" as const,
      },
    }),

    ...(gender && {
      gender: {
        equals: gender,
        mode: "insensitive" as const,
      },
    }),
  };

  const [
    characters,
    total,
  ] = await Promise.all([
    prisma.character.findMany({
      where,
      skip,
      take: limit,

      include: {
        location: true,
      },

      orderBy: {
        id: "asc",
      },
    }),

    prisma.character.count({
      where,
    }),
  ]);

  return {
    data: characters,

    pagination: {
      page,
      limit,
      total,
      totalPages:
        Math.ceil(total / limit),
    },

    filters: {
      name: name ?? null,
      status: status ?? null,
      species: species ?? null,
      gender: gender ?? null,
    },
  };
}

export async function getCharacterById(
  id: number,
) {
  return prisma.character.findUnique({
    where: {
      id,
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
}