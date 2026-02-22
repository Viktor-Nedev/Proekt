## CreaoFileUpload

The CREAO Official File Upload API enables secure transmission and storage of diverse file types, laying a robust foundation for building multi-modal applications. All uploaded files—whether images, audio, video, documents, or other media formats—are encrypted and persistently stored in CREAO's dedicated cloud storage bucket, adhering to industry-standard security protocols. This seamless support for varied data modalities empowers developers to effortlessly integrate rich, multi-format content into applications, unlocking possibilities for creating dynamic multi-modal experiences.

```typescript
// CreaoFileUpload - id: 68b68b97ac476c8df7efbeaf

// please read type definitions: src/sdk/api-clients/68b68b97ac476c8df7efbeaf/_impl/types.gen.ts
// to learn about type and default values
import type { PostOfficialApiPresignS3UploadData, PostOfficialApiPresignS3UploadErrors, PostOfficialApiPresignS3UploadResponses } from '@/sdk/api-clients/68b68b97ac476c8df7efbeaf/requestCreaoFileUpload';

// Type definition of request function:
// async function requestCreaoFileUpload(opts: PostOfficialApiPresignS3UploadData): Promise<{
//     error?: PostOfficialApiPresignS3UploadErrors[keyof PostOfficialApiPresignS3UploadErrors],
//     data?: PostOfficialApiPresignS3UploadResponses[keyof PostOfficialApiPresignS3UploadResponses],
//     request: Request,
//     response: Response
// }>
import { requestCreaoFileUpload } from '@/sdk/api-clients/68b68b97ac476c8df7efbeaf/requestCreaoFileUpload';
```