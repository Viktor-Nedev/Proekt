// SDK exports these request functions:
//
//   /**
//    * Generate presigned URL for S3 upload
//    *
//    * Creates a presigned URL that allows direct upload to S3 bucket.
//    * After getting the presigned URL, you must make a separate PUT request to that URL with the file content to complete the upload.
//    */
//
//   export function postOfficialApiPresignS3Upload(opts: PostOfficialApiPresignS3UploadData): Promise<{
//     error?: PostOfficialApiPresignS3UploadErrors[keyof PostOfficialApiPresignS3UploadErrors],
//     data?: PostOfficialApiPresignS3UploadResponses[keyof PostOfficialApiPresignS3UploadResponses],
//     request: Request,
//     response: Response }>;
//
//   ALIAS: postOfficialApiPresignS3Upload is equivalent to: import { requestCreaoFileUpload } from '@/sdk/api-clients/68b68b97ac476c8df7efbeaf/requestCreaoFileUpload'
//
// 

export type ClientOptions = {
    baseUrl: 'https://agw-rest-production.creao.ai' | (string & {});
};

/**
 * After receiving the presigned URL, you need to make a PUT request to that URL with the file content.
 * Example using fetch:
 * ```javascript
 * const response = await fetch(presignedUrl, {
 * method: 'PUT',
 * headers: {
 * 'Content-Type': contentType
 * },
 * body: fileData // The actual file content
 * });
 *
 * if (response.ok) {
 * // File uploaded successfully
 * // You can now access the file at realFileUrl
 * }
 * ```
 */
export type PresignedUrlUsage = {
    [key: string]: unknown;
};

export type PostOfficialApiPresignS3UploadData = {
    body: {
        /**
         * Name of the file to be uploaded
         */
        fileName: string;
        /**
         * MIME type of the file
         */
        contentType: string;
    };
    path?: never;
    query?: never;
    url: '/official-api/presign-s3-upload';
};

export type PostOfficialApiPresignS3UploadErrors = {
    /**
     * Bad request
     */
    400: {
        message?: string;
    };
    /**
     * Unauthorized
     */
    401: {
        message?: string;
    };
    /**
     * Server error
     */
    500: {
        message?: string;
    };
};

export type PostOfficialApiPresignS3UploadError = PostOfficialApiPresignS3UploadErrors[keyof PostOfficialApiPresignS3UploadErrors];

export type PostOfficialApiPresignS3UploadResponses = {
    /**
     * Presigned URL generated successfully
     */
    200: {
        success?: boolean;
        /**
         * URL to upload the file to using a PUT request
         */
        presignedUrl?: string;
        /**
         * The permanent URL where the file will be accessible after upload
         */
        realFileUrl?: string;
        /**
         * The key (path) of the file in S3
         */
        fileKey?: string;
        /**
         * Expiration time of the presigned URL in seconds
         */
        expiresIn?: number;
    };
};

export type PostOfficialApiPresignS3UploadResponse = PostOfficialApiPresignS3UploadResponses[keyof PostOfficialApiPresignS3UploadResponses];
