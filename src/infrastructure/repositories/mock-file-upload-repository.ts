import type { FileUploadRepository } from '@/application/ports';

/**
 * Mock upload adapter (NW-246).
 *
 * The registration-fields JSON marks both image-upload fields with
 * `saveBehavior: "local preview only until upload endpoint exists"`, so the file is read
 * into a `data:` URL and stored as the image reference. Nothing is sent anywhere and the
 * value stays inside the in-memory mock.
 */
export class MockFileUploadRepository implements FileUploadRepository {
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
