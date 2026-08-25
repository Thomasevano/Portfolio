export interface PinnedRepo {
  repo: string;
  description: string;
  language: string;
  link: string;
  website?: string;
  image: string;
}

interface GitHubResponse {
  data?: {
    user?: {
      pinnedItems: {
        nodes: Array<{
          name: string;
          description: string | null;
          homepageUrl: string | null;
          primaryLanguage: { name: string } | null;
          url: string;
          owner: { login: string };
        }>;
      };
    };
  };
  errors?: Array<{ message: string }>;
}

const pinnedRepositoriesQuery = `
  query PinnedRepositories($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            homepageUrl
            primaryLanguage { name }
            url
            owner { login }
          }
        }
      }
    }
  }
`;

export async function getPinnedRepos(username: string): Promise<PinnedRepo[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is required to build the project list.");
  }

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: pinnedRepositoriesQuery,
      variables: { login: username },
    }),
  });
  const result: GitHubResponse = await response.json();

  if (!response.ok || result.errors?.length || !result.data?.user) {
    throw new Error(
      `GitHub GraphQL query failed: ${result.errors?.map((error) => error.message).join(", ") || response.status}`
    );
  }

  const repos = result.data.user.pinnedItems.nodes;
  if (!repos.length) {
    throw new Error(`GitHub returned no pinned repositories for ${username}.`);
  }

  return repos.map((repo) => ({
    repo: repo.name,
    description: repo.description ?? "",
    language: repo.primaryLanguage?.name ?? "Unknown",
    link: repo.url,
    image: `https://opengraph.githubassets.com/1/${repo.owner.login}/${repo.name}`,
    website: repo.homepageUrl || undefined,
  }));
}
