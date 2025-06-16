require('./helper');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const {describe, it} = require('node:test');

describe('safeResolve missing file', {concurrency:false}, () => {
  it('throws when fallback path does not exist', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sr-')); // temp dir for sandbox
    const code = fs.readFileSync(path.resolve(__dirname, '../index.js'), 'utf8'); // module source
    const nodeRequire = require; // capture native require
    function req(id){ return nodeRequire(id); } // passthrough require
    req.resolve = undefined; // remove resolve to trigger fallback branch
    const sandbox = {require:req,module:{exports:{}},exports:{},console,__dirname:tmp,__filename:path.join(tmp,'index.js')};
    assert.throws(() => vm.runInNewContext(code, sandbox, {filename:'index.js'})); // expect error on missing file
    fs.rmSync(tmp,{recursive:true,force:true}); // cleanup temp directory
  });
});
