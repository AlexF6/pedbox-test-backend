import { prisma } from "../lib/prisma";

export async function getCharacters(
  page: number,
  limit: number,
) {
  const skip = (page - 1) * limit;

  const [characters, total] = await Promise.all([
    prisma.character.findMany({
      skip,
      take: limit,
      include: {
        location: true,
      },
      orderBy: {
        id: "asc",
      },
    }),

    prisma.character.count(),
  ]);

  return {
    data: characters,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
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