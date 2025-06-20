# AGENTS.md

## VISION

This project serves as a modern CSS framework (qoreCSS) distributed via npm with sophisticated build tooling for CDN deployment. The business rationale centers on providing developers with a zero-configuration CSS solution that automatically handles cache busting, compression, and multi-CDN distribution. The framework prioritizes performance through content-based hashing, automated compression (gzip/brotli), and aggressive caching strategies while maintaining developer experience through automatic browser injection and flexible import patterns.

Key design philosophy: The build system generates content-hashed filenames (core.{hash}.min.css) to enable indefinite CDN caching while ensuring immediate cache invalidation when CSS changes. This approach eliminates the cache vs. freshness tradeoff that plagues many CSS frameworks.

The project architecture assumes deployment to multiple CDNs (jsDelivr, GitHub Pages) with automated purging capabilities, reflecting a strategy for high-availability CSS delivery at global scale.

## FUNCTIONALITY

AI agents working on this codebase should understand that build operations are tightly coupled - the build script updates index.js with the current hash, which must be reflected in browser injection logic. When modifying build processes, agents must ensure the regex patterns in build.js correctly match the current cssFile patterns in index.js.

Performance testing is designed for offline development (CODEX=True) with mock delays, but production testing requires actual network calls. Agents should respect this environment detection pattern when adding new network-dependent functionality.

The error logging strategy uses qerrors for contextual logging in Node environments, but falls back to console.error when qerrors is unavailable. This dual approach should be maintained for new error handling code.

Browser injection logic in index.js automatically detects script source paths to resolve CSS relative paths - this enables the framework to work both in bundled and script-tag scenarios without configuration.

Environment variable detection patterns are critical: CDN_BASE_URL for endpoint configuration, MAX_CONCURRENCY for performance testing limits, and SOCKET_LIMIT for connection pooling. Agents should preserve these configuration patterns when adding new functionality.

The testing infrastructure uses helper.js for module stubbing with axios and qerrors mocks. New test files should follow this pattern rather than implementing separate mocking strategies.

## SCOPE

### In-Scope
- CSS framework core functionality and utilities
- Build system automation (hashing, compression, CDN integration)
- Browser injection and npm module compatibility
- Performance monitoring and CDN management tools
- Testing infrastructure for offline and online scenarios

### Out-of-Scope
- JavaScript framework-specific integrations (React, Vue, etc.)
- Server-side CSS-in-JS solutions
- Database integration or backend API functionality
- User authentication or session management
- Complex UI component libraries beyond basic CSS utilities

Contributors should focus on CSS delivery optimization, build tooling improvements, and testing infrastructure. New features should align with the zero-configuration philosophy and avoid introducing breaking changes to the browser injection or npm import patterns.

## CONSTRAINTS

### Protected Files
- `package.json` - Must use packager tool for dependency changes
- `build.hash` - Generated file, never edit manually
- Core CSS output files (core.*.min.css) - Generated by build process
- `.replit` configuration - Defines static deployment target, must not be changed to server mode
- `test/helper.js` - Module stubbing foundation, changes here affect all tests

### Required Processes
- All build script changes must maintain regex compatibility with index.js patterns
- CDN purging must coordinate with build hash generation
- Test modifications require maintaining CODEX environment detection
- Performance testing changes must preserve both online/offline modes

### Technical Constraints
- No ES Modules usage (CommonJS only per REPLITAGENT.md)
- No p-limit dependency (replaced with manual batching)
- axios required over native fetch for network requests
- Content-based hashing must remain consistent across build/deploy pipeline

## POLICY

### Code Quality Requirements
All functions must include entry/exit console.log statements following the pattern:
```javascript
console.log(`functionName is running with ${parameters}`);
console.log(`functionName is returning ${returnValue}`);
```

Inline comments must explain both functionality and rationale. Multi-line commenting should occur outside functions with comprehensive explanations of design decisions.

### Build and Deployment
- Hash-based cache busting is mandatory for all CSS assets
- CDN purging must occur after successful builds
- Compressed variants (gzip/brotli) must be generated for all production CSS
- HTML updates must coordinate with hash changes

### Testing Standards
- Tests must pass in both CODEX (offline) and production environments
- Concurrency testing should use manual batching, not external rate limiting libraries
- Integration tests must verify actual CDN functionality when online
- Build tests must validate index.js hash injection accuracy

### Dependency Management
Prefer existing dependencies over custom implementations. When adding utilities, first check if qerrors, axios, or built-in Node modules can provide the functionality. Custom utilities should only be created when existing solutions don't meet the specific caching and performance requirements of CSS framework distribution.

### Deployment Constraints
The project is configured for static deployment on Replit with HTML as the entry point. The deployment target must remain static - never change to dynamic server deployment as this would break the CDN-based architecture and npm package distribution model.

### Workflow Integration
Build scripts should integrate with the static web server workflow defined in .replit. Performance and CDN scripts are designed to run independently but should respect the same environment detection patterns used throughout the project.