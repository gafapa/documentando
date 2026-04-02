# Architecture

## Overview

PeerScribe is a static React application. The browser owns editor state, persistence, and collaboration transport. Multi-device collaboration does not require app-side server code, but it does require a reachable PeerJS rendezvous service so browsers can discover each other and establish WebRTC data channels.

## Runtime Pieces

- `src/App.tsx`
  - Handles the room join flow.
  - Creates and disposes the collaboration session.
  - Owns file import and export actions.
- `src/components/Layout/TopBar.tsx`
  - Displays the room ID, participant count, and export/import actions.
- `src/components/Editor/Workspace.tsx`
  - Mounts Tiptap.
  - Connects the editor to Yjs document fragments and awareness.
  - Enforces the clipboard image size guard.
- `src/components/Editor/TiptapToolbar.tsx`
  - Renders formatting actions for headings, marks, alignment, lists, tables, colors, and links.
- `src/services/collaboration.ts`
  - Creates the Yjs document.
  - Creates the awareness instance used by Tiptap collaboration carets.
  - Connects browsers through PeerJS Cloud or an optionally configured PeerServer.
  - Maintains the room host and guest topology.
  - Persists document updates in IndexedDB.
- `src/services/fileProcessing.ts`
  - Imports DOCX through Mammoth.
  - Exports DOCX and PDF through browser-side libraries loaded on demand.

## Collaboration Flow

1. A user enters a name and room ID.
2. `App.tsx` creates a `CollaborationService`.
3. `CollaborationService` creates:
   - a `Y.Doc` for shared content
   - an `Awareness` instance for presence and carets
   - an `IndexeddbPersistence` store for local recovery
4. The service attempts to claim the deterministic room host ID on PeerJS.
5. If the claim succeeds, that browser becomes the host for the room session.
6. If the host ID is already taken, the browser opens a guest peer and connects to the room host.
7. The host forwards Yjs document updates and awareness updates to all connected guests.
8. `Workspace.tsx` binds the shared `content` fragment to Tiptap through the collaboration extensions.

## Peer Topology

- Topology: star
- Host election: first browser that opens the deterministic room host ID
- Guest behavior:
  - connect to the host peer
  - send local Yjs updates to the host
  - receive synchronized state and relayed updates from the host
- Host behavior:
  - accepts new guest connections
  - sends a full Yjs snapshot to newly joined guests
  - rebroadcasts document and awareness updates to the rest of the room
- Recovery:
  - when a guest loses the host connection, it retries and can promote itself to host if the original host is gone

## Awareness and Presence

- Tiptap collaboration carets consume a minimal provider object that exposes `awareness`.
- Presence is derived from awareness states and keyed by stable Yjs client IDs.
- Remote awareness states are removed when peer connections close so the participant list stays accurate.

## File Processing Flow

- DOCX import:
  - read the file with `FileReader`
  - convert DOCX to HTML with Mammoth
  - replace editor content through Tiptap commands
- DOCX export:
  - serialize editor HTML
  - load `html-docx-js` from the local app bundle
  - generate and download the blob in the browser
- PDF export:
  - capture the editor DOM subtree
  - load `html2pdf.js` on demand
  - generate and save the PDF locally

## Deployment Notes

- The app can be served as static files from Nginx or any other static host.
- Browser-to-browser collaboration depends on access to PeerJS Cloud by default.
- If needed, the same client code can point to a custom PeerServer through `VITE_PEER_HOST`, `VITE_PEER_PORT`, `VITE_PEER_PATH`, and `VITE_PEER_SECURE`.
- If the rendezvous server is unreachable, the editor still works locally with IndexedDB persistence, but multi-device synchronization cannot start.
