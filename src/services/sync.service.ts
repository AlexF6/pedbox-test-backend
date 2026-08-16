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
  // 1. GET CHARACTERS
  // -------------------------

  const response = await fetch(
    `${RICK_AND_MORTY_API}/character?page=1`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch characters");
  }

  const data =
    (await response.json()) as RickAndMortyResponse;

  const characters = data.results;

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
      const location = await prisma.location.upsert({
        where: {
          externalId: getExternalId(
            character.location.url,
          ),
        },
        update: {
          name: character.location.name,
        },
        create: {
          externalId: getExternalId(
            character.location.url,
          ),
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

async function fetchEpisodes(
  ids: number[],
): Promise<RickAndMortyEpisode[]> {
  if (ids.length === 0) {
    return [];
  }

  const url = `${RICK_AND_MORTY_API}/episode/${ids.join(",")}`;

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

  return Array.isArray(data) ? data : [data];
}

function getExternalId(url: string): number {
  const id = url.split("/").pop();

  if (!id) {
    throw new Error(
      `Invalid Rick and Morty URL: ${url}`,
    );
  }

  return Number(id);
}