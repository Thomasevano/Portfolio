---
title: Automatic pull request previews with Coolify and GitHub Actions
pubDate: 2026-07-30
description: On MusicKeeper, every pull request now automatically deploys a disposable preview running the real production Docker image, with its own end-to-end tests. Here's how I built it, and the Coolify gotcha that had me chasing a 502 for a while.
author: Thomas Evano
draft: true
tags:
  - musickeeper
  - coolify
  - github-action
  - buildinpublic
---

On MusicKeeper, until now, a pull request only told me two things: "the build passes" and "the unit tests pass". It never told me whether the application actually ran, with the real Docker image, on a real reachable URL. I wanted a real, disposable preview environment per pull request, using the exact image that would ship to production if I merged.

Since I already host MusicKeeper on [Coolify](https://coolify.io) (Cloud version), and MusicKeeper has no database (all user data lives in the browser's IndexedDB), the ground was pretty favorable: no migrations to run, no shared state to manage, a preview is fully disposable.

## The goal

For every pull request coming from the repository itself (not a fork, so I don't expose my secrets):

1. Build the production Docker image, using the exact same `Dockerfile` as the release build.
2. Push it to GHCR with a tag specific to that pull request.
3. Deploy that exact image to a dedicated Coolify preview application.
4. Wait for Coolify to confirm the deployment is finished.
5. Wait for the preview URL to answer with HTTP 200.
6. Run the existing Playwright suite against that preview URL, not against a local server.
7. Comment on the pull request with the preview URL and the image tag used.
8. Delete the Coolify preview when the pull request closes or merges.

The important part: this is not a build test, it's a production test. If the image runs, answers, and passes the end-to-end suite on its public URL, then I know what will actually be deployed works.

## Why not use Coolify's native previews

Coolify already knows how to create previews automatically for pull requests, but in its native Git-based mode: it rebuilds the image itself from source, for every preview. That wasn't what I wanted, for two reasons:

- It duplicates a build GitHub Actions already does for the release, and it burns resources on my Coolify Cloud instance for nothing.
- More importantly, it tests a different image than the one that will actually ship. A preview that builds its own artifact doesn't guarantee the release image itself works.

Coolify has a second, less documented mode: if the application is configured as a **Docker Image** application (instead of a Git repository), the deployment API accepts two extra parameters, `pr` and `docker_tag`, which create the preview on the fly from an already-built image. Nothing needs to pre-exist on Coolify's side, the API call creates the preview itself. That's exactly what I needed: GitHub Actions builds the image, GitHub Actions tells Coolify "deploy this tag for this pull request", and Coolify handles the rest.

## The GitHub Actions workflow

The image tag contains both the pull request number and the commit SHA:

```yaml
- name: Compute image tag
  id: tag
  env:
    HEAD_SHA: ${{ github.event.pull_request.head.sha }}
    PR: ${{ github.event.pull_request.number }}
  run: echo "docker_tag=pr-${PR}-${HEAD_SHA:0:7}" >> "$GITHUB_OUTPUT"
```

That's intentional: a mutable tag like `pr-35` risks Coolify redeploying a cached image instead of the latest commit. Including the SHA means every push produces a different tag, so Coolify is forced to pull the new image.

Once the image is pushed to GHCR, the deploy call looks like this:

```bash
curl -sS -X POST \
  -H "Authorization: Bearer ${COOLIFY_TOKEN}" \
  "${COOLIFY_URL}/api/v1/deploy?uuid=${APP_UUID}&pr=${PR}&docker_tag=${DOCKER_TAG}"
```

The workflow then polls the deployment status endpoint every 5 seconds until it gets `finished`, `failed`, or `cancelled-by-user`. Once the deployment is done, it loops a second time, but this time against the preview URL itself, until it gets an HTTP 200:

```bash
for _ in $(seq 1 60); do
  code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "${PREVIEW_URL}/" || echo 000)
  [ "${code}" = '200' ] && exit 0
  sleep 5
done
```

These are two different failure modes and they needed to be distinguished: Coolify can happily report "deployment finished" while the container crashes right after starting. Without this second check, the workflow would have announced success on a dead preview.

Once the URL answers, the existing Playwright suite runs directly against it, instead of against the local dev server:

```ts
// playwright.config.ts
webServer: process.env.PLAYWRIGHT_BASE_URL
  ? undefined
  : { command: 'pnpm dev', url: 'http://127.0.0.1:63136' },
baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:63136',
```

No duplicated test suite, no separate config: the same tests validate local dev and the production preview, only the target changes.

Finally, the pull request gets a comment with the preview URL and image tag, updated on every push instead of duplicated:

| | |
| --- | --- |
| URL | `https://pr-35.preview.musickeeper.app` |
| Image | `ghcr.io/thomasevano/musickeeper:pr-35-a1b2c3d` |

And when the pull request closes, one last API call deletes the preview on Coolify's side:

```bash
curl -X DELETE "${COOLIFY_URL}/api/v1/applications/${APP_UUID}/previews/${PR}"
```

## The gotcha: two separate sets of environment variables

Once all of this was wired up, the deployment finished cleanly, Coolify reported "finished", but the preview URL consistently returned `502 Bad Gateway`. I had copied the production application's configuration though, same environment variables, so in theory it should have just worked.

Looking at the container logs, the error was clear enough:

```text
Missing environment variable "APP_KEY"
```

Even though that variable was definitely set on the application. The detail I missed: in Coolify, an application has **two separate environment variable collections**, not one.

- **Production Environment Variables**
- **Preview Deployments Environment Variables**

The workflow sends `pr=<number>` to the deploy API, which explicitly tells Coolify this is a preview deployment. Coolify then reads the *preview* collection, not the *production* one, regardless of the application involved. Having an application entirely dedicated to previews doesn't change that: what determines which collection gets read is the `pr` parameter on the request, not the intended purpose of the application. Since I had only filled in the production section, the preview collection was empty, and the container exited before it could ever serve a request, hence the `502`.

The fix was simply to copy the required variables into the **Preview Deployments Environment Variables** section of the dedicated application:

```text
APP_KEY=<a-preview-specific-secret-different-from-prod>
LOG_LEVEL=info
MB_APP_CONTACT_EMAIL=preview@example.com
SESSION_DRIVER=cookie
PORT=8080
NODE_ENV=production
HOST=0.0.0.0
```

Once these variables were present, marked as Runtime Variable, the container started, the URL answered with 200, and the Playwright suite passed against the real preview. I also took the opportunity to use an `APP_KEY` different from production's, so the two environments don't share the same encryption key.

## What it looks like now

On every MusicKeeper pull request coming from the repository itself:

- A Docker image identical to a release build gets built and pushed.
- It's deployed to a deterministic URL: `pr-<number>.preview.musickeeper.app`.
- The end-to-end test suite runs against that real URL, not a mock.
- An automatic comment gives a direct link to try the pull request.
- Everything gets cleaned up automatically when it closes.

This is the kind of safety net I wish I'd had earlier: it turns "the build passes" into "the application actually works, over HTTPS, on its production image". I documented the full Coolify and GitHub configuration, along with the complete reproduction procedure, in [`docs/pr-previews.md`](https://github.com/Thomasevano/musickeeper/blob/main/docs/pr-previews.md) in the repository, so I don't have to rediscover all of it the next time I need to reproduce this on another project.

The whole thing is visible in [pull request #35](https://github.com/Thomasevano/musickeeper/pull/35), on the open source repository of [MusicKeeper](https://github.com/Thomasevano/musickeeper). Feel free to go check it out, and follow along as I build the project in public on Twitter [@tvn_dev](https://twitter.com/tvn_dev) and Bluesky [@tvn.dev](https://bsky.app/profile/tvn.dev).
</content>
