---
name: App lives in AI-Profit-Funnel/ subdir; tool CWDs differ
description: Path gotcha — code_execution / image generation run from repo root, the app is one level down.
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
