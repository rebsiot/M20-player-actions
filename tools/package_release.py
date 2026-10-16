"""Build the complete installable Foundry module, including curated Game Icons.

Usage (repository root): python3 tools/package_release.py
No world/Actor data is read or modified.
"""
import hashlib
import json
import zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'module.json').read_text(encoding='utf-8'))
module_id,version=manifest['id'],manifest['version']
if module_id!='wod20-player-actions':
    raise SystemExit('Unexpected module ID; refusing to package.')
name=f'wod20-player-magick-{version}.zip'
if not version or not manifest.get('manifest') or not manifest.get('download','').endswith(f'/v{version}/{name}'):
    raise SystemExit('Version/manifest/download mismatch.')
required=[
    'module.json','README.md','CHANGELOG.md','TEST-REPORT.md','ICONS-CREDITS.md',
    'PLAYER-MAGICK-LAUNCHER.js','PLAYER-BASIC-ACTIONS-LAUNCHER.js',
    'scripts/player-actions.js','styles/player-actions.css',
    'icons/LICENSE.txt','icons/icon-authors.json'
]
optional=[]
for pattern in ('05-HANDOFF-UPDATE-*.md','icons/*.svg','tests/*.cjs','tests/*.py'):
    optional += [str(f.relative_to(ROOT)) for f in ROOT.glob(pattern) if f.is_file()]
icons=[f for f in optional if f.startswith('icons/') and f.endswith('.svg')]
if len(icons)!=162:raise SystemExit(f'Expected 162 curated icons, found {len(icons)}.')
tests=[f for f in optional if f.startswith('tests/') and f.endswith('.cjs')]
if len(tests)<13:raise SystemExit(f'Expected at least 13 regression tests, found {len(tests)}.')
paths=sorted(set(required+optional))
for rel in paths:
    p=ROOT/rel
    if not p.is_file() or p.is_symlink() or p.resolve().is_relative_to(ROOT.resolve()) is False:
        raise SystemExit(f'Unsafe or missing release file: {rel}')
dist=ROOT/'dist'
dist.mkdir(exist_ok=True)
out=dist/name
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
    for rel in paths:
        archive.write(ROOT/rel,arcname=f'{module_id}/{rel}')
with zipfile.ZipFile(out) as archive:
    assert archive.testzip() is None, 'CRC check failed'
    assert not any(x.startswith('/') or '..' in Path(x).parts for x in archive.namelist())
    installed=json.loads(archive.read(f'{module_id}/module.json'))
    assert installed==manifest
    for path in manifest.get('esmodules',[])+manifest.get('styles',[]):
        assert f'{module_id}/{path}' in archive.namelist(), path
print(f'{out} ({out.stat().st_size} bytes, sha256 {hashlib.sha256(out.read_bytes()).hexdigest()}; {len(paths)} files)')
