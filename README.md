# thomasevano.fr

Bilingual personal site and technical blog for Thomas Evano, built with Astro.

## Requirements

- Node.js 22.12 or newer
- pnpm 11

## Commands

Run from the repository root:

| Command | Purpose |
| --- | --- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start the local development server |
| `pnpm check` | Run Astro and TypeScript diagnostics |
| `pnpm build` | Generate the production site in `dist/` |
| `pnpm preview` | Serve the production build locally |

The production build is self-contained and does not require a GitHub token.

## Content

- Recruiter-facing FR/EN copy: `src/i18n/ui.ts`
- Contact links: `src/content/data/aboutMe.json`
- Curated project presentation: `src/components/Projects.astro`
- Blog posts: `src/content/posts/{fr,en}`

Project images and résumé PDFs are local assets, so the production site does not depend on remote files. The published résumés live at `public/resume/thomas-evano-cv.pdf` (French) and `public/resume/thomas-evano-resume.pdf` (English).
