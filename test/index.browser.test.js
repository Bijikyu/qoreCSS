/*
 * BROWSER INJECTION TESTING - DOM ENVIRONMENT SIMULATION
 * 
 * PURPOSE AND RATIONALE:
 * This test suite validates the browser-specific behavior of the index.js module,
 * specifically the automatic CSS injection functionality that occurs when the
 * module detects a browser environment (presence of window object). Testing
 * requires DOM simulation since Node.js lacks native browser APIs.
 * 
 * TESTING STRATEGY:
 * - JSDOM provides realistic browser environment simulation
 * - Global window/document injection enables browser detection
 * - CSS injection validation ensures automatic stylesheet loading works
 * - Graceful fallback when JSDOM unavailable prevents test failures
 * 
 * This approach ensures the npm package works correctly when loaded directly
 * in browser environments via script tags or browser bundles.
 */

require("./helper"); // loads module stubbing for consistent test environment
const assert = require('node:assert'); // Node.js built-in assertion library for test validation
const path = require('node:path'); // path utilities for cross-platform file handling
const fs = require('node:fs'); // file system utilities used for temporary script copy
const os = require('node:os'); // operating system utilities for temp path generation
const {describe, it, beforeEach, afterEach} = require('node:test'); // Node.js native test framework components
let JSDOM; // will hold jsdom constructor when available for DOM simulation
try { ({JSDOM} = require('jsdom')); } catch { JSDOM = null; } // fallback when jsdom missing to prevent import errors

let dom; // JSDOM instance for browser environment simulation

/*
 * BROWSER ENVIRONMENT SETUP
 * 
 * DOM SIMULATION STRATEGY:
 * Creates a minimal HTML document with JSDOM and exposes window/document
 * globally to trigger the module's browser detection logic. This setup
 * enables testing of CSS injection without requiring an actual browser.
 */
beforeEach(() => {
  if(!JSDOM) return; // skips setup when jsdom unavailable to prevent test failures
  dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`, {url:'https://example.com/'}); // creates DOM with baseURI for simulation
  global.window = dom.window; // exposes window for module browser detection
  global.document = dom.window.document; // exposes document for CSS injection functionality
  process.chdir(path.resolve(__dirname, '..')); // ensures correct module paths for file resolution
  delete require.cache[require.resolve('../index.js')]; // clears cache so each test loads fresh module
});

/*
 * BROWSER ENVIRONMENT CLEANUP
 * 
 * CLEANUP RATIONALE:
 * Removes global DOM objects and closes JSDOM instance to prevent test
 * environment pollution and ensure subsequent tests run in clean Node.js
 * environment without browser globals.
 */
afterEach(() => {
  if(!JSDOM) return; // skips teardown when jsdom unavailable
  dom.window.close(); // closes jsdom window to free resources
  delete global.window; // removes global window to restore Node.js environment
  delete global.document; // removes global document to restore Node.js environment
  delete require.cache[require.resolve('../index.js')]; // ensures module cleanup between tests
});

/*
 * BROWSER BEHAVIOR VALIDATION
 * 
 * TESTING SCOPE:
 * Validates that the module correctly detects browser environment and
 * automatically injects CSS without setting server-side flags. This ensures
 * the zero-configuration browser experience works as intended.
 */
describe('browser injection', {concurrency:false}, () => {
  /*
   * GRACEFUL FALLBACK FOR MISSING DEPENDENCIES
   * 
   * FALLBACK RATIONALE:
   * When JSDOM is not available (optional dependency), tests should skip
   * gracefully rather than fail. This prevents test suite failures in
   * environments where DOM simulation is not needed or available.
   */
  if(!JSDOM){
    it('skips when jsdom missing', () => { assert.ok(true); }); // placeholder test when JSDOM unavailable
    return;
  }
  
  /*
   * CSS INJECTION AND ENVIRONMENT DETECTION VALIDATION
   * 
   * TEST STRATEGY:
   * Verifies two critical browser behaviors:
   * 1. serverSide flag remains undefined (no server detection)
   * 2. CSS stylesheet is automatically injected into DOM
   * 
   * This confirms the module correctly distinguishes browser from Node.js
   * environments and provides automatic CSS loading for browser users.
   */
  it('injects stylesheet and serverSide undefined', () => {
    const mod = require('../index.js'); // loads module after DOM setup
    assert.strictEqual(mod.serverSide, undefined); // verifies serverSide not set in browser environment
    const link = document.querySelector('link[href*="core"]') || document.querySelector('link[href*="qore"]') || document.querySelector('style'); // searches for injected CSS in multiple forms
    assert.ok(link); // confirms CSS injection occurred in simulated browser environment
  });

  it('avoids duplicate injection on subsequent loads', () => {
    require('../index.js'); // first load injects stylesheet
    const countBefore = document.head.querySelectorAll('link').length; // captures link count after first load for comparison
    delete require.cache[require.resolve('../index.js')]; // clears cache to force re-execution of module
    require('../index.js'); // triggers injectCss again to test duplicate avoidance
    const countAfter = document.head.querySelectorAll('link').length; // counts links after second load to verify no extra element
    assert.strictEqual(countBefore, countAfter); // ensures link count unchanged meaning no duplicate injection
  });

  it('uses document.currentScript when present', () => {
    // Clear all existing links and scripts first
    document.querySelectorAll('link').forEach(link => link.remove());
    document.querySelectorAll('script').forEach(script => script.remove());
    
    const script = document.createElement('script'); // creates mock script element
    script.src = 'https://cdn.example.com/lib/index.js'; // sets src for detection
    document.head.appendChild(script); // adds script to DOM for fallback detection
    document.currentScript = script; // assigns as currentScript
    delete require.cache[require.resolve('../index.js')]; // clears cache to ensure fresh execution
    require('../index.js'); // loads module to trigger injection
    const link = document.querySelector('link'); // retrieves injected link
    assert.ok(link.href.startsWith('https://cdn.example.com/lib/')); // validates base path resolution
    document.currentScript = null; // cleans up global assignment
    script.remove(); // cleanup script element
  });

  it('detects script element by src pattern', () => {
    const script = document.createElement('script'); // creates script element for lookup
    script.src = 'https://cdn.example.com/assets/INDEX.JS'; // uses upper case to test case-insensitive detection
    document.body.appendChild(script); // adds script to DOM for lookup iteration
    require('../index.js'); // loads module to trigger injection
    const link = document.querySelector('link'); // retrieves injected link
    assert.ok(link.href.startsWith('https://cdn.example.com/assets/')); // verifies base path from script src
  });

  it('handles script src with query string', () => {
    const script = document.createElement('script'); // creates script element with query
    script.src = 'https://cdn.example.com/assets/index.js?version=1'; // src includes query to test pathname parsing
    document.body.appendChild(script); // adds script to DOM for lookup
    require('../index.js'); // loads module to trigger injection
    const link = document.querySelector('link'); // retrieves injected link
    assert.ok(link.href.startsWith('https://cdn.example.com/assets/')); // verifies base path ignoring query string
  });

  it('uses data-qorecss attribute when provided', () => {
    const script = document.createElement('script'); // creates attribute-based script
    script.src = 'https://cdn.example.com/data/script.js'; // src unrelated to index.js
    script.setAttribute('data-qorecss', ''); // marks script for detection
    document.body.appendChild(script); // injects into DOM
    require('../index.js'); // loads module to trigger injection
    const link = document.querySelector('link'); // retrieves injected link
    assert.ok(link.href.startsWith('https://cdn.example.com/data/')); // ensures detection via data attribute
  });

  it('prioritizes data-qorecss over other index.js scripts', () => {
    const other = document.createElement('script'); // unrelated index.js for fallback search
    other.src = 'https://cdn.other.com/ignore/index.js'; // path not used when data attribute exists
    document.body.appendChild(other); // adds non-attribute script first
    const target = document.createElement('script'); // script marked for css base path
    target.src = 'https://cdn.target.com/assets/index.js'; // correct base path for injection
    target.setAttribute('data-qorecss', ''); // attribute marks this script
    document.body.appendChild(target); // adds attribute script after other
    delete require.cache[require.resolve('../index.js')]; // ensures fresh module load
    require('../index.js'); // executes injection
    const link = document.querySelector('link'); // link inserted by injectCss
    assert.ok(link.href.startsWith('https://cdn.target.com/assets/')); // verifies attribute script used
  });

  it('defaults to document.baseURI when script not found', () => {
    require('../index.js'); // loads module with no identifiable script
    const link = document.querySelector('link'); // retrieves injected link
    assert.ok(link.href.startsWith(document.baseURI)); // verifies fallback to document.baseURI
  });

  it('derives base path from document.baseURI directory', () => {
    dom.window.close(); // closes initial DOM before custom setup
    dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`, {url:'https://example.com/page.html'}); // new DOM with page path for baseURI check
    global.window = dom.window; // exposes new window to module
    global.document = dom.window.document; // exposes new document to module
    delete require.cache[require.resolve('../index.js')]; // ensures fresh module load
    require('../index.js'); // triggers injection without script tag
    const link = document.querySelector('link'); // retrieves injected link
    assert.ok(link.href.startsWith('https://example.com/')); // expects directory portion of baseURI
  });

  it('replaces outdated hashed link when new script loaded', () => {
    require('../index.js'); // initial load injects first hash
    const tmpPath = path.join(os.tmpdir(), `idx-${Date.now()}.js`); // temp file path for modified script
    const orig = fs.readFileSync(path.resolve(__dirname, '../index.js'), 'utf8'); // read original script for modification
    fs.writeFileSync(tmpPath, orig.replace(/core\.5c7df4d0\.min\.css/, 'core.abcdef12.min.css')); // injects different hash for second load
    require(tmpPath); // second load should remove old link and inject new one
    const links = document.head.querySelectorAll('link'); // gather remaining links after reload
    assert.strictEqual(links.length, 1); // verify only one stylesheet remains
    assert.ok(links[0].href.includes('core.abcdef12.min.css')); // ensure new hash present
    fs.unlinkSync(tmpPath); // cleanup temporary script file
  });

  it('removes hashed link with query string', () => {
    const old = document.createElement('link'); // prepares old hashed file with query for removal test
    old.href = 'core.123.min.css?old=1'; // simulates previous hashed file with query parameters
    old.rel = 'stylesheet'; // sets rel attribute for valid stylesheet
    document.head.appendChild(old); // inserts outdated link before module load
    require('../index.js'); // triggers injectCss which should remove outdated link
    const links = Array.from(document.head.querySelectorAll('link')); // collects all link elements after injection
    assert.strictEqual(links.length, 1); // expects only new hashed link to remain
    assert.ok(links[0].href.includes('core.5c7df4d0.min.css')); // verifies new hashed link present
    assert.ok(!links.some(l => l.href.includes('core.123.min.css'))); // ensures old hashed link removed
  });

  it('keeps unrelated core files intact', () => {
    const extra = document.createElement('link'); // prepares additional stylesheet for removal test
    extra.href = 'core.extra.css'; // unrelated file should not match regex in injectCss
    extra.rel = 'stylesheet'; // standard rel value for CSS link
    document.head.appendChild(extra); // injects unrelated stylesheet before loading module
    require('../index.js'); // triggers injectCss which should leave extra file untouched
    const links = Array.from(document.head.querySelectorAll('link')); // collects all link elements after injection
    assert.strictEqual(links.length, 2); // expect new core hash plus existing extra file
    assert.ok(links.some(l => l.href.endsWith('core.extra.css'))); // verifies extra file still present after injection
  });

  it('replaces qore.css link with hashed file', () => {
    const fallback = document.createElement('link'); // pre-existing plain CSS link for cleanup test
    fallback.href = 'qore.css'; // href that should be removed when hashed file injected
    fallback.rel = 'stylesheet'; // sets standard rel value
    document.head.appendChild(fallback); // inserts fallback before module load
    require('../index.js'); // triggers injection which should remove fallback
    const links = Array.from(document.head.querySelectorAll('link')); // gathers final links after injection
    assert.strictEqual(links.length, 1); // expects single stylesheet in document
    assert.ok(links[0].href.includes('core.5c7df4d0.min.css')); // validates hashed css link present
    assert.ok(!links[0].href.endsWith('qore.css')); // ensures fallback removed
  });

  it('removes fallback when hash already present', () => {
    const hashed = document.createElement('link'); // pre-existing hashed stylesheet to simulate prior injection
    hashed.href = 'core.5c7df4d0.min.css'; // matching current hash value for detection
    hashed.rel = 'stylesheet'; // rel attribute ensures valid stylesheet element
    document.head.appendChild(hashed); // adds hashed file before module load
    const fallback = document.createElement('link'); // fallback stylesheet link for removal test
    fallback.href = 'qore.css'; // href targeted by injectCss cleanup logic
    fallback.rel = 'stylesheet'; // ensures element recognized as stylesheet
    document.head.appendChild(fallback); // adds fallback before module load
    require('../index.js'); // loads module which should remove fallback but keep hash
    const links = Array.from(document.head.querySelectorAll('link')); // collects remaining link elements post injection
    assert.strictEqual(links.length, 1); // expects only hashed stylesheet to remain
    assert.ok(links[0].href.includes('core.5c7df4d0.min.css')); // verifies hashed stylesheet retained
  });

  it('removes duplicate hashed links', () => {
    const first = document.createElement('link'); // first hash instance for duplicate test
    first.href = 'core.5c7df4d0.min.css'; // hashed filename for duplicate removal
    first.rel = 'stylesheet'; // rel attribute for stylesheet
    document.head.appendChild(first); // adds first hashed link before module load
    const dup = document.createElement('link'); // duplicate hashed stylesheet for cleanup
    dup.href = 'core.5c7df4d0.min.css'; // same hashed file triggers duplicate detection
    dup.rel = 'stylesheet'; // standard rel value for CSS link
    document.head.appendChild(dup); // appends duplicate before module load
    require('../index.js'); // loads module which should remove duplicate
    const links = document.querySelectorAll('link'); // collects remaining links after injection
    assert.strictEqual(links.length, 1); // expects only one hashed link to remain
    assert.ok(links[0].href.includes('core.5c7df4d0.min.css')); // verifies remaining link uses hashed file
  });

  it('removes onerror after fallback to prevent loop', () => {
    require('../index.js'); // triggers injection to create link with handler
    const link = document.querySelector('link'); // retrieves injected stylesheet link
    const handle = link.onerror; // stores onerror for manual invocation
    handle(); // simulate load error to trigger fallback
    assert.ok(link.href.endsWith('qore.css')); // verifies fallback applied
    assert.strictEqual(link.onerror, null); // ensures handler removed after invocation
    const testHref = 'again.css'; // sets test href value
    link.href = testHref; // resets href to check for loop
    if(link.onerror){ link.onerror(); } // would re-trigger if handler not removed
    assert.ok(link.href.endsWith('again.css')); // confirms href ends with expected value (may have base path)
  });
});
