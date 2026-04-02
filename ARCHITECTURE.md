# Architecture

## Overview

PeerScribe is a client-heavy React application. The browser owns the editor state, persistence, and peer communication. The only required network-side service for multi-device collaboration is a WebRTC signaling server, which can run on the same LAN as the app host.

## Runtime Pieces

- `src/App.tsx`
  - Handles room join flow.
  - Creates and disposes the collaboration session.
  - Owns file import/export actions.
- `src/components/Layout/TopBar.tsx`
  - Displays room identity, connected users, and file actions.
- `src/components/Editor/Workspace.tsx`
  - Mounts the Tiptap editor instance.
  - Binds the editor to Yjs through the Tiptap collaboration extensions.
  - Enforces the clipboard image size guard.
- `src/components/Editor/TiptapToolbar.tsx`
  - Renders formatting controls for headings, marks, links, alignment, lists, tables, highlights, and text colors.
  - Reflects active editor state through Tiptap React bindings.
- `src/services/collaboration.ts`
  - Creates the Yjs document.
  - Connects `y-webrtc` with a same-host signaling endpoint first and a public fallback relay second.
  - Enables IndexedDB persistence.
  - Exposes awareness-derived presence data.
- `src/services/fileProcessing.ts`
  - Imports DOCX through Mammoth.
  - Exports DOCX and PDF through locally served client-side libraries loaded on demand.

## Collaboration Flow

1. A user enters a name and room identifier.
2. `App.tsx` creates a `CollaborationService` instance and stores it in React state.
3. `CollaborationService` opens:
   - a `Y.Doc` for shared text
   - a `WebrtcProvider` for peer transport
   - an `IndexeddbPersistence` store for offline recovery
4. `Workspace.tsx` binds the room text fragment (`content`) to Tiptap through the collaboration extensions.
5. Awareness state is observed and mapped to stable client IDs for the participant list.

## Signaling Strategy

- Default signaling order:
  - non-localhost host: `ws://<current-hostname>:4444`, then `wss://y-webrtc-eu.fly.dev`
  - localhost: `wss://y-webrtc-eu.fly.dev`
- Override mechanism: `VITE_SIGNALING_URLS`
- Local signaling process: `npm run signaling`

This keeps the default setup LAN-friendly while still working out of the box when the local signaling server is not running.

## File Processing Flow

- DOCX import:
  - Read the file with `FileReader`
  - Convert DOCX to HTML with Mammoth
  - Replace Tiptap content through editor commands
- DOCX export:
  - Serialize editor HTML
  - Load `html-docx-js` on demand
  - Generate and download the blob locally
- PDF export:
  - Capture the editor DOM subtree
  - Load `html2pdf.js` on demand
  - Generate and save the PDF locally

## Deployment Notes

- The app can be served as static files.
- Multi-device collaboration works through a reachable signaling endpoint. The app prefers a LAN-local endpoint and falls back to the official relay when available.
- Same-browser tab collaboration can still work through broadcast channels even without the signaling server.
