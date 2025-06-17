# Self-hosting qoreCSS

When serving `qoreCSS` from your own infrastructure you should mirror the cache and compression settings used on the CDN. Lines 1‑13 of [`deployment/nginx.conf`](../deployment/nginx.conf) show an Nginx snippet configuring `gzip_static on;` and `brotli_static on;` along with long cache headers:

```nginx
location ~* \.(?:css|png|jpe?g|svg|gif)$ {
    gzip_static on;
    gzip_types text/css image/svg+xml image/png image/jpeg image/gif;
    brotli_static on;
    brotli_types text/css image/svg+xml image/png image/jpeg image/gif;
    add_header Cache-Control "public, max-age=31536000, immutable";
    etag on;
    last_modified on;
}
```

For HTML documents send a very short cache header so visitors always get the latest file:

```nginx
location ~* \.html$ {
    add_header Cache-Control "no-cache";
}
```
<!-- //short cache header snippet for html pages -->

These directives ensure precompressed `.gz` and `.br` files are served when present and cached by browsers for up to one year without revalidation thanks to the `immutable` directive. The `ETag` and `Last-Modified` headers allow conditional requests so clients avoid re-downloading unchanged files. Using `last_modified on;` tells Nginx to emit the actual file modification time so browsers can send `If-Modified-Since` and receive `304 Not Modified` when appropriate.

## Hashed file names

The build script renames `core.min.css` to a file containing an eight character SHA‑1 hash (for example `core.77526ae8.min.css`). This unique filename lets you serve the file with `Cache-Control: public, max-age=31536000, immutable` because updates produce a completely new filename. Older hashed files are removed on each build so only the latest hash is present. When a new build is deployed you must purge any CDN caches so the new hashed file is available; otherwise clients may continue receiving the old file for up to a year.
Run `node scripts/purge-cdn.js` after each build to automate cache purging across providers. <!-- provides recommended script for cache purge --> When no network access is available you can set `CODEX=true` to simulate the purge.

