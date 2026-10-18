"""Download mod files from Nexus Mods via the official public API.

Usage examples:
    # List files for a mod
    python scripts/nexus_download.py --game skyrim --mod 1234 --list

    # Download a specific file (premium account - no key needed)
    python scripts/nexus_download.py --game skyrim --mod 1234 --file 5678

    # Download from a mod page URL
    python scripts/nexus_download.py "https://www.nexusmods.com/skyrim/mods/1234" --file 5678

    # Free account: paste the nxm:// link from the "Mod manager download" button
    python scripts/nexus_download.py "nxm://skyrim/mods/1234/files/5678?key=...&expires=..."

Auth: set NEXUS_API_KEY env var or pass --api-key. Get a key at
https://www.nexusmods.com/users/myaccount?tab=api%20access
"""

import argparse
import json
import logging
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

API_BASE = 'https://api.nexusmods.com/v1'
USER_AGENT = 'nexus-download-script/1.0'
CHUNK_SIZE = 1024 * 256


class NexusApiError(Exception):
    pass


def api_request(path, api_key, params=None):
    """GET a JSON endpoint on the Nexus Mods API."""
    url = API_BASE + path
    if params:
        url += '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={
        'apikey': api_key,
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            _log_rate_limits(resp.headers)
            return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')[:500]
        if e.code in (401, 403):
            raise NexusApiError(
                f'{e.code} from API - check your API key. Free accounts also need '
                f'key/expires from an nxm:// link. Detail: {body}')
        if e.code == 404:
            raise NexusApiError(f'404 - game/mod/file not found: {url}')
        if e.code == 429:
            raise NexusApiError(f'429 rate limited. Wait and retry. Detail: {body}')
        raise NexusApiError(f'HTTP {e.code}: {body}')


def _log_rate_limits(headers):
    hourly = headers.get('X-RL-Hourly-Remaining')
    daily = headers.get('X-RL-Daily-Remaining')
    if hourly is not None or daily is not None:
        logger.info(f'API quota remaining - hourly: {hourly}, daily: {daily}')


def parse_nxm(url):
    """Parse nxm://{game}/mods/{mod_id}/files/{file_id}?key=..&expires=.."""
    m = re.match(r'nxm://([^/]+)/mods/(\d+)/files/(\d+)', url)
    if not m:
        return None
    q = urllib.parse.parse_qs(urllib.parse.urlparse(url).query)
    return {
        'game': m.group(1),
        'mod_id': int(m.group(2)),
        'file_id': int(m.group(3)),
        'key': q.get('key', [None])[0],
        'expires': q.get('expires', [None])[0],
    }


def parse_page_url(url):
    """Parse https://www.nexusmods.com/{game}/mods/{mod_id}[?file_id=N]"""
    m = re.match(r'https?://(?:www\.)?nexusmods\.com/([^/]+)/mods/(\d+)', url)
    if not m:
        return None
    q = urllib.parse.parse_qs(urllib.parse.urlparse(url).query)
    file_id = q.get('file_id', [None])[0]
    return {
        'game': m.group(1),
        'mod_id': int(m.group(2)),
        'file_id': int(file_id) if file_id else None,
    }


def list_files(api_key, game, mod_id):
    data = api_request(f'/games/{game}/mods/{mod_id}/files.json', api_key)
    files = data.get('files', [])
    print(f'{"file_id":>10}  {"cat":>10}  {"version":>10}  {"size(KB)":>10}  name')
    for f in files:
        print(f'{f["file_id"]:>10}  {str(f.get("category_name")):>10}  '
              f'{str(f.get("version")):>10}  {f.get("size", 0):>10}  {f.get("name")}')
    return files


def get_download_link(api_key, game, mod_id, file_id, key=None, expires=None):
    params = {}
    if key and expires:
        params = {'key': key, 'expires': expires}
    links = api_request(
        f'/games/{game}/mods/{mod_id}/files/{file_id}/download_link.json',
        api_key, params)
    if not links:
        raise NexusApiError('API returned no download locations')
    return links[0]['URI']


def download_file(url, out_dir, filename=None):
    """Stream-download with resume support via a .part file."""
    if not filename:
        path = urllib.parse.urlparse(url).path
        filename = os.path.basename(path) or 'nexus_download.bin'
    os.makedirs(out_dir, exist_ok=True)
    dest = os.path.join(out_dir, filename)
    part = dest + '.part'

    resume_at = os.path.getsize(part) if os.path.exists(part) else 0
    headers = {'User-Agent': USER_AGENT}
    if resume_at:
        headers['Range'] = f'bytes={resume_at}-'

    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp:
        if resume_at and resp.status == 200:
            logger.info('Server ignored Range; restarting download')
            resume_at = 0
        total = resp.headers.get('Content-Length')
        total = int(total) + resume_at if total else None
        mode = 'ab' if resume_at else 'wb'
        downloaded = resume_at
        start = time.time()
        with open(part, mode) as f:
            while True:
                chunk = resp.read(CHUNK_SIZE)
                if not chunk:
                    break
                f.write(chunk)
                downloaded += len(chunk)
                elapsed = max(time.time() - start, 0.001)
                speed = (downloaded - resume_at) / elapsed / (1024 * 1024)
                if total:
                    pct = downloaded / total * 100
                    print(f'\r{filename}: {pct:5.1f}% ({speed:.1f} MB/s)   ',
                          end='', flush=True)
                else:
                    print(f'\r{filename}: {downloaded / 1048576:.1f} MB '
                          f'({speed:.1f} MB/s)   ', end='', flush=True)
        print()
    os.replace(part, dest)
    logger.info(f'Saved to {dest}')
    return dest


def resolve_target(raw, args):
    """Turn a CLI input into {game, mod_id, file_id, key, expires}."""
    if raw.startswith('nxm://'):
        target = parse_nxm(raw)
        if not target:
            raise NexusApiError(f'Could not parse nxm link: {raw}')
        return target
    page = parse_page_url(raw)
    if page:
        return {**page, 'file_id': page['file_id'] or args.file,
                'key': args.key, 'expires': args.expires}
    raise NexusApiError(f'Unrecognised input (expected nxm:// or nexusmods.com URL): {raw}')


def main():
    p = argparse.ArgumentParser(description='Download mods from Nexus Mods')
    p.add_argument('inputs', nargs='*',
                   help='nxm:// links or nexusmods.com mod page URLs')
    p.add_argument('--game', help='Game domain name, e.g. skyrim, stardewvalley')
    p.add_argument('--mod', type=int, help='Mod ID')
    p.add_argument('--file', type=int, help='File ID (see --list)')
    p.add_argument('--key', help='nxm key param (free accounts)')
    p.add_argument('--expires', help='nxm expires param (free accounts)')
    p.add_argument('--api-key', default=os.environ.get('NEXUS_API_KEY'),
                   help='Nexus Mods API key (or set NEXUS_API_KEY)')
    p.add_argument('--out', default='downloads', help='Output directory')
    p.add_argument('--list', action='store_true',
                   help='List files for the mod instead of downloading')
    args = p.parse_args()

    if not args.api_key:
        p.error('No API key. Set NEXUS_API_KEY or pass --api-key.')

    targets = []
    for raw in args.inputs:
        targets.append(resolve_target(raw, args))
    if args.game and args.mod:
        targets.append({'game': args.game, 'mod_id': args.mod,
                        'file_id': args.file,
                        'key': args.key, 'expires': args.expires})
    if not targets:
        p.error('Nothing to do. Provide a URL, an nxm:// link, or --game/--mod.')

    for t in targets:
        if args.list or not t.get('file_id'):
            list_files(args.api_key, t['game'], t['mod_id'])
            if args.list:
                continue
            logger.info('Pick a file_id and re-run with --file (or use an nxm:// link)')
            continue
        link = get_download_link(args.api_key, t['game'], t['mod_id'],
                                 t['file_id'], t.get('key'), t.get('expires'))
        logger.info(f'Downloading: {link.split("?")[0]}')
        download_file(link, args.out)


if __name__ == '__main__':
    try:
        main()
    except NexusApiError as e:
        logger.error(str(e))
        sys.exit(1)
    except KeyboardInterrupt:
        print('\nInterrupted - partial download kept as .part for resume')
        sys.exit(130)
