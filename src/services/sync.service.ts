import { prisma } from "../lib/prisma";

const RICK_AND_MORTY_API = "https://rickandmortyapi.com/api";

interface RickAndMortyCharacter {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  image: string;
  location: {
    name: string;
    url: string;
  };
  episode: string[];
}

interface RickAndMortyResponse {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: RickAndMortyCharacter[];
}

interface RickAndMortyEpisode {
  id: number;
  name: string;
  air_date: string;
  episode: string;
}

export async function syncCharacters() {
  // -------------------------
  // 1. GET ALL CHARACTERS
  // -------------------------

  const characters = await fetchAllCharacters();

  console.log(
    `Found ${characters.length} characters`,
  );

  // -------------------------
  // 2. COLLECT EPISODE IDS
  // -------------------------

  const episodeIds = new Set<number>();

  for (const character of characters) {
    for (const episodeUrl of character.episode) {
      episodeIds.add(getExternalId(episodeUrl));
    }
  }

  console.log(
    `Found ${episodeIds.size} unique episodes`,
  );

  // -------------------------
  // 3. GET EPISODES
  // -------------------------

  const episodes = await fetchEpisodes(
    Array.from(episodeIds),
  );

  // -------------------------
  // 4. SAVE EPISODES
  // -------------------------

  const episodeMap = new Map<number, number>();

  for (const episode of episodes) {
    const savedEpisode = await prisma.episode.upsert({
      where: {
        externalId: episode.id,
      },

      update: {
        name: episode.name,
        airDate: episode.air_date,
        episodeCode: episode.episode,
      },

      create: {
        externalId: episode.id,
        name: episode.name,
        airDate: episode.air_date,
        episodeCode: episode.episode,
      },
    });

    episodeMap.set(
      episode.id,
      savedEpisode.id,
    );
  }

  // -------------------------
  // 5. SAVE CHARACTERS
  // -------------------------

  for (const character of characters) {
    let locationId: number | undefined;

    if (
      character.location.name !== "unknown" &&
      character.location.url
    ) {
      const locationExternalId =
        getExternalId(character.location.url);

      const location =
        await prisma.location.upsert({
          where: {
            externalId: locationExternalId,
          },

          update: {
            name: character.location.name,
          },

          create: {
            externalId: locationExternalId,
            name: character.location.name,
          },
        });

      locationId = location.id;
    }

    const savedCharacter =
      await prisma.character.upsert({
        where: {
          externalId: character.id,
        },

        update: {
          name: character.name,
          status: character.status,
          species: character.species,
          type: character.type || null,
          gender: character.gender,
          image: character.image,
          locationId,
        },

        create: {
          externalId: character.id,
          name: character.name,
          status: character.status,
          species: character.species,
          type: character.type || null,
          gender: character.gender,
          image: character.image,
          locationId,
        },
      });

    // -------------------------
    // 6. CHARACTER ↔ EPISODE
    // -------------------------

    for (const episodeUrl of character.episode) {
      const externalEpisodeId =
        getExternalId(episodeUrl);

      const episodeId = episodeMap.get(
        externalEpisodeId,
      );

      if (!episodeId) {
        continue;
      }

      await prisma.characterEpisode.upsert({
        where: {
          characterId_episodeId: {
            characterId: savedCharacter.id,
            episodeId,
          },
        },

        update: {},

        create: {
          characterId: savedCharacter.id,
          episodeId,
        },
      });
    }

    console.log(
      `Synced character: ${savedCharacter.name}`,
    );
  }

  return {
    synced: characters.length,
    episodes: episodes.length,
  };
}

// -------------------------
// FETCH ALL CHARACTERS
// -------------------------

async function fetchAllCharacters(): Promise<
  RickAndMortyCharacter[]
> {
  const characters: RickAndMortyCharacter[] = [];

  let nextUrl:
    | string
    | null = `${RICK_AND_MORTY_API}/character?page=1`;

  while (nextUrl) {
    const response = await fetch(nextUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch characters: ${response.status}`,
      );
    }

    const data =
      (await response.json()) as RickAndMortyResponse;

    characters.push(...data.results);

    nextUrl = data.info.next;
  }

  return characters;
}

// -------------------------
// FETCH EPISODES
// -------------------------

async function fetchEpisodes(
  ids: number[],
): Promise<RickAndMortyEpisode[]> {
  if (ids.length === 0) {
    return [];
  }

  const url =
    `${RICK_AND_MORTY_API}/episode/` +
    ids.join(",");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch episodes: ${response.status}`,
    );
  }

  const data =
    (await response.json()) as
      | RickAndMortyEpisode
      | RickAndMortyEpisode[];

  return Array.isArray(data)
    ? data
    : [data];
}

// -------------------------
// GET EXTERNAL ID
// -------------------------

function getExternalId(url: string): number {
  const id = Number(
    url.split("/").pop(),
  );

  if (
    !Number.isInteger(id) ||
    id < 1
  ) {
    throw new Error(
      `Invalid Rick and Morty URL: ${url}`,
    );
  }

  return id;
}