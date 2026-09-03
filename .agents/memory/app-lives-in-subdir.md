---
name: App lives in AI-Profit-Funnel/ subdir; tool CWDs differ
description: Path gotcha — sandbox tools and package callbacks may target repo root while the app is one level down.
---

# The app is in AI-Profit-Funnel/, but some tools run from repo root

The Vite/Express app root is `AI-Profit-Funnel/`. The `code_execution` sandbox and the
image generation callbacks (`generateImage`) resolve relative `outputPath`s against the
REPO ROOT (`/home/runner/workspace`), NOT against `AI-Profit-Funnel/`.

**Symptom:** Generating to `client/public/assets/...` from code_execution silently
creates `/home/runner/workspace/client/public/...`, and the app shows broken images
because the real public dir is `AI-Profit-Funnel/client/public/assets/`.

**How to apply:** After generating media via the sandbox, move files into
`AI-Profit-Funnel/client/public/assets/...` (served at `/assets/...`). Vite only picks
up new files in `public/` after a workflow restart. Heavy generated PNGs (~1.5 MB) are
too big for the web — downscale + convert to JPEG with ImageMagick (`mogrify -resize
600x -strip -quality ~82 -format jpg`) before shipping; `sharp` is not installed but
`convert`/`mogrify` are.

Package-management callbacks can also resolve the repository root instead of the app
root. An app dependency installed there can pull in duplicate framework typings and
break TypeScript even though the runtime package exists.

**Why:** A server upload package installed at repository root introduced a second
Express type tree that was incompatible with the app's Express 4 types.

**How to apply:** After any package operation, verify which `package.json` and lockfile
changed before importing the dependency. Remove a misplaced package through the same
package-management callback rather than leaving root and app dependency trees mixed.
