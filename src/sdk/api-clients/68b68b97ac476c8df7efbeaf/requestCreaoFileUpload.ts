import { postOfficialApiPresignS3Upload as requestCreaoFileUpload } from './_impl/sdk.gen';

// please read type definitions: src/sdk/api-clients/68b68b97ac476c8df7efbeaf/_impl/types.gen.ts
// to learn about type and default values
export type { PostOfficialApiPresignS3UploadData, PostOfficialApiPresignS3UploadErrors, PostOfficialApiPresignS3UploadResponses } from './_impl/types.gen';

// Type definition of request function:
// async function requestCreaoFileUpload(opts: PostOfficialApiPresignS3UploadData): Promise<{
//     error?: PostOfficialApiPresignS3UploadErrors[keyof PostOfficialApiPresignS3UploadErrors],
//     data?: PostOfficialApiPresignS3UploadResponses[keyof PostOfficialApiPresignS3UploadResponses],
//     request: Request,
//     response: Response
// }>
export { requestCreaoFileUpload };