# PeerScribe

PeerScribe is a local-first collaborative editor built for classroom and workshop environments that operate on a LAN without relying on cloud databases. The application uses Yjs CRDTs, WebRTC peer networking, and IndexedDB persistence so each participant can keep working from the browser even when the internet is unavailable.

## Stack

- React 19 + Vite + TypeScript
- Tiptap 3 for rich-text editing
- Yjs, `y-webrtc`, and `y-indexeddb` for synchronization and local persistence
- Mammoth for DOCX import
- `html-docx-js` and `html2pdf.js` for local export
- Framer Motion and custom CSS for the interface

## How Collaboration Works

1. Each room maps to a Yjs document namespace.
2. The browser stores document updates in IndexedDB for offline recovery.
3. Peers exchange updates through `y-webrtc`.
4. Presence information is shared through Yjs awareness and rendered in the top bar.

Peer discovery is designed for local deployment. When the app runs on a LAN host, the client first tries a signaling server on that same host at port `4444`, then falls back to the official `y-webrtc` relay if it is reachable. On `localhost`, it skips the local WebSocket attempt unless you configure `VITE_SIGNALING_URLS` explicitly. You can override all defaults with `VITE_SIGNALING_URLS`.

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

If you do not run `npm run signaling`, collaboration can still work through the fallback relay when internet access is available. For LAN-only or offline classrooms, run the local signaling server.

## Environment Variables

Create a local `.env` file if you need custom signaling endpoints:

```bash
VITE_SIGNALING_PORT=4444
VITE_SIGNALING_URLS=ws://192.168.1.20:4444
```

`VITE_SIGNALING_URLS` accepts a comma-separated list. When it is not set, the app uses `ws://<current-hostname>:<VITE_SIGNALING_PORT>` only for non-localhost hosts and otherwise falls back directly to the default `y-webrtc` relay.

## Available Scripts

- `npm run dev` starts Vite for local development.
- `npm run dev:host` starts Vite on `0.0.0.0` for LAN access.
- `npm run signaling` starts the local `y-webrtc` signaling server on port `4444`.
- `npm run build` creates the production bundle.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint.

## Export and Import

- DOCX import goes through Mammoth and is applied through the Tiptap document model so Yjs stays in sync.
- DOCX and PDF export are served locally with the app. They no longer depend on runtime CDN scripts.

## Editing Features

- Headings, inline formatting, code blocks, quotes, highlights, and text colors
- Text alignment, links, horizontal rules, ordered lists, bullet lists, and task lists
- Basic collaborative tables with insert, row, column, and delete controls

## Project Docs

- `README.md`: setup and operational overview
- `ARCHITECTURE.md`: system design and runtime flow
- `RULES.md`: repository and documentation rules
