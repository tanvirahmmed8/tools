# TextExtract AI

Tools.tanvirsoft.com is a Next.js 16 application that provides:

- Image → text extraction powered by GPT-4o
- PDF → text parsing via `pdf-parse`
- PDF → image rendering with download-all ZIP support

## Local Development

```bash
# install dependencies
npm install

# run dev server on http://localhost:3000
npm run dev

# typecheck / lint (optional)


# production build
npm run build
npm run start
```

Set required environment variables in `.env.local` (see `.env.example`). At minimum you need `OPENAI_API_KEY`.

## Deployment (Nginx + PM2)

1. Build the project: `npm run build`
2. Start with PM2 on an unused port, e.g. `pm2 start "npm run start -- -p 3100" --name tools-tanvirsoft`
3. Point an Nginx reverse proxy at `http://127.0.0.1:3100`

See [NGINX_DEPLOYMENT.md](NGINX_DEPLOYMENT.md) for a full guide (certbot, logs, updates, etc.).

## Project Structure Highlights

- `app/` – Next.js routes and server actions
- `components/` – UI building blocks (drop zones, converters, structured data script)
- `seo/` – JSON metadata definitions loaded per page
- `lib/seo.ts` – helper to convert SEO JSON into Next.js metadata

## Testing Functional Flows

- Image OCR: upload or paste an image, confirm AI output
- PDF → text: upload text-based PDF, verify extracted copy
- PDF → image: upload PDF, confirm page previews, per-page PNG downloads, and ZIP downloads

## Reporting Issues

Please include:
- Steps to reproduce
- Relevant PDF/image samples
- Logs from `npm run dev` or PM2

This documentation intentionally avoids any vendor analytics recommendations to keep the stack self-hosted and privacy focused.
