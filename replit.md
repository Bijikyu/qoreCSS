# qoreCSS Framework

## Overview

This is a modern CSS framework called qoreCSS designed for rapid web development with zero-configuration deployment. The framework provides beautiful default styles, utility classes, and a sophisticated build system optimized for CDN delivery with content-based hashing for aggressive cache management.

## System Architecture

The project follows a static site architecture with advanced build tooling:

### Frontend Architecture
- **Pure CSS Framework**: No JavaScript dependencies for core functionality
- **Utility-First Approach**: Provides utility classes for rapid development
- **Design System**: Centralized CSS variables in `variables.css` for consistent theming
- **Responsive Design**: Mobile-first approach with built-in media queries

### Build System Architecture
- **Content-Based Hashing**: Generates SHA1 hashes for cache-busting (8-character truncated)
- **PostCSS Pipeline**: Uses autoprefixer and cssnano for cross-browser compatibility and optimization
- **Multi-Format Compression**: Generates gzip and brotli compressed variants
- **Automatic Cleanup**: Removes old build artifacts to prevent accumulation

### Distribution Strategy
- **Multi-CDN Deployment**: Supports jsDelivr and GitHub Pages
- **NPM Package**: Dual distribution as both CDN and npm package
- **Browser Injection**: Automatic CSS injection when loaded via script tag

## Key Components

### Core CSS Files
- `qore.css` - Main framework styles with utilities and components
- `variables.css` - Design system variables and color scheme
- `core.{hash}.min.css` - Production build with content hash

### Build System
- `scripts/build.js` - Main build orchestration with PostCSS pipeline
- `scripts/updateHtml.js` - Updates HTML references with current hashes
- `scripts/purge-cdn.js` - CDN cache invalidation for immediate updates

### Performance Monitoring
- `scripts/performance.js` - CDN response time measurement and monitoring
- `scripts/request-retry.js` - HTTP client with exponential backoff retry logic

### NPM Module Interface
- `index.js` - Universal entry point supporting Node.js, bundlers, and browsers
- Provides file paths, helper functions, and automatic browser injection

### Testing Infrastructure
- Comprehensive test suite covering build, integration, performance, and browser scenarios
- Offline testing capability with mocked dependencies
- Environment-specific testing for different deployment scenarios

## Data Flow

1. **Development**: CSS written in `qore.css` and `variables.css`
2. **Build Process**: PostCSS transforms and optimizes CSS, generates content hash
3. **Asset Management**: `updateHtml.js` updates references with current hash
4. **Deployment**: Files deployed to CDN with automatic cache purging
5. **Distribution**: Available via CDN links or npm package installation
6. **Performance Monitoring**: Automated testing validates CDN response times

## External Dependencies

### Build Dependencies
- **PostCSS Ecosystem**: `postcss`, `autoprefixer`, `cssnano` for CSS processing
- **JSDOM**: Browser environment simulation for testing
- **Axios**: HTTP client for CDN operations and performance testing

### Runtime Dependencies
- **axios-retry**: Exponential backoff for network resilience
- **env-var**: Environment variable parsing and validation

### Optional Dependencies
- **qerrors**: Structured error logging (falls back to console.error)
- **qtests**: Testing utilities

## Deployment Strategy

The framework uses a multi-stage deployment approach:

### Static Site Deployment
- **Platform**: Replit static hosting
- **Entry Point**: `index.html` with framework demonstration
- **Configuration**: `.replit` defines static deployment target

### CDN Distribution
- **Primary CDN**: jsDelivr for global distribution
- **Secondary**: GitHub Pages as fallback
- **Cache Strategy**: Content-based hashing enables indefinite caching
- **Invalidation**: Automated purge scripts for immediate updates

### NPM Distribution
- **Package**: `qorecss` on npm registry
- **Entry Point**: `index.js` with universal compatibility
- **File Inclusion**: CSS files and documentation included in package

## Changelog

- June 17, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.