/**
 * Menu image rules. Only a JPEG, PNG or WEBP photo is accepted, up to 15 MB; a PDF is
 * rejected with the "not an image" message. Pure checks, no I/O.
 */

export const MENU_MAX_FILE_BYTES = 15 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSION = /\.(jpe?g|png|webp)$/i;

export type MenuFileProblem = 'required' | 'type' | 'size';

export interface MenuFileInfo {
  name: string;
  type: string;
  size: number;
}

/**
 * Returns the first problem of the selected file, or `null` when it can be submitted.
 * An empty MIME type (some OS file pickers) falls back to the file extension.
 */
export function checkMenuFile(file: MenuFileInfo | null | undefined): MenuFileProblem | null {
  if (!file) return 'required';
  const mime = file.type.trim().toLowerCase();
  const allowed = mime === '' ? ALLOWED_EXTENSION.test(file.name) : ALLOWED_MIME_TYPES.has(mime);
  if (!allowed) return 'type';
  if (file.size > MENU_MAX_FILE_BYTES) return 'size';
  return null;
}
