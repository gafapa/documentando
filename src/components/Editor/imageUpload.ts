import type { Editor } from '@tiptap/react';

export const MAX_EMBEDDED_IMAGE_SIZE_BYTES = 500 * 1024;

export const getImageSizeErrorMessage = () =>
  'Images above 500KB are blocked to keep the P2P session responsive.';

export const isAcceptedImageFile = (file: File) => file.type.startsWith('image/');

export const canEmbedImageFile = (file: File) =>
  isAcceptedImageFile(file) && file.size <= MAX_EMBEDDED_IMAGE_SIZE_BYTES;

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Failed to convert the image to a data URL.'));
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the image file.'));
    };

    reader.readAsDataURL(file);
  });

export const insertImageFromFile = async (editor: Editor, file: File) => {
  if (!isAcceptedImageFile(file)) {
    throw new Error('Only image files are supported.');
  }

  if (!canEmbedImageFile(file)) {
    throw new Error(getImageSizeErrorMessage());
  }

  const imageSource = await readFileAsDataUrl(file);
  editor.chain().focus().setImage({
    src: imageSource,
    alt: file.name,
    title: file.name,
  }).run();
};
