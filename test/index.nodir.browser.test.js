/*
 * INDEX MODULE BROWSER TESTING WITH __dirname UNDEFINED
 *
 * PURPOSE AND RATIONALE:
 * Validates that index.js handles the absence of the Node.js __dirname
 * variable, which some bundlers or browser environments may omit. This
 * ensures CSS injection still succeeds without Node-specific globals.
 */
require('./helper');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const {describe, it} = require('node:test');
let JSDOM; try { ({JSDOM} = require('jsdom')); } catch { JSDOM = null; }

describe('browser without __dirname', {concurrency:false}, () => {
  if(!JSDOM){ it('skips when jsdom missing', () => { assert.ok(true); }); return; }
  it('loads index.js with __dirname undefined', () => {
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {runScripts:'dangerously', url:'https://example.com/'});
    const script = fs.readFileSync(path.resolve(__dirname, '../index.js'), 'utf8');
    dom.window.__dirname = undefined; // removes Node global so safeResolve uses fallback
    assert.doesNotThrow(() => { dom.window.eval(script); }); // ensures no ReferenceError occurs
    const link = dom.window.document.querySelector('link'); // grabs injected stylesheet element
    assert.ok(link); // confirms CSS injection still runs
    dom.window.close();
  });
});
