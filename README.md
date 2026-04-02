# PeerScribe

PeerScribe is a local-first collaborative editor built for classroom and workshop environments that operate on a LAN without relying on cloud databases. The application uses Yjs CRDTs, WebRTC peer networking, and IndexedDB persistence so each participant can keep working from the browser even when the internet is unavailable.

## Stack

- React 19 + Vite + TypeScript
- Quill 2 for rich-text editing
- Yjs, `y-webrtc`, and `y-indexeddb` for synchronization and local persistence
- Mammoth for DOCX import
- `html-docx-js` and `html2pdf.js` for local export
- Framer Motion and custom CSS for the interface

## How Collaboration Works

1. Each room maps to a Yjs document namespace.
2. The browser stores document updates in IndexedDB for offline recovery.
3. Peers exchange updates through `y-webrtc`.
4. Presence information is shared through Yjs awareness and rendered in the top bar.

Peer discovery is designed for local deployment. By default, the client looks for a signaling server on the same host at port `4444`. You can override this with `VITE_SIGNALING_URLS` if your signaling endpoint runs elsewhere.

## Local Development

Install dependencies:

```bash
npm install
```

Start the WebRTC signaling server in one terminal:

```bash
npm run signaling
```

Start the Vite app in another terminal and expose it to the LAN:

```bash
npm run dev:host
```

The editor will be available on the host machine and other devices on the same network. Tabs in the same browser can also synchronize through broadcast channels.

## Environment Variables

Create a local `.env` file if you need custom signaling endpoints:

```bash
VITE_SIGNALING_PORT=4444
VITE_SIGNALING_URLS=ws://192.168.1.20:4444
```

`VITE_SIGNALING_URLS` accepts a comma-separated list. When it is not set, the app derives a single URL from the current hostname and `VITE_SIGNALING_PORT`.

## Available Scripts

- `npm run dev` starts Vite for local development.
- `npm run dev:host` starts Vite on `0.0.0.0` for LAN access.
- `npm run signaling` starts the local `y-webrtc` signaling server on port `4444`.
- `npm run build` creates the production bundle.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint.

## Export and Import

- DOCX import goes through Mammoth and is applied through the Quill document model so Yjs stays in sync.
- DOCX and PDF export are served locally with the app. They no longer depend on runtime CDN scripts.

## Project Docs

- `README.md`: setup and operational overview
- `ARCHITECTURE.md`: system design and runtime flow
- `RULES.md`: repository and documentation rules
