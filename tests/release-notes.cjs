/* Documentation contract for user-facing release history and matching manifest. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const manifest=JSON.parse(read('module.json'));
const changelog=read('CHANGELOG.md');
const notes=read('RELEASE-NOTES.md');
const readme=read('README.md');
assert.equal(manifest.id,'wod20-player-actions');
assert.equal(manifest.version,'0.1.20');
assert.equal(manifest.download,`https://github.com/rebsiot/M20-player-actions/releases/download/v${manifest.version}/wod20-player-magick-${manifest.version}.zip`);
assert.equal(notes.split('\n')[0],`# Player Actions v${manifest.version}`);
assert.ok(notes.length>300 && notes.length<6000);
assert.match(notes,/## /);
assert.match(notes,/upgrad|backup|install/i);
assert.match(notes,/live|verif|test/i);
assert.match(readme,/\[What's in this release\]\(RELEASE-NOTES\.md\)/);
assert.match(readme,/\[Full version history\]\(CHANGELOG\.md\)/);
assert.ok(readme.toLowerCase().includes(`current version:** v${manifest.version}`));
const releases=[...changelog.matchAll(/^## v0\.1\.(\d+)\s+-/gm)].map(m=>+m[1]);
assert.deepEqual(releases,Array.from({length:21},(_,i)=>20-i),'0.1.20 through 0.1.0 in order');
assert.match(changelog,/v0\.1\.14[^]*?40 shortcuts/);
assert.match(readme,/Quick Resources/);
assert.match(notes,/Bashing, Lethal, and Aggravated/);
for(const f of ['docs/README-TECHNICAL-THROUGH-v0.1.14.md','docs/CHANGELOG-TECHNICAL-THROUGH-v0.1.14.md','docs/handoffs/05-HANDOFF-UPDATE-0.1.15.md','docs/handoffs/05-HANDOFF-UPDATE-0.1.16.md','docs/handoffs/05-HANDOFF-UPDATE-0.1.17.md']) {
  assert.ok(fs.statSync(path.join(root,f)).size>50,f);
}
const workflow=read('.github/workflows/publish-release.yml');
assert.match(workflow,/--notes-file RELEASE-NOTES\.md/);
assert.doesNotMatch(workflow,/with 39 draggable shortcuts/);
console.log('PASS: v0.1.20 release docs, preserved 0.1.15 continuity, source-only handoffs and versioned workflow');
