"""Build complete WoD20 Player Actions module including curated Game Icons.

No world, Actor, user data or Foundry installation is modified.
"""
import hashlib
import json
import zipfile
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT/'module.json').read_text(encoding='utf-8'))
module_id,version = manifest['id'],manifest['version']
if module_id != 'wod20-player-actions':
    raise SystemExit('Unexpected module ID; refusing to package.')
name = f'wod20-player-magick-{version}.zip'
if not version or not manifest.get('manifest') or not manifest.get('download','').endswith(f'/v{version}/{name}'):
    raise SystemExit('Version/manifest/download mismatch.')
notes = (ROOT/'RELEASE-NOTES.md').read_text(encoding='utf-8')
if not notes.startswith(f'# Player Actions v{version}\n'):
    raise SystemExit('Release notes heading does not match module version.')
required = [
    'module.json','README.md','CHANGELOG.md','RELEASE-NOTES.md','TEST-REPORT.md','ICONS-CREDITS.md',
    'PLAYER-MAGICK-LAUNCHER.js','PLAYER-BASIC-ACTIONS-LAUNCHER.js',
    'scripts/player-actions.js','styles/player-actions.css',
    'icons/LICENSE.txt','icons/icon-authors.json'
]
optional = []
for pattern in ('05-HANDOFF-UPDATE-*.md','icons/*.svg','tests/*.cjs','tests/*.py','docs/*.md'):
    optional += [str(f.relative_to(ROOT)) for f in ROOT.glob(pattern) if f.is_file()]
icons = [x for x in optional if x.startswith('icons/') and x.endswith('.svg')]
if len(icons) != 162:
    raise SystemExit(f'Expected 162 curated icons, found {len(icons)}.')
tests=[x for x in optional if x.startswith('tests/') and x.endswith('.cjs')]
if len(tests)<19:
    raise SystemExit(f'Expected at least 19 Node tests, found {len(tests)}.')
paths = sorted(set(required + optional))
for rel in paths:
    p = ROOT/rel
    if not p.is_file() or p.is_symlink() or not p.resolve().is_relative_to(ROOT.resolve()):
        raise SystemExit(f'Unsafe/missing release file: {rel}')
dist = ROOT/'dist'
dist.mkdir(exist_ok=True)
out = dist/name
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for rel in paths:
        z.write(ROOT/rel,arcname=f'{module_id}/{rel}')
with zipfile.ZipFile(out) as z:
    assert z.testzip() is None, 'CRC check failed'
    assert not any(x.startswith('/') or '..' in Path(x).parts for x in z.namelist())
    installed=json.loads(z.read(f'{module_id}/module.json'))
    assert installed==manifest
    for x in manifest.get('esmodules',[])+manifest.get('styles',[]):
        assert f'{module_id}/{x}' in z.namelist(),x
print(f'{out} ({out.stat().st_size} bytes; sha256 {hashlib.sha256(out.read_bytes()).hexdigest()}; {len(paths)} files)')
