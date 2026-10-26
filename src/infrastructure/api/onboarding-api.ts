import type {
  MenuExtractionResponse,
  OnboardingAssetType,
  OnboardingRequestPage,
  OnboardingUploadFile,
  OnboardingUploadUrlsResponse,
  SubmitOnboardingRequest,
  SubmitOnboardingResponse,
  SubscriptionOffer,
} from '@/domain/entities';
import type { HttpClient } from './http-client';
import {
  menuExtractionResponseSchema,
  offersResponseSchema,
  onboardingRequestPageSchema,
  onboardingUploadUrlsResponseSchema,
  paymentResponseSchema,
  submitOnboardingResponseSchema,
} from './onboarding-schemas';

const REQUESTS_PATH = 'api/v1/onboarding-requests';

function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

export interface OnboardingApi {
  listRequests(params: { page: number; pageSize: number }): Promise<OnboardingRequestPage>;
  listOffers(): Promise<SubscriptionOffer[]>;
  /** OPEN: backend submit not finished. Do not call this from the UI yet. */
  submitRequest(body: SubmitOnboardingRequest): Promise<SubmitOnboardingResponse>;
  setPayment(requestId: string, paid: boolean): Promise<void>;
  createUploadUrls(files: OnboardingUploadFile[]): Promise<OnboardingUploadUrlsResponse>;
  confirmAsset(assetId: string, uploadToken: string | null): Promise<void>;
  deleteAsset(assetId: string, uploadToken: string | null): Promise<void>;
  /** Uploads one onboarding file and returns the asset reference for the submit body. */
  uploadAsset(
    file: File,
    type: OnboardingAssetType,
  ): Promise<{ assetId: string; uploadToken: string | null }>;
  /** The only OCR endpoint used by the dashboard (agent.md section 21). */
  extractMenu(file: File): Promise<MenuExtractionResponse>;
}

export function createOnboardingApi(client: HttpClient): OnboardingApi {
  async function confirmAsset(assetId: string, uploadToken: string | null): Promise<void> {
    await client.request({
      path: `${REQUESTS_PATH}/assets/${assetId}/confirm`,
      method: 'POST',
      headers: uploadToken ? { 'X-Onboarding-Upload-Token': uploadToken } : undefined,
      schema: paymentResponseSchema,
    });
  }

  async function deleteAsset(assetId: string, uploadToken: string | null): Promise<void> {
    await client.request({
      path: `${REQUESTS_PATH}/assets/${assetId}`,
      method: 'DELETE',
      headers: uploadToken ? { 'X-Onboarding-Upload-Token': uploadToken } : undefined,
      schema: paymentResponseSchema,
    });
  }

  return {
    listRequests({ page, pageSize }) {
      return client.request({
        path: REQUESTS_PATH,
        query: { page, pageSize },
        schema: onboardingRequestPageSchema,
      });
    },

    listOffers() {
      return client.request({
        path: `${REQUESTS_PATH}/offers`,
        schema: offersResponseSchema,
      });
    },

    submitRequest(body) {
      // OPEN: backend submit not finished. The Idempotency-Key is a new UUID per submit.
      return client.request({
        path: REQUESTS_PATH,
        method: 'POST',
        headers: { 'Idempotency-Key': newIdempotencyKey() },
        body,
        schema: submitOnboardingResponseSchema,
      });
    },

    async setPayment(requestId, paid) {
      await client.request({
        path: `${REQUESTS_PATH}/${requestId}/payment`,
        method: 'PATCH',
        body: { paid },
        schema: paymentResponseSchema,
      });
    },

    createUploadUrls(files) {
      return client.request({
        path: `${REQUESTS_PATH}/upload-urls`,
        method: 'POST',
        body: { files },
        schema: onboardingUploadUrlsResponseSchema,
      });
    },

    confirmAsset,
    deleteAsset,

    async uploadAsset(file, type) {
      const { uploads } = await client.request({
        path: `${REQUESTS_PATH}/upload-urls`,
        method: 'POST',
        body: {
          files: [
            {
              type,
              fileName: file.name,
              contentType: file.type || null,
              sizeBytes: file.size,
            },
          ],
        },
        schema: onboardingUploadUrlsResponseSchema,
      });

      const upload = uploads[0];
      if (!upload || !upload.uploadUrl) {
        throw new Error('The server did not return an upload URL.');
      }

      const response = await fetch(upload.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: upload.contentType ? { 'Content-Type': upload.contentType } : undefined,
      });
      if (!response.ok) {
        throw new Error(`The file upload failed with HTTP ${response.status}.`);
      }

      await confirmAsset(upload.assetId, upload.uploadToken);
      return { assetId: upload.assetId, uploadToken: upload.uploadToken };
    },

    extractMenu(file) {
      const form = new FormData();
      form.append('image', file);
      return client.request({
        path: 'api/v1/onboarding/menu-ocr',
        method: 'POST',
        body: form,
        schema: menuExtractionResponseSchema,
      });
    },
  };
}
