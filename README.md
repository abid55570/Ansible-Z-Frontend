# Ansible-Z — Frontend (Next.js)

Landing page + dashboard for the Ansible-Z platform.

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind · framer-motion · react-three-fiber (3D) · Google Sign-In.

## Run locally

```bash
npm install
copy .env.example .env.local      # then edit values
npm run dev                        # http://localhost:3000
```

## Test + coverage

```bash
npm run test            # unit tests (vitest)
npm run test:coverage   # logic layer gated at 93%
```

## Structure

```
app/
  page.tsx               landing page (composes landing sections)
  login/page.tsx         Google Sign-In (GIS) -> POST /auth/google
  dashboard/page.tsx     pick-a-template dashboard
  templates/[slug]/page.tsx   wizard: guided variables per env -> generate -> download
components/
  landing/*              Navbar, Hero, Features, HowItWorks, TemplatesShowcase, Benefits, CTA, Footer
  three/HeroScene        react-three-fiber 3D hero
  wizard/VariableField   one guided input (what / how-to-get / uat-check)
lib/
  templates.ts           the 11 template cards (landing)
  api.ts                 typed backend client (credentials: include)
  wizard.ts              per-env required/validation logic
tests/                   vitest — lib + wizard at 100% coverage
```

## Auth
Login uses Google Identity Services in the browser to obtain an ID token, which is POSTed to the backend
`/auth/google`. The backend verifies it and sets an httpOnly session cookie. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
and add `http://localhost:3000` to the Google OAuth **Authorized JavaScript origins**.

## Next (phase 1+)
Template detail + variable wizard (guided inputs), generate/download flow, project list, Playwright E2E.
See `../docs/PLAN.md`.
