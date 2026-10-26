import type { FileUploadRepository } from '@/application/ports';

/** Local preview upload adapter. The chosen file becomes a data URL held in memory. */
export class StaticFileUploadRepository implements FileUploadRepository {
  async uploadImage(file: File): Promise<string> {
    return readAsDataUrl(file);
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
        return;
      }
      reject(new Error('Could not read the selected file'));
    };
    reader.onerror = () => reject(new Error('Could not read the selected file'));
    reader.readAsDataURL(file);
  });
}
