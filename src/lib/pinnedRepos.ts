export interface PinnedRepo {
  repo: string;
  description: string;
  language: string;
  link: string;
  website?: string;
  image: string;
}

interface BerrysaucePinnedRepo {
  author: string;
  name: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
}

/**
 * Fetches a GitHub user's pinned repositories via the Pinned API
 * (https://github.com/berrysauce/pinned), enriches each with its GitHub
 * "homepage" URL (Pinned's own schema doesn't include one), and drops
 * that URL unless it actually responds with 2xx — a repo can outlive
 * its deployed demo.
 *
 * Throws when the pinned list itself cannot be obtained. Returning an
 * empty array would build a green image whose home page silently ships
 * with no projects at all; a failed build keeps the previous deployment
 * serving and surfaces as a deployment alert instead.
 *
 * The per-repo GitHub enrichment is allowed to fail: an unauthenticated
 * API is rate limited at 60 requests/hour per IP, and losing a "live
 * preview" link is not worth blocking a release over.
 */
export async function getPinnedRepos(username: string): Promise<PinnedRepo[]> {
  const response = await fetch(`https://pinned.berrysauce.dev/get/${username}`);
  if (!response.ok) {
    throw new Error(
      `Pinned API returned ${response.status} for ${username}; refusing to build a home page with no projects.`
    );
  }

  const repos: BerrysaucePinnedRepo[] = await response.json();
  if (repos.length === 0) {
    throw new Error(
      `Pinned API returned no repositories for ${username}; refusing to build a home page with no projects.`
    );
  }

  return Promise.all(
    repos.map(async (repo) => {
      let website: string | undefined;
      try {
        const repoResponse = await fetch(
          `https://api.github.com/repos/${repo.author}/${repo.name}`,
          {
            headers: {
              "User-Agent": "portfolio-build",
              Accept: "application/vnd.github+json",
            },
          }
        );
        const homepage: string | undefined = repoResponse.ok
          ? (await repoResponse.json()).homepage || undefined
          : undefined;

        if (homepage) {
          const liveCheck = await fetch(homepage, {
            method: "GET",
            redirect: "follow",
            signal: AbortSignal.timeout(5000),
          });
          liveCheck.body?.cancel();
          website = liveCheck.ok ? homepage : undefined;
        }
      } catch (error) {
        console.warn(
          `[pinnedRepos] no live website resolved for ${repo.author}/${repo.name}:`,
          error instanceof Error ? error.message : error
        );
      }

      return {
        repo: repo.name,
        description: repo.description,
        language: repo.language,
        link: `https://github.com/${repo.author}/${repo.name}`,
        image: `https://opengraph.githubassets.com/1/${repo.author}/${repo.name}`,
        website,
      };
    })
  );
}
