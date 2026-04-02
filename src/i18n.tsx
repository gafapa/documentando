/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Locale = 'es' | 'gl' | 'en' | 'fr' | 'pt' | 'de' | 'ca' | 'eu';

interface Messages {
  appTagline: string;
  languageLabel: string;
  joinNameLabel: string;
  joinNamePlaceholder: string;
  joinRoomLabel: string;
  joinRoomPlaceholder: string;
  joinButton: string;
  joiningButton: string;
  onlineUsers: (count: number) => string;
  importDocx: string;
  exportWord: string;
  savePdf: string;
  leaveDocument: string;
  connectRoomError: string;
  importFileError: string;
  exportWordError: string;
  exportPdfError: string;
  editorPlaceholder: string;
  guestUser: string;
  imageTooLarge: string;
  imageInvalidType: string;
  imageReadFailed: string;
  imageConvertFailed: string;
  imagePasteFailed: string;
  imageInsertFailed: string;
  imageUrlPrompt: string;
  imageUrlDefault: string;
  imageDefaultAlt: string;
  linkPrompt: string;
  linkDefault: string;
  toolbarTextStyle: string;
  toolbarParagraph: string;
  toolbarHeading1: string;
  toolbarHeading2: string;
  toolbarHeading3: string;
  toolbarBold: string;
  toolbarItalic: string;
  toolbarUnderline: string;
  toolbarStrike: string;
  toolbarInlineCode: string;
  toolbarBulletList: string;
  toolbarOrderedList: string;
  toolbarTaskList: string;
  toolbarBlockquote: string;
  toolbarCodeBlock: string;
  toolbarHorizontalRule: string;
  toolbarAlignLeft: string;
  toolbarAlignCenter: string;
  toolbarAlignRight: string;
  toolbarJustify: string;
  toolbarSetLink: string;
  toolbarRemoveLink: string;
  toolbarUploadImage: string;
  toolbarInsertImageUrl: string;
  toolbarInsertTable: string;
  toolbarAddRow: string;
  toolbarAddColumn: string;
  toolbarDeleteTable: string;
  toolbarText: string;
  toolbarHighlight: string;
  toolbarClearTextColor: string;
  toolbarClearHighlight: string;
  toolbarClearFormatting: string;
  toolbarTextColorLabel: string;
  toolbarHighlightColorLabel: string;
}

interface LanguageOption {
  value: Locale;
  label: string;
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  languages: LanguageOption[];
  t: Messages;
}

const STORAGE_KEY = 'peerscribe-language';
const DEFAULT_LOCALE: Locale = 'es';

const languageOptions: LanguageOption[] = [
  { value: 'es', label: 'Español' },
  { value: 'gl', label: 'Galego' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'pt', label: 'Português' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ca', label: 'Català' },
  { value: 'eu', label: 'Euskara' },
];

const createOnlineUsersLabel = (singular: string, plural: string) =>
  (count: number) => `${count} ${count === 1 ? singular : plural}`;

const translations: Record<Locale, Messages> = {
  es: {
    appTagline: 'Editor colaborativo local-first',
    languageLabel: 'Idioma',
    joinNameLabel: 'Tu nombre',
    joinNamePlaceholder: 'Ej. Ana Garcia',
    joinRoomLabel: 'ID de la clase o sala',
    joinRoomPlaceholder: 'Ej. historia-aula2',
    joinButton: 'Unirse al pizarron',
    joiningButton: 'Conectando...',
    onlineUsers: createOnlineUsersLabel('estudiante en linea', 'estudiantes en linea'),
    importDocx: 'Importar DOCX',
    exportWord: 'Exportar Word',
    savePdf: 'Guardar PDF',
    leaveDocument: 'Salir del documento',
    connectRoomError: 'No se pudo conectar a PeerJS Cloud para abrir la sala.',
    importFileError: 'Error importando el archivo.',
    exportWordError: 'Error exportando el archivo Word.',
    exportPdfError: 'Error exportando el archivo PDF.',
    editorPlaceholder: 'Empieza a escribir tu documento colaborativo...',
    guestUser: 'Invitado',
    imageTooLarge: 'Las imagenes de mas de 500 KB se bloquean para mantener fluida la sesion P2P.',
    imageInvalidType: 'Solo se admiten archivos de imagen.',
    imageReadFailed: 'No se pudo leer el archivo de imagen.',
    imageConvertFailed: 'No se pudo convertir la imagen a un formato insertable.',
    imagePasteFailed: 'No se pudo pegar la imagen.',
    imageInsertFailed: 'No se pudo insertar la imagen.',
    imageUrlPrompt: 'Introduce la URL de una imagen',
    imageUrlDefault: 'https://',
    imageDefaultAlt: 'Imagen insertada',
    linkPrompt: 'Introduce una URL',
    linkDefault: 'https://',
    toolbarTextStyle: 'Estilo de texto',
    toolbarParagraph: 'Parrafo',
    toolbarHeading1: 'Titulo 1',
    toolbarHeading2: 'Titulo 2',
    toolbarHeading3: 'Titulo 3',
    toolbarBold: 'Negrita',
    toolbarItalic: 'Cursiva',
    toolbarUnderline: 'Subrayado',
    toolbarStrike: 'Tachado',
    toolbarInlineCode: 'Codigo en linea',
    toolbarBulletList: 'Lista con viñetas',
    toolbarOrderedList: 'Lista numerada',
    toolbarTaskList: 'Lista de tareas',
    toolbarBlockquote: 'Cita',
    toolbarCodeBlock: 'Bloque de codigo',
    toolbarHorizontalRule: 'Linea horizontal',
    toolbarAlignLeft: 'Alinear a la izquierda',
    toolbarAlignCenter: 'Centrar',
    toolbarAlignRight: 'Alinear a la derecha',
    toolbarJustify: 'Justificar',
    toolbarSetLink: 'Añadir enlace',
    toolbarRemoveLink: 'Quitar enlace',
    toolbarUploadImage: 'Subir imagen',
    toolbarInsertImageUrl: 'Insertar imagen por URL',
    toolbarInsertTable: 'Insertar tabla',
    toolbarAddRow: 'Añadir fila',
    toolbarAddColumn: 'Añadir columna',
    toolbarDeleteTable: 'Borrar tabla',
    toolbarText: 'Texto',
    toolbarHighlight: 'Resalte',
    toolbarClearTextColor: 'Quitar color de texto',
    toolbarClearHighlight: 'Quitar resalte',
    toolbarClearFormatting: 'Limpiar formato',
    toolbarTextColorLabel: 'Color de texto',
    toolbarHighlightColorLabel: 'Color de resalte',
  },
  gl: {
    appTagline: 'Editor colaborativo local-first',
    languageLabel: 'Idioma',
    joinNameLabel: 'O teu nome',
    joinNamePlaceholder: 'Ex. Ana Garcia',
    joinRoomLabel: 'ID da clase ou sala',
    joinRoomPlaceholder: 'Ex. historia-aula2',
    joinButton: 'Entrar no taboleiro',
    joiningButton: 'Conectando...',
    onlineUsers: createOnlineUsersLabel('estudante en liña', 'estudantes en liña'),
    importDocx: 'Importar DOCX',
    exportWord: 'Exportar Word',
    savePdf: 'Gardar PDF',
    leaveDocument: 'Saír do documento',
    connectRoomError: 'Non se puido conectar a PeerJS Cloud para abrir a sala.',
    importFileError: 'Erro ao importar o ficheiro.',
    exportWordError: 'Erro ao exportar o ficheiro Word.',
    exportPdfError: 'Erro ao exportar o ficheiro PDF.',
    editorPlaceholder: 'Empeza a escribir o teu documento colaborativo...',
    guestUser: 'Convidado',
    imageTooLarge: 'As imaxes de máis de 500 KB bloquéanse para manter a sesión P2P áxil.',
    imageInvalidType: 'Só se admiten ficheiros de imaxe.',
    imageReadFailed: 'Non se puido ler o ficheiro de imaxe.',
    imageConvertFailed: 'Non se puido converter a imaxe nun formato inserible.',
    imagePasteFailed: 'Non se puido pegar a imaxe.',
    imageInsertFailed: 'Non se puido inserir a imaxe.',
    imageUrlPrompt: 'Introduce o URL dunha imaxe',
    imageUrlDefault: 'https://',
    imageDefaultAlt: 'Imaxe inserida',
    linkPrompt: 'Introduce un URL',
    linkDefault: 'https://',
    toolbarTextStyle: 'Estilo de texto',
    toolbarParagraph: 'Parágrafo',
    toolbarHeading1: 'Título 1',
    toolbarHeading2: 'Título 2',
    toolbarHeading3: 'Título 3',
    toolbarBold: 'Negra',
    toolbarItalic: 'Cursiva',
    toolbarUnderline: 'Subliñado',
    toolbarStrike: 'Riscado',
    toolbarInlineCode: 'Código en liña',
    toolbarBulletList: 'Lista con viñetas',
    toolbarOrderedList: 'Lista numerada',
    toolbarTaskList: 'Lista de tarefas',
    toolbarBlockquote: 'Cita',
    toolbarCodeBlock: 'Bloque de código',
    toolbarHorizontalRule: 'Liña horizontal',
    toolbarAlignLeft: 'Aliñar á esquerda',
    toolbarAlignCenter: 'Centrar',
    toolbarAlignRight: 'Aliñar á dereita',
    toolbarJustify: 'Xustificar',
    toolbarSetLink: 'Engadir ligazón',
    toolbarRemoveLink: 'Quitar ligazón',
    toolbarUploadImage: 'Subir imaxe',
    toolbarInsertImageUrl: 'Inserir imaxe por URL',
    toolbarInsertTable: 'Inserir táboa',
    toolbarAddRow: 'Engadir fila',
    toolbarAddColumn: 'Engadir columna',
    toolbarDeleteTable: 'Borrar táboa',
    toolbarText: 'Texto',
    toolbarHighlight: 'Resalte',
    toolbarClearTextColor: 'Quitar cor do texto',
    toolbarClearHighlight: 'Quitar resalte',
    toolbarClearFormatting: 'Limpar formato',
    toolbarTextColorLabel: 'Cor do texto',
    toolbarHighlightColorLabel: 'Cor do resalte',
  },
  en: {
    appTagline: 'Local-first collaborative editor',
    languageLabel: 'Language',
    joinNameLabel: 'Your name',
    joinNamePlaceholder: 'E.g. Ana Garcia',
    joinRoomLabel: 'Class or room ID',
    joinRoomPlaceholder: 'E.g. history-room2',
    joinButton: 'Join whiteboard',
    joiningButton: 'Connecting...',
    onlineUsers: createOnlineUsersLabel('student online', 'students online'),
    importDocx: 'Import DOCX',
    exportWord: 'Export Word',
    savePdf: 'Save PDF',
    leaveDocument: 'Leave document',
    connectRoomError: 'Could not connect to PeerJS Cloud to open the room.',
    importFileError: 'Error importing the file.',
    exportWordError: 'Error exporting the Word file.',
    exportPdfError: 'Error exporting the PDF file.',
    editorPlaceholder: 'Start writing your collaborative document...',
    guestUser: 'Guest',
    imageTooLarge: 'Images above 500 KB are blocked to keep the P2P session responsive.',
    imageInvalidType: 'Only image files are supported.',
    imageReadFailed: 'Failed to read the image file.',
    imageConvertFailed: 'Failed to convert the image into an embeddable format.',
    imagePasteFailed: 'Failed to paste the image.',
    imageInsertFailed: 'Failed to insert the image.',
    imageUrlPrompt: 'Enter an image URL',
    imageUrlDefault: 'https://',
    imageDefaultAlt: 'Inserted image',
    linkPrompt: 'Enter a URL',
    linkDefault: 'https://',
    toolbarTextStyle: 'Text style',
    toolbarParagraph: 'Paragraph',
    toolbarHeading1: 'Heading 1',
    toolbarHeading2: 'Heading 2',
    toolbarHeading3: 'Heading 3',
    toolbarBold: 'Bold',
    toolbarItalic: 'Italic',
    toolbarUnderline: 'Underline',
    toolbarStrike: 'Strikethrough',
    toolbarInlineCode: 'Inline code',
    toolbarBulletList: 'Bullet list',
    toolbarOrderedList: 'Ordered list',
    toolbarTaskList: 'Task list',
    toolbarBlockquote: 'Blockquote',
    toolbarCodeBlock: 'Code block',
    toolbarHorizontalRule: 'Horizontal rule',
    toolbarAlignLeft: 'Align left',
    toolbarAlignCenter: 'Align center',
    toolbarAlignRight: 'Align right',
    toolbarJustify: 'Justify',
    toolbarSetLink: 'Set link',
    toolbarRemoveLink: 'Remove link',
    toolbarUploadImage: 'Upload image',
    toolbarInsertImageUrl: 'Insert image from URL',
    toolbarInsertTable: 'Insert table',
    toolbarAddRow: 'Add row',
    toolbarAddColumn: 'Add column',
    toolbarDeleteTable: 'Delete table',
    toolbarText: 'Text',
    toolbarHighlight: 'Highlight',
    toolbarClearTextColor: 'Clear text color',
    toolbarClearHighlight: 'Clear highlight',
    toolbarClearFormatting: 'Clear formatting',
    toolbarTextColorLabel: 'Text color',
    toolbarHighlightColorLabel: 'Highlight color',
  },
  fr: {
    appTagline: 'Editeur collaboratif local-first',
    languageLabel: 'Langue',
    joinNameLabel: 'Votre nom',
    joinNamePlaceholder: 'Ex. Ana Garcia',
    joinRoomLabel: 'ID de la classe ou de la salle',
    joinRoomPlaceholder: 'Ex. histoire-salle2',
    joinButton: 'Rejoindre le tableau',
    joiningButton: 'Connexion...',
    onlineUsers: createOnlineUsersLabel('étudiant en ligne', 'étudiants en ligne'),
    importDocx: 'Importer DOCX',
    exportWord: 'Exporter Word',
    savePdf: 'Enregistrer le PDF',
    leaveDocument: 'Quitter le document',
    connectRoomError: 'Impossible de se connecter à PeerJS Cloud pour ouvrir la salle.',
    importFileError: 'Erreur lors de l’importation du fichier.',
    exportWordError: 'Erreur lors de l’export du fichier Word.',
    exportPdfError: 'Erreur lors de l’export du fichier PDF.',
    editorPlaceholder: 'Commencez à écrire votre document collaboratif...',
    guestUser: 'Invité',
    imageTooLarge: 'Les images de plus de 500 Ko sont bloquées pour garder la session P2P fluide.',
    imageInvalidType: 'Seuls les fichiers image sont pris en charge.',
    imageReadFailed: 'Impossible de lire le fichier image.',
    imageConvertFailed: 'Impossible de convertir l’image dans un format insérable.',
    imagePasteFailed: 'Impossible de coller l’image.',
    imageInsertFailed: 'Impossible d’insérer l’image.',
    imageUrlPrompt: 'Entrez l’URL d’une image',
    imageUrlDefault: 'https://',
    imageDefaultAlt: 'Image insérée',
    linkPrompt: 'Entrez une URL',
    linkDefault: 'https://',
    toolbarTextStyle: 'Style de texte',
    toolbarParagraph: 'Paragraphe',
    toolbarHeading1: 'Titre 1',
    toolbarHeading2: 'Titre 2',
    toolbarHeading3: 'Titre 3',
    toolbarBold: 'Gras',
    toolbarItalic: 'Italique',
    toolbarUnderline: 'Souligné',
    toolbarStrike: 'Barré',
    toolbarInlineCode: 'Code en ligne',
    toolbarBulletList: 'Liste à puces',
    toolbarOrderedList: 'Liste numérotée',
    toolbarTaskList: 'Liste de tâches',
    toolbarBlockquote: 'Citation',
    toolbarCodeBlock: 'Bloc de code',
    toolbarHorizontalRule: 'Ligne horizontale',
    toolbarAlignLeft: 'Aligner à gauche',
    toolbarAlignCenter: 'Centrer',
    toolbarAlignRight: 'Aligner à droite',
    toolbarJustify: 'Justifier',
    toolbarSetLink: 'Ajouter un lien',
    toolbarRemoveLink: 'Retirer le lien',
    toolbarUploadImage: 'Téléverser une image',
    toolbarInsertImageUrl: 'Insérer une image par URL',
    toolbarInsertTable: 'Insérer un tableau',
    toolbarAddRow: 'Ajouter une ligne',
    toolbarAddColumn: 'Ajouter une colonne',
    toolbarDeleteTable: 'Supprimer le tableau',
    toolbarText: 'Texte',
    toolbarHighlight: 'Surlignage',
    toolbarClearTextColor: 'Retirer la couleur du texte',
    toolbarClearHighlight: 'Retirer le surlignage',
    toolbarClearFormatting: 'Effacer la mise en forme',
    toolbarTextColorLabel: 'Couleur du texte',
    toolbarHighlightColorLabel: 'Couleur du surlignage',
  },
  pt: {
    appTagline: 'Editor colaborativo local-first',
    languageLabel: 'Idioma',
    joinNameLabel: 'O teu nome',
    joinNamePlaceholder: 'Ex. Ana Garcia',
    joinRoomLabel: 'ID da turma ou sala',
    joinRoomPlaceholder: 'Ex. historia-sala2',
    joinButton: 'Entrar no quadro',
    joiningButton: 'A ligar...',
    onlineUsers: createOnlineUsersLabel('estudante online', 'estudantes online'),
    importDocx: 'Importar DOCX',
    exportWord: 'Exportar Word',
    savePdf: 'Guardar PDF',
    leaveDocument: 'Sair do documento',
    connectRoomError: 'Nao foi possivel ligar ao PeerJS Cloud para abrir a sala.',
    importFileError: 'Erro ao importar o ficheiro.',
    exportWordError: 'Erro ao exportar o ficheiro Word.',
    exportPdfError: 'Erro ao exportar o ficheiro PDF.',
    editorPlaceholder: 'Começa a escrever o teu documento colaborativo...',
    guestUser: 'Convidado',
    imageTooLarge: 'Imagens com mais de 500 KB sao bloqueadas para manter a sessao P2P fluida.',
    imageInvalidType: 'So sao suportados ficheiros de imagem.',
    imageReadFailed: 'Nao foi possivel ler o ficheiro de imagem.',
    imageConvertFailed: 'Nao foi possivel converter a imagem para um formato inserivel.',
    imagePasteFailed: 'Nao foi possivel colar a imagem.',
    imageInsertFailed: 'Nao foi possivel inserir a imagem.',
    imageUrlPrompt: 'Introduz o URL de uma imagem',
    imageUrlDefault: 'https://',
    imageDefaultAlt: 'Imagem inserida',
    linkPrompt: 'Introduz um URL',
    linkDefault: 'https://',
    toolbarTextStyle: 'Estilo de texto',
    toolbarParagraph: 'Paragrafo',
    toolbarHeading1: 'Titulo 1',
    toolbarHeading2: 'Titulo 2',
    toolbarHeading3: 'Titulo 3',
    toolbarBold: 'Negrito',
    toolbarItalic: 'Italico',
    toolbarUnderline: 'Sublinhado',
    toolbarStrike: 'Riscado',
    toolbarInlineCode: 'Codigo em linha',
    toolbarBulletList: 'Lista com marcadores',
    toolbarOrderedList: 'Lista numerada',
    toolbarTaskList: 'Lista de tarefas',
    toolbarBlockquote: 'Citacao',
    toolbarCodeBlock: 'Bloco de codigo',
    toolbarHorizontalRule: 'Linha horizontal',
    toolbarAlignLeft: 'Alinhar à esquerda',
    toolbarAlignCenter: 'Centrar',
    toolbarAlignRight: 'Alinhar à direita',
    toolbarJustify: 'Justificar',
    toolbarSetLink: 'Adicionar ligação',
    toolbarRemoveLink: 'Remover ligação',
    toolbarUploadImage: 'Carregar imagem',
    toolbarInsertImageUrl: 'Inserir imagem por URL',
    toolbarInsertTable: 'Inserir tabela',
    toolbarAddRow: 'Adicionar linha',
    toolbarAddColumn: 'Adicionar coluna',
    toolbarDeleteTable: 'Apagar tabela',
    toolbarText: 'Texto',
    toolbarHighlight: 'Realce',
    toolbarClearTextColor: 'Remover cor do texto',
    toolbarClearHighlight: 'Remover realce',
    toolbarClearFormatting: 'Limpar formatação',
    toolbarTextColorLabel: 'Cor do texto',
    toolbarHighlightColorLabel: 'Cor do realce',
  },
  de: {
    appTagline: 'Lokaler kollaborativer Editor',
    languageLabel: 'Sprache',
    joinNameLabel: 'Dein Name',
    joinNamePlaceholder: 'Z. B. Ana Garcia',
    joinRoomLabel: 'Klassen- oder Raum-ID',
    joinRoomPlaceholder: 'Z. B. geschichte-raum2',
    joinButton: 'Dem Dokument beitreten',
    joiningButton: 'Verbinden...',
    onlineUsers: createOnlineUsersLabel('Schüler online', 'Schüler online'),
    importDocx: 'DOCX importieren',
    exportWord: 'Word exportieren',
    savePdf: 'PDF speichern',
    leaveDocument: 'Dokument verlassen',
    connectRoomError: 'PeerJS Cloud konnte nicht erreicht werden, um den Raum zu öffnen.',
    importFileError: 'Fehler beim Importieren der Datei.',
    exportWordError: 'Fehler beim Exportieren der Word-Datei.',
    exportPdfError: 'Fehler beim Exportieren der PDF-Datei.',
    editorPlaceholder: 'Beginne mit dem Schreiben deines kollaborativen Dokuments...',
    guestUser: 'Gast',
    imageTooLarge: 'Bilder über 500 KB werden blockiert, damit die P2P-Sitzung flüssig bleibt.',
    imageInvalidType: 'Nur Bilddateien werden unterstützt.',
    imageReadFailed: 'Die Bilddatei konnte nicht gelesen werden.',
    imageConvertFailed: 'Das Bild konnte nicht in ein einbettbares Format umgewandelt werden.',
    imagePasteFailed: 'Das Bild konnte nicht eingefügt werden.',
    imageInsertFailed: 'Das Bild konnte nicht eingefügt werden.',
    imageUrlPrompt: 'Gib eine Bild-URL ein',
    imageUrlDefault: 'https://',
    imageDefaultAlt: 'Eingefügtes Bild',
    linkPrompt: 'Gib eine URL ein',
    linkDefault: 'https://',
    toolbarTextStyle: 'Textstil',
    toolbarParagraph: 'Absatz',
    toolbarHeading1: 'Überschrift 1',
    toolbarHeading2: 'Überschrift 2',
    toolbarHeading3: 'Überschrift 3',
    toolbarBold: 'Fett',
    toolbarItalic: 'Kursiv',
    toolbarUnderline: 'Unterstrichen',
    toolbarStrike: 'Durchgestrichen',
    toolbarInlineCode: 'Inline-Code',
    toolbarBulletList: 'Aufzählung',
    toolbarOrderedList: 'Nummerierte Liste',
    toolbarTaskList: 'Aufgabenliste',
    toolbarBlockquote: 'Zitat',
    toolbarCodeBlock: 'Codeblock',
    toolbarHorizontalRule: 'Horizontale Linie',
    toolbarAlignLeft: 'Linksbündig',
    toolbarAlignCenter: 'Zentrieren',
    toolbarAlignRight: 'Rechtsbündig',
    toolbarJustify: 'Blocksatz',
    toolbarSetLink: 'Link setzen',
    toolbarRemoveLink: 'Link entfernen',
    toolbarUploadImage: 'Bild hochladen',
    toolbarInsertImageUrl: 'Bild per URL einfügen',
    toolbarInsertTable: 'Tabelle einfügen',
    toolbarAddRow: 'Zeile hinzufügen',
    toolbarAddColumn: 'Spalte hinzufügen',
    toolbarDeleteTable: 'Tabelle löschen',
    toolbarText: 'Text',
    toolbarHighlight: 'Markierung',
    toolbarClearTextColor: 'Textfarbe entfernen',
    toolbarClearHighlight: 'Markierung entfernen',
    toolbarClearFormatting: 'Formatierung löschen',
    toolbarTextColorLabel: 'Textfarbe',
    toolbarHighlightColorLabel: 'Markierungsfarbe',
  },
  ca: {
    appTagline: 'Editor col·laboratiu local-first',
    languageLabel: 'Idioma',
    joinNameLabel: 'El teu nom',
    joinNamePlaceholder: 'Ex. Ana Garcia',
    joinRoomLabel: 'ID de la classe o sala',
    joinRoomPlaceholder: 'Ex. historia-aula2',
    joinButton: 'Entrar al document',
    joiningButton: 'Connectant...',
    onlineUsers: createOnlineUsersLabel('estudiant en línia', 'estudiants en línia'),
    importDocx: 'Importar DOCX',
    exportWord: 'Exportar Word',
    savePdf: 'Desar PDF',
    leaveDocument: 'Sortir del document',
    connectRoomError: 'No s’ha pogut connectar amb PeerJS Cloud per obrir la sala.',
    importFileError: 'Error en importar el fitxer.',
    exportWordError: 'Error en exportar el fitxer Word.',
    exportPdfError: 'Error en exportar el fitxer PDF.',
    editorPlaceholder: 'Comença a escriure el teu document col·laboratiu...',
    guestUser: 'Convidat',
    imageTooLarge: 'Les imatges de més de 500 KB es bloquegen per mantenir àgil la sessió P2P.',
    imageInvalidType: 'Només s’admeten fitxers d’imatge.',
    imageReadFailed: 'No s’ha pogut llegir el fitxer d’imatge.',
    imageConvertFailed: 'No s’ha pogut convertir la imatge en un format inserible.',
    imagePasteFailed: 'No s’ha pogut enganxar la imatge.',
    imageInsertFailed: 'No s’ha pogut inserir la imatge.',
    imageUrlPrompt: 'Introdueix l’URL d’una imatge',
    imageUrlDefault: 'https://',
    imageDefaultAlt: 'Imatge inserida',
    linkPrompt: 'Introdueix una URL',
    linkDefault: 'https://',
    toolbarTextStyle: 'Estil de text',
    toolbarParagraph: 'Paràgraf',
    toolbarHeading1: 'Títol 1',
    toolbarHeading2: 'Títol 2',
    toolbarHeading3: 'Títol 3',
    toolbarBold: 'Negreta',
    toolbarItalic: 'Cursiva',
    toolbarUnderline: 'Subratllat',
    toolbarStrike: 'Ratllat',
    toolbarInlineCode: 'Codi en línia',
    toolbarBulletList: 'Llista amb vinyetes',
    toolbarOrderedList: 'Llista numerada',
    toolbarTaskList: 'Llista de tasques',
    toolbarBlockquote: 'Citació',
    toolbarCodeBlock: 'Bloc de codi',
    toolbarHorizontalRule: 'Línia horitzontal',
    toolbarAlignLeft: 'Alinear a l’esquerra',
    toolbarAlignCenter: 'Centrar',
    toolbarAlignRight: 'Alinear a la dreta',
    toolbarJustify: 'Justificar',
    toolbarSetLink: 'Afegir enllaç',
    toolbarRemoveLink: 'Treure enllaç',
    toolbarUploadImage: 'Pujar imatge',
    toolbarInsertImageUrl: 'Inserir imatge per URL',
    toolbarInsertTable: 'Inserir taula',
    toolbarAddRow: 'Afegir fila',
    toolbarAddColumn: 'Afegir columna',
    toolbarDeleteTable: 'Esborrar taula',
    toolbarText: 'Text',
    toolbarHighlight: 'Ressaltat',
    toolbarClearTextColor: 'Treure color del text',
    toolbarClearHighlight: 'Treure ressaltat',
    toolbarClearFormatting: 'Netejar format',
    toolbarTextColorLabel: 'Color del text',
    toolbarHighlightColorLabel: 'Color del ressaltat',
  },
  eu: {
    appTagline: 'Local-first lankidetza editorea',
    languageLabel: 'Hizkuntza',
    joinNameLabel: 'Zure izena',
    joinNamePlaceholder: 'Adib. Ana Garcia',
    joinRoomLabel: 'Klase edo gelaren IDa',
    joinRoomPlaceholder: 'Adib. historia-gela2',
    joinButton: 'Dokumentura sartu',
    joiningButton: 'Konektatzen...',
    onlineUsers: createOnlineUsersLabel('ikasle linean', 'ikasle linean'),
    importDocx: 'DOCX inportatu',
    exportWord: 'Word esportatu',
    savePdf: 'PDF gorde',
    leaveDocument: 'Dokumentutik irten',
    connectRoomError: 'Ezin izan da PeerJS Cloudera konektatu gela irekitzeko.',
    importFileError: 'Errorea fitxategia inportatzean.',
    exportWordError: 'Errorea Word fitxategia esportatzean.',
    exportPdfError: 'Errorea PDF fitxategia esportatzean.',
    editorPlaceholder: 'Hasi zure lankidetza dokumentua idazten...',
    guestUser: 'Gonbidatua',
    imageTooLarge: '500 KB baino gehiagoko irudiak blokeatzen dira P2P saioa arin mantentzeko.',
    imageInvalidType: 'Irudi fitxategiak bakarrik onartzen dira.',
    imageReadFailed: 'Ezin izan da irudi fitxategia irakurri.',
    imageConvertFailed: 'Ezin izan da irudia txerta daitekeen formatura bihurtu.',
    imagePasteFailed: 'Ezin izan da irudia itsatsi.',
    imageInsertFailed: 'Ezin izan da irudia txertatu.',
    imageUrlPrompt: 'Sartu irudi baten URLa',
    imageUrlDefault: 'https://',
    imageDefaultAlt: 'Txertatutako irudia',
    linkPrompt: 'Sartu URL bat',
    linkDefault: 'https://',
    toolbarTextStyle: 'Testu estiloa',
    toolbarParagraph: 'Paragrafoa',
    toolbarHeading1: 'Izenburua 1',
    toolbarHeading2: 'Izenburua 2',
    toolbarHeading3: 'Izenburua 3',
    toolbarBold: 'Lodia',
    toolbarItalic: 'Etzana',
    toolbarUnderline: 'Azpimarratua',
    toolbarStrike: 'Marratua',
    toolbarInlineCode: 'Lerroko kodea',
    toolbarBulletList: 'Bulet zerrenda',
    toolbarOrderedList: 'Zenbakidun zerrenda',
    toolbarTaskList: 'Zereginen zerrenda',
    toolbarBlockquote: 'Aipua',
    toolbarCodeBlock: 'Kode blokea',
    toolbarHorizontalRule: 'Lerro horizontala',
    toolbarAlignLeft: 'Ezkerrean lerrokatu',
    toolbarAlignCenter: 'Erdiratu',
    toolbarAlignRight: 'Eskuinean lerrokatu',
    toolbarJustify: 'Justifikatu',
    toolbarSetLink: 'Esteka gehitu',
    toolbarRemoveLink: 'Esteka kendu',
    toolbarUploadImage: 'Irudia igo',
    toolbarInsertImageUrl: 'Txertatu irudia URL bidez',
    toolbarInsertTable: 'Taula txertatu',
    toolbarAddRow: 'Errenkada gehitu',
    toolbarAddColumn: 'Zutabea gehitu',
    toolbarDeleteTable: 'Taula ezabatu',
    toolbarText: 'Testua',
    toolbarHighlight: 'Nabarmendu',
    toolbarClearTextColor: 'Testuaren kolorea kendu',
    toolbarClearHighlight: 'Nabarmena kendu',
    toolbarClearFormatting: 'Formatua garbitu',
    toolbarTextColorLabel: 'Testu kolorea',
    toolbarHighlightColorLabel: 'Nabarmendze kolorea',
  },
};

const normalizeLocale = (value?: string | null): Locale | null => {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();
  const directMatch = languageOptions.find((option) => option.value === normalized);

  if (directMatch) {
    return directMatch.value;
  }

  const partialMatch = languageOptions.find((option) => normalized.startsWith(option.value));
  return partialMatch?.value ?? null;
};

const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const storedLocale = normalizeLocale(window.localStorage.getItem(STORAGE_KEY));
  if (storedLocale) {
    return storedLocale;
  }

  const browserLocales = window.navigator.languages.length > 0
    ? window.navigator.languages
    : [window.navigator.language];

  for (const browserLocale of browserLocales) {
    const matchedLocale = normalizeLocale(browserLocale);
    if (matchedLocale) {
      return matchedLocale;
    }
  }

  return DEFAULT_LOCALE;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    languages: languageOptions,
    t: translations[locale],
  }), [locale]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used inside an I18nProvider.');
  }

  return context;
};
