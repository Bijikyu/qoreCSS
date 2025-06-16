require("./helper"); // ensures axios and qerrors stubs are active for offline reliability
const assert = require('node:assert'); // assertion library for validations
const fs = require('node:fs'); // filesystem methods for setup and checks
const path = require('node:path'); // path utilities for portability
const os = require('node:os'); // os module for temporary directories
const {describe, it, beforeEach, afterEach} = require('node:test'); // node test framework components

let build; // holds build function reference per test
let tmpDir; // directory created for each test case

beforeEach(() => {
  process.env.CODEX = 'True'; // forces offline mode so build skips postcss
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'buildmiss-')); // isolated temp directory for artifact cleanup
  fs.writeFileSync(path.join(tmpDir, 'qore.css'), 'body{}'); // minimal css source for hashing
  fs.copyFileSync(path.resolve(__dirname, '../index.js'), path.join(tmpDir, 'index.js')); // index.js copied for injection
  fs.writeFileSync(path.join(tmpDir, 'core.deadbeef.min.css'), 'old'); // old hashed css for deletion attempt
  fs.writeFileSync(path.join(tmpDir, 'core.deadbeef.min.css.gz'), 'old'); // old gzip for deletion attempt
  fs.writeFileSync(path.join(tmpDir, 'core.deadbeef.min.css.br'), 'old'); // old brotli for deletion attempt
  process.chdir(tmpDir); // change into temp directory so build uses it as cwd
  delete require.cache[require.resolve('../scripts/build')]; // fresh import ensures clean state
  build = require('../scripts/build'); // import build function after cache clear
});

afterEach(() => {
  process.chdir(path.resolve(__dirname, '..')); // restore repository root after test
  fs.rmSync(tmpDir, {recursive: true, force: true}); // remove temporary directory and contents
  delete process.env.CODEX; // clean environment flag for other tests
});

describe('build with missing old files', {concurrency:false}, () => {
  it('ignores ENOENT errors when old files removed before unlink', async () => {
    const fsPromises = fs.promises; // alias for patching unlink
    const origUnlink = fsPromises.unlink; // preserve original implementation for restoration
    fsPromises.unlink = async function(p){ if(p.includes('deadbeef')){ const e = new Error('gone'); e.code = 'ENOENT'; throw e; } return origUnlink.call(this, p); }; // simulate race condition by throwing ENOENT
    const hash = await build(); // run build expecting success despite unlink errors
    fsPromises.unlink = origUnlink; // restore unlink to avoid affecting other tests
    assert.ok(fs.existsSync(path.join(tmpDir, `core.${hash}.min.css`))); // final hashed css should exist
  });
});
