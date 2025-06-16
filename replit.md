# qoreCSS Framework

## Overview

qoreCSS is a modern, lightweight CSS framework designed for rapid web development with zero-configuration deployment. The framework emphasizes performance optimization through sophisticated build tooling, CDN distribution, and comprehensive testing infrastructure. It provides beautiful default styles, utility classes, and a complete design system while maintaining minimal bundle size and maximum browser compatibility.

## System Architecture

### Frontend Architecture
- **Pure CSS Framework**: No JavaScript dependencies, works with any frontend technology
- **Utility-First Design**: Comprehensive utility classes for rapid development (flexbox, grid, spacing, typography)
- **Design System**: CSS custom properties-based theming with consistent color palette and spacing scale
- **Responsive Design**: Mobile-first approach with built-in responsive utilities
- **Browser Compatibility**: Autoprefixer ensures cross-browser support with vendor prefixes

### Backend Architecture
- **Static Site Generation**: Deployed as static assets with no server-side requirements
- **Build Pipeline**: Node.js-based build system with PostCSS processing
- **Content-Based Hashing**: SHA1 truncated to 8 characters for aggressive CDN caching
- **Compression**: Automated gzip and brotli compression for optimal delivery
- **Module System**: CommonJS/ESM compatible npm package with browser auto-injection

### Build System
- **PostCSS Pipeline**: Autoprefixer → CSS minification → compression
- **Hash-Based Versioning**: Content-based hashing prevents cache issues
- **Multi-Format Output**: Generates .css, .min.css, .gz, and .br variants
- **Index.js Injection**: Automatically updates module entry point with current hash

## Key Components

### Core CSS Framework (`qore.css`)
- Comprehensive CSS reset and normalization
- Typography system with optimal line heights and font stacks
- Flexbox and CSS Grid utilities
- Color system with accessibility-compliant contrast ratios
- Responsive utilities and breakpoint management
- Form styling with client-side validation support

### Build Infrastructure
- **Build Script** (`scripts/build.js`): Orchestrates CSS processing, hashing, and compression
- **HTML Updater** (`scripts/updateHtml.js`): Synchronizes asset references with build hashes
- **CDN Purge** (`scripts/purge-cdn.js`): Invalidates CDN caches for immediate deployment
- **Performance Monitor** (`scripts/performance.js`): Measures CDN response times and reliability

### NPM Package Interface (`index.js`)
- Universal module compatibility (Node.js, browsers, bundlers)
- Automatic CSS injection in browser environments
- Path resolution helpers for build tools
- Environment detection and graceful fallbacks

### Testing Infrastructure
- **Unit Tests**: Individual function validation with comprehensive edge case coverage
- **Integration Tests**: End-to-end workflow validation (build → HTML update → CDN purge)
- **Performance Tests**: CDN response time measurement and historical tracking
- **Browser Tests**: JSDOM-based validation of browser injection functionality

## Data Flow

### Build Process
1. **CSS Processing**: PostCSS transforms source CSS with autoprefixer and minification
2. **Hash Generation**: SHA1 content hash provides cache-busting capability
3. **File Operations**: Old versions cleaned up, new version renamed with hash
4. **Compression**: Parallel gzip and brotli compression for optimized delivery
5. **Index Update**: Module entry point updated with current hash for npm consumers

### Deployment Workflow
1. **Build Execution**: Generates hashed CSS files and compression variants
2. **HTML Synchronization**: Updates HTML references to match current build hash
3. **CDN Distribution**: Files deployed to jsDelivr and GitHub Pages
4. **Cache Invalidation**: CDN purge ensures immediate availability of new versions
5. **Performance Validation**: Response time monitoring confirms successful deployment

### NPM Package Usage
1. **Module Import**: Consumers import via require() or import statements
2. **Path Resolution**: Module provides absolute paths to CSS files
3. **Browser Detection**: Automatically injects CSS when window object detected
4. **Fallback Handling**: Graceful degradation when dependencies unavailable

## External Dependencies

### Production Dependencies
- **axios**: HTTP client for CDN operations and performance testing
- **axios-retry**: Exponential backoff retry logic for network resilience
- **env-var**: Robust environment variable parsing with validation

### Development Dependencies
- **PostCSS Ecosystem**: `postcss`, `autoprefixer`, `cssnano` for CSS processing
- **Testing Framework**: Node.js native test runner with JSDOM for browser simulation
- **Code Quality**: Stylelint with standard configuration for CSS validation
- **Error Handling**: `qerrors` for structured logging (optional dependency)

### CDN Services
- **jsDelivr**: Primary CDN with global edge network and purge API
- **GitHub Pages**: Secondary CDN leveraging repository hosting
- **Multi-CDN Strategy**: Fallback redundancy and performance optimization

## Deployment Strategy

### Static Site Deployment
- **Target**: Static web hosting (Replit, GitHub Pages, Netlify, etc.)
- **Assets**: HTML, CSS, and compressed variants only
- **Configuration**: Environment variables for CDN endpoints and performance limits

### CDN Distribution
- **Primary**: jsDelivr with npm package integration
- **Secondary**: GitHub repository direct access
- **Cache Strategy**: Content-based hashing with indefinite cache headers
- **Invalidation**: API-based purge for immediate updates

### Environment Configuration
- **Development**: CODEX=True for offline testing without network dependencies
- **Staging**: Custom CDN_BASE_URL for testing infrastructure
- **Production**: Default jsDelivr endpoints with performance monitoring

### Performance Optimization
- **Compression**: Pre-compressed gzip and brotli variants
- **Caching**: Aggressive CDN caching with hash-based invalidation
- **Monitoring**: Automated performance testing across multiple endpoints
- **Concurrency**: Configurable limits to respect CDN rate limits

## Changelog

- June 16, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.