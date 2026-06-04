# Deploying the Ansible-Z frontend

A Next.js 14 app. `NEXT_PUBLIC_*` values are **inlined at build time**, so they are
passed as Docker **build args** (not runtime environment variables).

## Configuration
- `NEXT_PUBLIC_API_URL` — the backend's public URL (e.g. `https://api.example.com`).
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — the public Google client ID.

For local dev, put these in `.env.local` (copy `.env.example`).

## Production image
```bash
docker build -t ansible-z-frontend \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=<client-id> .
docker run -p 3000:3000 ansible-z-frontend
```

The image uses Next.js **standalone** output, so it is small and runs `node server.js`
as a non-root user.

## Google sign-in
Add your deployed origin (e.g. `https://app.example.com`) to the OAuth client's
**Authorized JavaScript origins** in the Google Cloud console, and set the backend's
`FRONTEND_ORIGIN` to the same URL so cookies and CORS line up.
