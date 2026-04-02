# Rules

## Language

- Use English for code identifiers, file names, code comments, commit messages, and Markdown documentation.
- Keep user-facing UI copy consistent with the product audience, but technical repository artifacts must remain in English.

## Documentation Integrity

- Update Markdown documentation whenever behavior, runtime requirements, or architecture changes.
- Keep `README.md`, `ARCHITECTURE.md`, and `RULES.md` aligned with the current implementation.
- Do not leave undocumented operational requirements. If collaboration needs signaling infrastructure, document it explicitly.

## Collaboration Constraints

- Preserve local-first behavior by keeping persistence in the browser through IndexedDB.
- Keep the browser collaboration layer compatible with static hosting.
- Treat the rendezvous requirement as explicit infrastructure. If the app depends on PeerJS Cloud or another PeerServer, document it clearly.
- Treat Yjs and Tiptap as the source of truth for editor state. Do not mutate the editor DOM directly when changing document content.

## Quality Gates

- `npm run lint` must pass before finishing a task.
- `npm run build` must pass before finishing a task.
- Review presence, import/export, and room initialization flows after collaboration changes because they are tightly coupled.
