require("./helper"); // loads stubs for axios and qerrors dependencies ensuring offline consistency
const assert = require('node:assert'); // assertion library for test validations
const fs = require('node:fs'); // file system module for test setup and verification
const path = require('node:path'); // path module for cross-platform file handling
const os = require('node:os'); // operating system module for temporary directory creation
const {describe, it, beforeEach, afterEach} = require('node:test'); // node test framework components

let build; // reference to build function after module cache clearing
let tmpDir; // temporary directory path for isolated test execution

beforeEach(() => {
  process.env.CODEX = 'True'; // forces offline mode to avoid postcss dependency
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'buildrep-')); // creates unique temp dir for each test
  fs.writeFileSync(path.join(tmpDir, 'qore.css'), 'body{}'); // minimal css input to keep hashes stable
  fs.copyFileSync(path.resolve(__dirname, '../index.js'), path.join(tmpDir, 'index.js')); // copy index.js for hash injection
  process.chdir(tmpDir); // switch cwd to temp dir so build artifacts stay isolated
  delete require.cache[require.resolve('../scripts/build')]; // clear module cache for fresh build import
  build = require('../scripts/build'); // import build after clearing cache for isolation
});

afterEach(() => {
  process.chdir(path.resolve(__dirname, '..')); // restore original working directory after test
  fs.rmSync(tmpDir, {recursive: true, force: true}); // clean up temporary directory to avoid interference
});

describe('build run twice', {concurrency:false}, () => {
  it('does not throw on repeated run with same css', async () => {
    const firstHash = await build(); // first build should create hashed css
    const secondHash = await build(); // second build runs with same css and should not fail
    const filePath = path.join(tmpDir, `core.${firstHash}.min.css`); // expected hashed file path after builds
    assert.strictEqual(firstHash, secondHash); // hashes must match because css unchanged
    assert.ok(fs.existsSync(filePath)); // hashed file should exist after second build
  });
});
