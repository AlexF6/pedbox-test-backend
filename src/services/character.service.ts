import { prisma } from "../lib/prisma";

interface GetCharactersParams {
  page: number;
  limit: number;
}

export async function getCharacters({
  page,
  limit,
}: GetCharactersParams) {
  const skip = (page - 1) * limit;

  const [characters, total] = await Promise.all([
    prisma.character.findMany({
      skip,
      take: limit,
      orderBy: {
        id: "asc",
      },
      include: {
        location: true,
      },
    }),

    prisma.character.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: characters,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export async function getCharacterById(id: number) {
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