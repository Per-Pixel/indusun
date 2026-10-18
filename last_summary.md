# Last Summary

Added `scripts/nexus_download.py`, a stdlib-only Python CLI that downloads mod files from Nexus Mods via the official API v1 (`api.nexusmods.com`).

## Usage

- Auth via `NEXUS_API_KEY` env var or `--api-key` (personal key from nexusmods.com account → API access).
- Inputs: `nxm://` links (free accounts — key/expires come from the "Mod manager download" button link), nexusmods.com mod page URLs, or `--game --mod --file` flags.
- `--list` prints a mod's file table (file_id, category, version, size) to pick a file; downloading supports resume via `.part` files, progress display, and logs API rate-limit headers.
- Free-tier accounts need key/expires (premium does not); script surfaces 401/403/404/429 with actionable messages.
