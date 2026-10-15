"""Package this Foundry module from its repository root, without modifying world data.

Usage: python3 tools/package_release.py
"""
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'module.json').read_text(encoding='utf-8'))
module_id, version = manifest['id'], manifest['version']
if module_id != 'wod20-player-actions':
    raise SystemExit('Unexpected module ID; refusing to package.')
if not version or not manifest.get('manifest') or not manifest.get('download'):
    raise SystemExit('Version/manifest/download must be populated.')
zip_name = f'wod20-player-magick-{version}.zip'
if not manifest['download'].endswith(f'/v{version}/{zip_name}'):
    raise SystemExit('Download URL does not match module version/asset name.')
include = [
    'module.json', 'README.md', 'CHANGELOG.md', 'TEST-REPORT.md',
    '05-HANDOFF-UPDATE-0.1.4.md', '05-HANDOFF-UPDATE-0.1.6.md', 'PLAYER-MAGICK-LAUNCHER.js',
    'scripts/player-actions.js', 'styles/player-actions.css',
]
include.extend(str(p.relative_to(ROOT)) for p in sorted((ROOT / 'tests').glob('*.cjs')))
for path in include:
    if not (ROOT / path).is_file():
        raise SystemExit(f'Missing release source: {path}')
dist = ROOT / 'dist'
dist.mkdir(exist_ok=True)
out = dist / zip_name
with zipfile.ZipFile(out, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for path in sorted(include):
        archive.write(ROOT / path, arcname=f'{module_id}/{path}')
with zipfile.ZipFile(out) as archive:
    assert archive.testzip() is None, 'CRC check failed'
    assert f'{module_id}/module.json' in archive.namelist()
    installed = json.loads(archive.read(f'{module_id}/module.json'))
    assert installed == manifest
    for path in manifest.get('esmodules', []) + manifest.get('styles', []):
        assert f'{module_id}/{path}' in archive.namelist(), path
print(out)