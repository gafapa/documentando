# PeerScribe - Editor Colaborativo Local-First

PeerScribe es un editor colaborativo en tiempo real diseñado para operar en entornos educativos que disponen de conexión local (LAN/Wi-Fi) pero que no requieren o carecen de conexión estable a bases de datos o servidores en la nube centralizados. 

Utiliza tecnología **Peer-to-Peer (P2P)** auténtica combinada con las matemáticas de **CRDTs (Yjs)** para lograr descentralización total y sincronización instantánea de los documentos.

## Arquitectura y Stack Tecnológico
* **Framework y UI:** [React](https://react.dev) + [Vite](https://vitejs.dev) + [TypeScript](https://www.typescriptlang.org/)
* **Animaciones y Estilo:** Framer Motion + Glassmorphism Premium en CSS plano.
* **Core Colaborativo:** [Yjs](https://yjs.dev/)
* **Editor de Texto:** [Quill 2](https://quilljs.com)
* **Red (Malla P2P):** `y-webrtc` (Canales WebRTC sobre servidores locales o públicos).
* **Persistencia Integrada:** `y-indexeddb` (El documento se mantiene guardado offline localmente dentro del navegador de cada ordenador para evitar pérdida accidental de datos).
* **Manejo de Formularios Externos:** 
   - `mammoth` (Importación desde `.docx`)
   - `html-docx-js` (Exportación a `.docx`)
   - `html2pdf.js` (Exportación a PDF)

## ¿Cómo Funciona el P2P Local-First?
El sistema no utiliza bases de datos corporativas. En su lugar, el flujo es el siguiente:
1. El estudiante teclea y genera un "Update" mediante el motor Yjs en formato binario (`Uint8Array`).
2. La topología de malla (`y-webrtc`) transmite automáticamente esta actualización al resto de estudiantes que están conectados a la misma **"ID de Sala"**.
3. El CRDT integrado procesa los cambios concurrentes de manera matemática libre de conflictos.
4. Tu navegador funciona siempre de *respaldo* frente al cierre de la aplicación con la base de datos temporal en `IndexedDB`.

## Requisitos Previos
* Node.js v18+ 
* Gestor de paquetes: NPM, Yarn o Pnpm.

## Ejecución en Modo Desarrollo

```bash
# Instala las dependencias del proyecto:
npm install

# Inicia el empaquetado de desarrollo de Vite:
npm run dev
```

El servidor local se abrirá en `http://localhost:5173`. Para simular una clase, puedes simplemente abrir varias pestañas o ventanas de incógnito dentro del navegador para unirte a la misma "Sala".

## Compilación para Producción (Sitio Estático)
Dado que es `Local-First`, todo el cerebro de la aplicación reside en el cliente.
Para exportar tu proyecto a ficheros HTML/CSS/JS puros listos para cualquier *CDN* (como GitHub Pages o un Nginx local), ejecuta:

```bash
npm run build
```

El bundle resultante quedará empacado y minificado en la carpeta `/dist`.

## Seguridad y Limitaciones
* **Bloqueo Inteligente:** Se ha bloqueado y advertido al usuario sobre la subida o inserción de imágenes que excedan de ~500kb vía portapapeles con el fin de evitar "lag" o "saturación" de los canales de datos P2P en el aula.
* Se recomienda utilizar navegadores modernos actualizados (Chrome, Safari, Firefox o Edge) para dar compatibilidad a _WebRTC_ de forma plena.
