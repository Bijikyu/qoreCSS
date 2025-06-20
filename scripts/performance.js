
/*
 * PERFORMANCE TESTING SCRIPT - CDN RESPONSE TIME MEASUREMENT
 * 
 * PURPOSE AND RATIONALE:
 * This script provides automated performance monitoring for qoreCSS delivery
 * across multiple CDN endpoints. It addresses several critical needs:
 * 
 * 1. CDN PERFORMANCE COMPARISON: Measures actual download times across different CDNs
 * 2. RELIABILITY MONITORING: Detects CDN outages or performance degradation
 * 3. HISTORICAL TRACKING: Builds performance history for trend analysis
 * 4. LOAD TESTING: Simulates concurrent user requests to test CDN capacity
 * 
 * DESIGN DECISIONS:
 * - Queue-based concurrency prevents overwhelming CDN endpoints
 * - Exponential backoff with retries handles transient network issues
 * - Environment detection enables testing in offline development environments
 * - JSON output format enables integration with monitoring dashboards
 * 
 * The testing methodology simulates real-world usage patterns while respecting
 * CDN rate limits and providing actionable performance data.
 */

const fetchRetry = require('./request-retry'); // HTTP client with retry logic for handling network failures
const {performance} = require('perf_hooks'); // High-resolution timing API for accurate measurements
const qerrors = require('./utils/logger'); // Centralized error logging with contextual information
const fs = require('fs'); // File system operations for reading/writing test results
// Manual concurrency control implementation to replace p-limit per REPLITAGENT.md constraints
const {parseEnvInt, parseEnvString, parseEnvBool, trimTrailingSlashes} = require('./utils/env-config'); // adds boolean parser and url normalizer

let CDN_BASE_URL = trimTrailingSlashes(parseEnvString('CDN_BASE_URL', 'https://cdn.jsdelivr.net')); // ensures trailing slashes removed for consistent base url


if(CDN_BASE_URL.trim() === ''){ CDN_BASE_URL = 'https://cdn.jsdelivr.net'; } // fallback to jsDelivr when empty
const MAX_CONCURRENCY = parseEnvInt('MAX_CONCURRENCY', 50, 1, 1000); // validates range 1-1000 with default 50
const QUEUE_LIMIT = parseEnvInt('QUEUE_LIMIT', 5, 1, 100); // validates range 1-100 with default 5
const HISTORY_MAX = 50; // maximum entries kept in performance history file

const {setTimeout} = require('node:timers/promises'); // promise-based timer to replace delay utility

/*
 * SINGLE REQUEST TIMING MEASUREMENT
 * 
 * MEASUREMENT METHODOLOGY:
 * Uses performance.now() for high-resolution timing that's not affected by
 * system clock adjustments. Measures total time including:
 * - DNS resolution
 * - TCP connection establishment
 * - TLS handshake (for HTTPS)
 * - HTTP request/response
 * - Data transfer
 * 
 * This provides end-to-end timing that reflects user experience.
 */
async function getTime(url){ 
 console.log(`getTime is running with ${url}`); // Logs request URL for debugging and monitoring
 const start = performance.now(); // Records high-resolution start timestamp
 try {
  /*
   * ENVIRONMENT-SPECIFIC REQUEST HANDLING
   * Rationale: Development environments may not have internet access.
   * CODEX environment flag enables testing measurement logic offline.
   */
  if(parseEnvBool('CODEX')){ // detects offline mode using shared parser
   console.log(`offline delay is running with 100`); // replicates delay logging for visibility
   await setTimeout(100); // non-blocking wait using timers promise
   console.log(`offline delay is returning undefined`); // logs completion matching previous utility
  } else {
   /*
    * ACTUAL NETWORK REQUEST
    * arrayBuffer responseType ensures we download the complete file
    * rather than just headers, providing realistic timing measurements.
    */
   await fetchRetry(url,{responseType:`arraybuffer`}); 
  }
  const time = performance.now() - start; // Calculates elapsed time with high precision
  console.log(`getTime is returning ${time}`); // Logs measurement result for monitoring
  return time; // Returns elapsed time in milliseconds
 } catch(err){
  qerrors(err, `getTime failed`, {url}); // Logs failure with URL context for debugging
  throw err; // Re-throws to allow caller to handle or aggregate errors
 }
}

/*
 * CONCURRENT REQUEST MEASUREMENT WITH MANUAL QUEUE MANAGEMENT
 * 
 * CONCURRENCY STRATEGY:
 * Manual batching implementation to control concurrent requests, preventing:
 * - CDN rate limiting
 * - Network congestion
 * - Local resource exhaustion
 * 
 * This approach simulates realistic user load while being respectful
 * to CDN infrastructure and providing reliable measurements.
 */
async function measureUrl(url, count){
 console.log(`measureUrl is running with ${url},${count}`); // Logs test parameters for monitoring
 try {
  if(!Number.isInteger(count) || count <= 0){ // validates request count as positive integer
   const err = new Error('count must be positive integer'); // explicit error when count invalid
   qerrors(err, 'measureUrl invalid count', {url,count}); // structured error logging for invalid parameter
   throw err; // stops execution when validation fails
  }
  /*
   * MANUAL CONCURRENCY CONTROL
   * Rationale: Processes requests in batches of QUEUE_LIMIT size
   * to prevent overwhelming the target server while still testing
   * concurrent performance characteristics. Replaces p-limit usage.
   */
  const times = []; // stores all timing results for statistical analysis
  
  /*
   * BATCH PROCESSING LOOP
   * Rationale: Divides total requests into manageable batches
   * that execute concurrently within each batch, then waits
   * before starting the next batch. This provides controlled load.
   */
  for(let i = 0; i < count; i += QUEUE_LIMIT){ // processes requests in batches
   const batchSize = Math.min(QUEUE_LIMIT, count - i); // calculates current batch size
   const batch = Array.from({length: batchSize}, () => getTime(url)); // creates batch of promises
   const batchTimes = await Promise.all(batch); // executes batch concurrently
   times.push(...batchTimes); // adds batch results to overall results
  } 
  
  /*
   * STATISTICAL ANALYSIS
   * Rationale: Average provides a single representative value for
   * comparison across CDNs and over time. Could be extended with
   * median, percentiles, or standard deviation for more detailed analysis.
   * Division by zero protection checks both count and actual results array.
   */
  const avg = (count > 0 && times.length > 0) ? times.reduce((a,b)=>a+b,0)/times.length : 0; 
  console.log(`measureUrl is returning ${avg}`); // Logs average for monitoring
  return avg; // Returns average response time for comparison
 } catch(err){
  qerrors(err, `measureUrl failed`, {url,count}); // Logs error with full test parameters
  throw err; // Re-throws to allow caller to handle failures appropriately
}
}

/*
 * BUILD HASH READER
 *
 * Rationale: Reads build.hash when available to construct filenames
 * without failing when the file is missing. Using fs promises keeps
 * the function lightweight and consistent with other async file ops.
 */
async function readBuildHash(){
 console.log(`readBuildHash is running with build.hash`); // entry log for debugging
 try {
  const data = await fs.promises.readFile('build.hash','utf8'); // read hash file content
  const trimmed = data.trim(); // remove trailing whitespace
  if(!/^[a-f0-9]{8}$/.test(trimmed)){ // checks hash pattern to ensure valid filename usage
    qerrors(new Error('invalid hash'), 'readBuildHash invalid', {hash:trimmed}); // logs invalid hash with context
    console.log("readBuildHash is returning ''"); // communicates failure fallback
    return ''; // return empty string when hash invalid
  }
  console.log(`readBuildHash is returning ${trimmed}`); // log success
  return trimmed; // return trimmed hash
 } catch(err){
  if(err.code !== 'ENOENT'){ qerrors(err, 'Failed to read build hash', {filename:'build.hash'}); } // unexpected error logging
  console.log(`readBuildHash is returning ''`); // log fallback case
  return ''; // fallback when file missing or unreadable
 }
}

/*
 * MAIN EXECUTION FUNCTION - TEST ORCHESTRATION
 * 
 * WORKFLOW:
 * 1. Read current build hash to test correct CSS version
 * 2. Construct test URLs for all CDN endpoints
 * 3. Parse command line arguments for test configuration
 * 4. Execute tests against all endpoints
 * 5. Display results and optionally save to JSON for historical tracking
 * 
 * This provides comprehensive CDN performance evaluation with flexible
 * configuration and optional data persistence.
 */
async function run(){
 console.log(`run is running with ${process.argv.length}`); // Logs execution start for monitoring
 try {
  /*
   * BUILD HASH INTEGRATION
   * Rationale: Tests must use the current CSS version to provide meaningful
   * results. Reading from build.hash ensures we're testing the same files
   * that users will actually receive. Fallback to core.min.css handles
   * cases where build hasn't run yet.
   */
  const hash = await readBuildHash(); // Read current build hash with local helper
  let fileName = `core.${hash}.min.css`; if(!hash){ fileName = `core.min.css`; } // Falls back when hash is empty
  
  /*
   * CDN ENDPOINT CONFIGURATION
   * Rationale: Testing multiple CDNs provides:
   * - Performance comparison data
   * - Failover validation
   * - Geographic performance insights
   * jsDelivr and GitHub Pages chosen as primary/secondary CDN strategy.
   */
  const urls = [
   `${CDN_BASE_URL}/gh/Bijikyu/qoreCSS/${fileName}`, // Primary CDN (configurable)
   `https://bijikyu.github.io/qoreCSS/${fileName}` // Secondary CDN (GitHub Pages)
  ];
  
  /*
   * COMMAND LINE ARGUMENT PARSING
   * Rationale: Flexible CLI interface enables:
   * - Integration with CI/CD systems
   * - Manual testing with different parameters
   * - Automated monitoring with result persistence
   */
  const args = process.argv.slice(2); 
  const jsonFlag = args.includes(`--json`); // Enables JSON output for automated processing
  if(jsonFlag){ args.splice(args.indexOf(`--json`),1); } // Removes flag from numeric arguments
  
  /*
   * REQUEST COUNT CONFIGURATION WITH SAFETY LIMITS
   * Rationale: Configurable request count enables testing different load patterns
   * while safety limits prevent accidental DDoS of CDN endpoints.
   * Default of 5 provides meaningful load testing without being aggressive.
   * Range validation prevents resource exhaustion from invalid values.
   */
  let requestCount = parseInt(args[0],10); // parses CLI arg as integer
  if(Number.isNaN(requestCount) || requestCount < 1 || requestCount > 1000){ requestCount = 5; } // validates range with sensible default
  requestCount = Math.max(1, requestCount); // ensures at least one request to avoid divide by zero
  if(requestCount > MAX_CONCURRENCY){ console.log(`run requestCount exceeds ${MAX_CONCURRENCY}`); requestCount = MAX_CONCURRENCY; } // caps by env derived limit
  console.log(`run requestCount set to ${requestCount}`); // logs final request count setting
  
  /*
   * TEST EXECUTION ACROSS ALL ENDPOINTS
   * Rationale: Sequential testing of each endpoint prevents interference
   * between tests while still providing comprehensive performance data.
   * Results object enables structured output for automated processing.
   */
  const results = {}; // stores results for optional JSON output
  let firstAvg; // captures first URL average for function return
  for(const url of urls){
   const avg = await measureUrl(url, requestCount); // Executes performance test
   console.log(`Average for ${url}: ${avg.toFixed(2)}ms`); // Displays human-readable results
   if(firstAvg === undefined){ firstAvg = avg; } // records first result for return value
   if(jsonFlag){ results[url] = avg; } // Stores results for JSON output
  }
  
  /*
   * HISTORICAL DATA PERSISTENCE
   * Rationale: JSON output enables:
   * - Performance trending over time
   * - Integration with monitoring dashboards
   * - Automated alerting on performance degradation
   * Timestamped entries allow correlation with deployments and incidents.
   */
  if(jsonFlag){
   const file = `performance-results.json`;
   let history = [];
   if(fs.existsSync(file)){ // only attempt to read when file present
    try {
     history = JSON.parse(fs.readFileSync(file, 'utf8')); // parses existing history when valid
    } catch(err){
     qerrors(err, 'history parse failed', {file}); // logs parse failure with context
     history = []; // falls back to empty array on parse error
    }
   }
   const entry = {timestamp: new Date().toISOString(), results}; // Creates timestamped entry
   history.push(entry); // Appends to historical data
   if(history.length > HISTORY_MAX){ history.splice(0, history.length - HISTORY_MAX); } //(trim old results before write)
   fs.writeFileSync(file, JSON.stringify(history, null, 2)); // Saves trimmed history for ongoing tracking
  }
  const returnVal = firstAvg ?? 0; // ensures numeric return when no results
  console.log(`run is returning ${returnVal}`); // Logs value returned for monitoring
  return returnVal; // returns first average to caller
 } catch(err){
  qerrors(err, 'run failed', {args:process.argv.slice(2)}); // uses project logger for structured error output
  throw err; // Re-throws error to allow caller to handle appropriately
 }
}

/*
 * DIRECT EXECUTION HANDLER
 * Rationale: Enables command line usage for manual testing, CI/CD integration,
 * and automated monitoring while keeping functions available for import.
 */
if(require.main === module){
 run().catch(err => { // Handles async failures when run directly for CLI usage
  qerrors(err, 'performance script failure', {args:process.argv.slice(2)}); // uses project logger for structured error output
  process.exitCode = 1; // Signals failure status to calling processes
 });
}

module.exports = {CDN_BASE_URL, getTime, measureUrl, run}; // exports normalized base url for tests and other functions for reuse
