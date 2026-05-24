import * as functions from 'firebase-functions';
import { storage } from '../utils/firebase';
import type { ObjectMetadata } from 'firebase-functions/v1/storage';

type StorageObject = ObjectMetadata;

export default async function handleFileUpload(object: StorageObject): Promise<void> {
  if (!object.name) return;

  functions.logger.info(`File uploaded: ${object.name} (${object.contentType}, ${object.size} bytes)`);

  if (object.contentType?.startsWith('image/') || object.contentType === 'application/pdf') {
    const bucket = storage.bucket(object.bucket);
    const file = bucket.file(object.name);
    const [exists] = await file.exists();
    if (!exists) return;
  }
}
