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
 * its deployed demo. Resolves to an empty array instead of throwing so
 * a flaky third-party API never fails the build.
 */
export async function getPinnedRepos(username: string): Promise<PinnedRepo[]> {
  try {
    const response = await fetch(
      `https://pinned.berrysauce.dev/get/${username}`
    );
    if (!response.ok) return [];

    const repos: BerrysaucePinnedRepo[] = await response.json();
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
        } catch {
          website = undefined;
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
  } catch {
    return [];
  }
}
