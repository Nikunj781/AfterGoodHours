# AfterGoodHours frontend

The AfterGoodHours frontend is a React application built with Vite. For full
project setup, environment variables, and deployment instructions, see the
[repository README](../../README.md).

## Development

From the repository root, install frontend dependencies and start the dev
server:

```bash
npm install --prefix frontend/vite-project
npm run dev
```

Configure `VITE_API_URL` and `VITE_RAZORPAY_KEY_ID` in this directory's `.env`
file before running the application. Use the matching `.env.example` as a
template.

## Build and lint

Run these commands from the repository root:

```bash
npm run build
npm run lint
```
