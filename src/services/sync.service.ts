import { prisma } from "../lib/prisma";

const RICK_AND_MORTY_API =
  "https://rickandmortyapi.com/api";

const REQUEST_DELAY_MS = 500;

/**
 * Character returned by the Rick and Morty API.
 */
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

/**
 * Paginated response returned by the API.
 */
interface RickAndMortyResponse {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: RickAndMortyCharacter[];
}

/**
 * Episode returned by the Rick and Morty API.
 */
interface RickAndMortyEpisode {
  id: number;
  name: string;
  air_date: string;
  episode: string;
}

/**
 * Synchronizes characters, locations and episodes
 * from the Rick and Morty API.
 */
export async function syncCharacters() {
  console.log("Starting Rick and Morty synchronization...");

  // --------------------------------------------------
  // 1. FETCH ALL CHARACTERS
  // --------------------------------------------------

  const characters = await fetchAllCharacters();

  console.log(
    `Fetched ${characters.length} characters`,
  );

  // --------------------------------------------------
  // 2. COLLECT UNIQUE EPISODE IDS
  // --------------------------------------------------

  const episodeIds = collectEpisodeIds(characters);

  console.log(
    `Found ${episodeIds.size} unique episodes`,
  );

  // --------------------------------------------------
  // 3. FETCH EPISODES
  // --------------------------------------------------

  const episodes = await fetchEpisodes(
    Array.from(episodeIds),
  );

  console.log(
    `Fetched ${episodes.length} episodes`,
  );

  // --------------------------------------------------
  // 4. SAVE EPISODES
  // --------------------------------------------------

  const episodeMap = await saveEpisodes(
    episodes,
  );

  // --------------------------------------------------
  // 5. SAVE CHARACTERS AND LOCATIONS
  // --------------------------------------------------

  let syncedCharacters = 0;
  let syncedRelationships = 0;

  for (const character of characters) {
    let locationId: number | undefined;

    // ----------------------------------------------
    // Save location
    // ----------------------------------------------

    if (
      character.location.name !== "unknown" &&
      character.location.url
    ) {
      const locationExternalId =
        getExternalId(
          character.location.url,
        );

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

    // ----------------------------------------------
    // Save character
    // ----------------------------------------------

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

    syncedCharacters++;

    // ----------------------------------------------
    // Save Character ↔ Episode relationships
    // ----------------------------------------------

    for (const episodeUrl of character.episode) {
      const externalEpisodeId =
        getExternalId(episodeUrl);

      const episodeId =
        episodeMap.get(externalEpisodeId);

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

      syncedRelationships++;
    }

    console.log(
      `Synced character: ${savedCharacter.name}`,
    );
  }

  console.log(
    "Rick and Morty synchronization completed",
  );

  return {
    synced: syncedCharacters,
    episodes: episodes.length,
    relationships: syncedRelationships,
  };
}

/**
 * Fetches all character pages from the
 * Rick and Morty API.
 */
async function fetchAllCharacters(): Promise<
  RickAndMortyCharacter[]
> {
  const characters: RickAndMortyCharacter[] = [];

  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    console.log(
      `Fetching character page ${page}...`,
    );

    const data =
      await fetchWithRetry<RickAndMortyResponse>(
        `${RICK_AND_MORTY_API}/character?page=${page}`,
      );

    characters.push(...data.results);

    hasNextPage =
      data.info.next !== null;

    page++;

    // Avoid hitting the external API too quickly.
    if (hasNextPage) {
      await delay(REQUEST_DELAY_MS);
    }
  }

  return characters;
}

/**
 * Extracts unique episode IDs from characters.
 */
function collectEpisodeIds(
  characters: RickAndMortyCharacter[],
): Set<number> {
  const episodeIds = new Set<number>();

  for (const character of characters) {
    for (const episodeUrl of character.episode) {
      episodeIds.add(
        getExternalId(episodeUrl),
      );
    }
  }

  return episodeIds;
}

/**
 * Saves episodes to the database and returns
 * a map between external API IDs and local IDs.
 */
async function saveEpisodes(
  episodes: RickAndMortyEpisode[],
): Promise<Map<number, number>> {
  const episodeMap =
    new Map<number, number>();

  for (const episode of episodes) {
    const savedEpisode =
      await prisma.episode.upsert({
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

  return episodeMap;
}

/**
 * Fetches episodes from the API.
 *
 * The Rick and Morty API allows multiple episode IDs
 * in a single request. We split them into batches to
 * avoid excessively large requests.
 */
async function fetchEpisodes(
  ids: number[],
): Promise<RickAndMortyEpisode[]> {
  if (ids.length === 0) {
    return [];
  }

  const episodes: RickAndMortyEpisode[] = [];

  const BATCH_SIZE = 20;

  for (
    let i = 0;
    i < ids.length;
    i += BATCH_SIZE
  ) {
    const batch = ids.slice(
      i,
      i + BATCH_SIZE,
    );

    console.log(
      `Fetching episodes ${i + 1}-${Math.min(
        i + BATCH_SIZE,
        ids.length,
      )} of ${ids.length}...`,
    );

    const url =
      `${RICK_AND_MORTY_API}/episode/` +
      batch.join(",");

    const data =
      await fetchWithRetry<
        | RickAndMortyEpisode
        | RickAndMortyEpisode[]
      >(url);

    if (Array.isArray(data)) {
      episodes.push(...data);
    } else {
      episodes.push(data);
    }

    if (
      i + BATCH_SIZE <
      ids.length
    ) {
      await delay(REQUEST_DELAY_MS);
    }
  }

  return episodes;
}

/**
 * Generic fetch helper with retry support.
 *
 * Particularly useful for HTTP 429 responses
 * from the external API.
 */
async function fetchWithRetry<T>(
  url: string,
  retries = 3,
): Promise<T> {
  for (
    let attempt = 1;
    attempt <= retries;
    attempt++
  ) {
    const response = await fetch(url);

    if (response.ok) {
      return (await response.json()) as T;
    }

    // Rate limit
    if (response.status === 429) {
      if (attempt === retries) {
        throw new Error(
          `External API rate limit exceeded after ${retries} attempts`,
        );
      }

      const retryAfter =
        response.headers.get(
          "retry-after",
        );

      const retryDelay = retryAfter
        ? Number(retryAfter) * 1000
        : attempt * 2000;

      console.warn(
        `Rate limited by Rick and Morty API. Retrying in ${retryDelay}ms...`,
      );

      await delay(retryDelay);

      continue;
    }

    throw new Error(
      `External API request failed: ${response.status}`,
    );
  }

  throw new Error(
    "External API request failed",
  );
}

/**
 * Extracts the external ID from a Rick and Morty API URL.
 */
function getExternalId(
  url: string,
): number {
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

/**
 * Creates a delay.
 */
function delay(
  milliseconds: number,
): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(
      resolve,
      milliseconds,
    ),
  );
}