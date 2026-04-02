# PeerScribe

PeerScribe is a static, local-first collaborative editor for classrooms and workshops. It runs as a client-side React application, keeps the document in Yjs, persists locally with IndexedDB, and uses PeerJS Cloud as the rendezvous layer for browser-to-browser collaboration.

The interface is localized in Spanish, Galician, English, French, Portuguese, German, Catalan, and Basque, with client-side language selection persisted in the browser.

## Stack

- React 19 + Vite + TypeScript
- Tiptap 3 for rich-text editing
- Yjs + `y-protocols` for CRDT state and awareness
- PeerJS for peer discovery and WebRTC data channels
- `y-indexeddb` for browser persistence
- Mammoth for DOCX import
- `html-docx-js` and `html2pdf.js` for local export

## How Collaboration Works

1. Each room maps to a Yjs document namespace and a deterministic PeerJS host ID.
2. The first browser to claim the room host ID becomes the room hub for that session.
3. Later browsers connect to that host through PeerJS Cloud and exchange document updates over WebRTC data channels.
4. Yjs awareness is forwarded through the same peer mesh so cursors and participant presence stay in sync.
5. IndexedDB stores the room locally for offline recovery on each device.

The application is compatible with static hosting such as Nginx because it does not require custom server code in the app deployment. The collaboration rendezvous step depends on a reachable PeerJS server. By default, the app uses PeerJS Cloud.

The production build is configured to be served from `/documentando/`.

## Local Development

Install dependencies:

```bash
npm install
```

Start the Vite app:

```bash
npm run dev
```

Expose it to the LAN when you want other devices to join:

```bash
npm run dev:host
```

## Environment Variables

PeerJS Cloud works without extra configuration. If you want to point the client to a custom PeerServer later, create a local `.env` file:

```bash
VITE_PEER_HOST=0.peerjs.com
VITE_PEER_PORT=443
VITE_PEER_PATH=/
VITE_PEER_SECURE=true
```

If `VITE_PEER_HOST` is not set, PeerJS defaults are used automatically.

## Available Scripts

- `npm run dev` starts Vite for local development.
- `npm run dev:host` starts Vite on `0.0.0.0` for LAN access.
- `npm run build` creates the production bundle.
- `npm run preview` serves the production build locally.
- `npm run preview:host` serves the production build on the LAN.
- `npm run lint` runs ESLint.

## Import and Export

- DOCX import goes through Mammoth and replaces content through the Tiptap command layer.
- DOCX export is served from the app bundle and generated locally in the browser.
- PDF export is generated locally from the editor DOM.
- Images can be inserted from local files, pasted from the clipboard, dragged into the document, or added by URL.
- Embedded images are limited to 500 KB to keep peer-to-peer sessions responsive.

## Editing Features

- Headings, block quotes, code blocks, inline code, highlights, and text color
- Links, alignment controls, horizontal rules, lists, and task lists
- Collaborative tables with insert, row, column, and delete controls
- Embedded images with resize handles and client-side storage
- Remote cursor labels and tinted collaborative selections for active collaborators
- A leave-document action that returns the user to the room join screen without reloading the app

## Project Docs

- `README.md`: setup and operational overview
- `ARCHITECTURE.md`: runtime design and collaboration flow
- `RULES.md`: repository and maintenance rules
