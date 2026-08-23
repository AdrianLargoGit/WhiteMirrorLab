# Marketplace R2 Upload Worker

This Worker lets the Next.js app store marketplace files in Cloudflare R2 without using a Cloudflare Account API token in the app.

If you paste code into Cloudflare's browser editor, use `r2-upload-worker.js`.
If you deploy with a TypeScript toolchain such as Wrangler, `r2-upload-worker.ts` is also available.

Required Worker bindings:

- `MARKETPLACE_BUCKET`: R2 bucket binding.
- `WML_UPLOAD_SECRET`: a long random secret shared only with the Next.js server.

Required Next.js environment variables:

```env
CLOUDFLARE_R2_UPLOAD_WORKER_URL=https://your-worker.your-subdomain.workers.dev
CLOUDFLARE_R2_UPLOAD_WORKER_SECRET=the-same-long-random-secret
```
