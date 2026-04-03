# Cricket game UI

React + Vite front end with an Express server for production builds.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/installation) (this repo uses pnpm; see `package.json` → `packageManager`)

## Install dependencies

From the project root:

```bash
pnpm install
```

## Run in development (recommended)

Start the Vite dev server (hot reload, fast refresh):

```bash
pnpm dev
```

The dev server listens on **port 3000** by default. Open a browser at:

**http://localhost:3000/**

If port 3000 is already in use, Vite picks the next free port—check the terminal output for the exact URL (for example `http://localhost:3001/`).

`pnpm dev` runs Vite with `--host`, so you can also use your machine’s LAN IP from another device on the same network (the terminal prints network URLs when it starts).

## Production build and server

Build the client and bundle the Node server:

```bash
pnpm build
```

Run the production server:

```bash
pnpm start
```

By default the app is served at **http://localhost:3000/**. Override the port with the `PORT` environment variable, for example:

```bash
PORT=8080 pnpm start
```

## Other scripts

| Command        | Description                    |
| -------------- | ------------------------------ |
| `pnpm preview` | Preview the production build locally (Vite preview, with `--host`) |
| `pnpm check`   | Typecheck with TypeScript      |
| `pnpm format`  | Format code with Prettier      |
