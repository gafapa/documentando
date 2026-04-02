import type { Editor } from '@tiptap/react';

export const MAX_EMBEDDED_IMAGE_SIZE_BYTES = 500 * 1024;

interface ImageUploadMessages {
  invalidType: string;
  tooLarge: string;
  readFailed: string;
  convertFailed: string;
}

export const isAcceptedImageFile = (file: File) => file.type.startsWith('image/');

export const canEmbedImageFile = (file: File) =>
  isAcceptedImageFile(file) && file.size <= MAX_EMBEDDED_IMAGE_SIZE_BYTES;

const readFileAsDataUrl = (file: File, messages: ImageUploadMessages) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error(messages.convertFailed));
    };

    reader.onerror = () => {
      reject(new Error(messages.readFailed));
    };

    reader.readAsDataURL(file);
  });

export const insertImageFromFile = async (
  editor: Editor,
  file: File,
  messages: ImageUploadMessages,
  altText?: string
) => {
  if (!isAcceptedImageFile(file)) {
    throw new Error(messages.invalidType);
  }

  if (!canEmbedImageFile(file)) {
    throw new Error(messages.tooLarge);
  }

  const imageSource = await readFileAsDataUrl(file, messages);
  editor.chain().focus().setImage({
    src: imageSource,
    alt: altText ?? file.name,
    title: file.name,
  }).run();
};
