/* Documentation contract: the published release title, installer and history must stay in sync. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const manifest = JSON.parse(read('module.json'));
const changelog = read('CHANGELOG.md');
const notes = read('RELEASE-NOTES.md');
const readme = read('README.md');
const heading = `# Player Actions v${manifest.version}`;
const expectedDownload = `https://github.com/rebsiot/M20-player-actions/releases/download/v${manifest.version}/wod20-player-magick-${manifest.version}.zip`;

assert.equal(manifest.id, 'wod20-player-actions');
assert.equal(manifest.download, expectedDownload);
assert.equal(notes.split('\n')[0], heading, 'Versioned release notes required');
assert.match(notes, /^## /m, 'Release needs reader-friendly sections');
assert.ok(notes.length >= 150 && notes.length <= 6000, 'Keep summary readable');
assert.match(notes, /updat|install|upgrade|backup/i, 'Explain installation/update');
assert.match(notes, /test|verif|live|known/i, 'State verification status');
assert.match(readme, /\[What's in this release\]\(RELEASE-NOTES\.md\)/);
assert.match(readme, /\[Full version history\]\(CHANGELOG\.md\)/);
assert.ok(readme.toLowerCase().includes(`current version:** v${manifest.version}`));
assert.doesNotMatch(readme.split('\n').slice(0,10).join('\n'), /test build|published baseline/i);
assert.doesNotMatch(changelog, /unpublished|test build|pre-release compactness refinement/i);
const releases = [...changelog.matchAll(/^## v(0\.1\.\d+)\s+[—-]/gm)].map(m => +m[1].split('.').at(-1));
const patch = Number(manifest.version.split('.')[2]);
assert.deepEqual(releases, Array.from({length:patch+1}, (_,i)=>patch-i), 'Every release in newest-first order');
assert.match(changelog, /v0\.1\.14[^]*?40 shortcuts/);
assert.ok(fs.existsSync(path.join(root, 'docs/CHANGELOG-TECHNICAL-THROUGH-v0.1.14.md')));
assert.ok(fs.existsSync(path.join(root, 'docs/README-TECHNICAL-THROUGH-v0.1.14.md')));
if (fs.existsSync(path.join(root, '.github/workflows/publish-release.yml'))) {
  const workflow = read('.github/workflows/publish-release.yml');
  assert.match(workflow, /--notes-file RELEASE-NOTES\.md/);
  assert.doesNotMatch(workflow, /Macro compendium with 39 draggable shortcuts/);
}
console.log('Release notes, version history, manifest and workflow: PASS');
