/*
 * SAFERESOLVE FALLBACK BEHAVIOR TESTING
 *
 * PURPOSE AND RATIONALE:
 * Simulates an environment where require is available but node:path cannot be
 * loaded. This test ensures safeResolve still returns the provided relative
 * path rather than throwing, enabling graceful degradation in restricted
 * runtimes.
 */
require('./helper');
const assert = require('node:assert');
const {describe,it} = require('node:test');

describe('node:path missing but require present', {concurrency:false}, () => {
  it('safeResolve returns input path', () => {
    const vm = require('node:vm');
    const fs = require('node:fs');
    const path = require('node:path');
    const code = fs.readFileSync(path.resolve(__dirname,'../index.js'),'utf8');
    const sandbox = {
      require(id){ if(id==='node:path'){ const err=new Error("Cannot find module 'node:path'"); err.code='MODULE_NOT_FOUND'; throw err; } return require(id); },
      module:{exports:{}},
      exports:{},
      console,
      __dirname:path.resolve(__dirname,'..'),
      __filename:path.resolve(__dirname,'../index.js')
    };
    vm.runInNewContext(code,sandbox,{filename:'index.js'});
    const mod = sandbox.module.exports;
    assert.strictEqual(mod.coreCss, './qore.css');
    assert.strictEqual(mod.variablesCss, './variables.css');
  });
});
