
<p align="center">
  <img height='150' width='150' src="qore.png?raw=true" alt="qoreCSS logo" /> <!-- alt text helps screen readers describe the logo for accessibility -->
</p>

# qoreCSS

A comprehensive, modern CSS framework engineered for rapid web development with performance optimization, robust testing infrastructure, and advanced build tooling. Provides beautiful default styles, utility classes, and a complete development workflow for professional web applications.

## Features

### Core Framework
- **Beautiful defaults** - Default styles that make HTML elements look great out of the box
- **Normalize.css included** - Cross-browser consistency built-in
- **Flexbox & Grid utilities** - Classes for layout positioning (`row`, `col`, `center`, `grid3`, etc.)
- **Responsive design** - Built-in media queries for all screen sizes
- **CSS animations** - Smooth, modern animations included
- **Customizable variables** - Easy theming through CSS custom properties
- **Icon support** - Color-adjustable icon system with filters
- **Glass morphism** - Modern `.obscure` class with backdrop blur effects
- **Accessible form demo** - Example contact form with required fields and client-side validation

### Advanced Development Features
- **Performance optimization** - Automated CSS minification, compression (gzip/brotli), and CDN integration
- **Build system** - Hash-based cache busting with automatic file versioning
- **CDN deployment** - Automated deployment to jsDelivr CDN with cache purging
- **Comprehensive testing** - Unit tests, integration tests, performance measurements, and error handling validation
- **Code quality tools** - Stylelint integration with modern CSS best practices
- **Environment configuration** - Flexible configuration via environment variables

## Quick Start

### CDN (Recommended for Production)
```html
<!-- Latest hashed version with optimal caching -->
<!-- core.[hash].min.css is produced by the build process and the hash changes when qore.css updates -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Bijikyu/qoreCSS/core.[hash].min.css">


<!-- Or use always-latest version (less optimal caching) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Bijikyu/qoreCSS/qore.css">
```
### Prerequisites
Node.js 20 or higher is required. Earlier Node versions may lack built-in modules used by the build system and tests.


### NPM Installation
```bash
npm install qorecss
```

#### Node.js/Build Tool Integration
```javascript
const qorecss = require('qorecss');

// Get stylesheet path for build tools
const cssPath = qorecss.getStylesheet();

// Get CSS variables file
const variablesPath = qorecss.getVariables();
```

#### Browser Auto-injection
```html
<!-- Automatically injects CSS when script loads -->
<script src="node_modules/qorecss/index.js"></script>
```

## Customization

Copy `variables.css` to your project and modify the CSS custom properties to match your design:

```css
:root {
    --color-dominant: #8b4c42;  /* Primary brand color */
    --color-two: #a0614a;       /* Secondary color */
    --color-bright: #b97a6e;    /* Accent color */
    --gs-lightest: #f5f3f3;     /* Light backgrounds */
    --gs-darkest: #2d1b13;      /* Dark backgrounds */
}
```

## Key Classes

### Layout
- `.row`, `.col` - Flexbox containers
- `.center`, `.centerAlign` - Centering utilities
- `.superCenter` - Perfect centering for main content
- `.grid`, `.grid3`, `.grid4` - CSS Grid layouts
- `.col50`, `.col80` - Percentage widths

### Styling
- `.card`, `.cardWhite` - Card components
- `.bright`, `.dark`, `.lightest` - Background colors
- `.textCenter`, `.textLeft` - Text alignment
- `.padding20`, `.margin30` - Spacing utilities
- `.obscure` - Glass morphism effect

### Icons
- `.icon` - Applies theme color adjustments
- `.iconLarge` - Large icon sizing
- `.sq15`, `.sq25` - Square icon sizes

## Development

### Environment Setup
```bash
# Install dependencies
npm install

# Build minified version with hash-based cache busting
npm run build

# Update index.html to reference hashed CSS generated above
node scripts/updateHtml.js

# Run comprehensive test suite
npm test

# Lint CSS with modern standards
npm run lint
```

Running `node scripts/updateHtml.js` after building rewrites `index.html` so
the page loads the newly hashed CSS file. This step keeps the demo synchronized
with the build output.

### Build System
The build system provides advanced features for production deployment:

- **Automatic minification** with PostCSS and cssnano
- **Hash-based cache busting** for optimal browser caching
- **Gzip and Brotli compression** for reduced file sizes
- **CDN integration** with automatic cache purging
- **Performance monitoring** with timing measurements

### Testing Infrastructure
Comprehensive testing covers all framework components:

- **Unit tests** for all utility functions and build scripts
- **Integration tests** for CDN deployment and file operations
- **Performance tests** with configurable concurrency and timing
- **Error handling validation** for robust production behavior
- **Environment configuration testing** for deployment flexibility

### Environment Variables
Configure the build and deployment process:

```bash
# CDN Configuration

CDN_BASE_URL=https://cdn.jsdelivr.net  # CDN endpoint for deployment (trailing slash removed automatically; defaults to jsDelivr when empty)

MAX_CONCURRENCY=50                     # Caps total requests processed during testing
SOCKET_LIMIT=50                        # HTTP connection pool size with lowered default

# Performance Monitoring
QUEUE_LIMIT=5                          # Number of requests run concurrently in each batch
```

`MAX_CONCURRENCY` sets the total number of requests processed, while `QUEUE_LIMIT` controls how many run in parallel at a time.

## Performance

The framework is engineered for optimal performance:

### File Optimization
- **Automated minification** with PostCSS pipeline and cssnano optimization
- **Content hashing** for aggressive browser caching with automatic cache invalidation
- **Dual compression** with both gzip and brotli encoding for maximum compatibility
- **File size monitoring** with performance regression detection

### CDN Integration
- **Global distribution** through jsDelivr CDN with edge caching worldwide
- **Automatic deployment** with cache purging for instant updates
- **Fallback strategies** with multiple CDN endpoints for reliability
- **Performance monitoring** with automated response time measurements

### Caching Strategy
- **Long-term caching** with hash-based filenames for optimal browser cache utilization
- **Instant invalidation** when content changes through automated hash updates
- **Progressive enhancement** with graceful fallbacks for older browsers

## Browser Support

Supports all modern browsers with the following baseline:
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers with equivalent versions

## Contributing

1. Fork the repository
2. Create your feature branch
3. Run tests with `npm test`
4. Submit a pull request

## Deployment

The project automatically builds and deploys to GitHub Pages on every push to `main`. The CDN is updated automatically through jsDelivr.

For self-hosting, see [docs/self-hosting.md](docs/self-hosting.md) for optimal server configuration.

## License

This project is licensed under the [MIT License](LICENSE).

## Support

<a href="https://www.buymeacoffee.com/bijikyu" target="_blank" rel="noopener noreferrer">Buy me a Coffee</a>

---

*Built with ❤️ for developers who want beautiful web apps without the complexity*
