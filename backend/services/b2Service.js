import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// ── B2 Config Getters ─────────────────────────────────────────────
function getB2Config() {
  return {
    endpoint:
      process.env.B2_ENDPOINT || "https://s3.us-west-004.backblazeb2.com",
    region: process.env.B2_REGION || "us-west-004",
    bucketName: process.env.B2_BUCKET_NAME || "",
    keyId: process.env.B2_KEY_ID || "",
    applicationKey: process.env.B2_APPLICATION_KEY || "",
  };
}

export function isB2Configured() {
  const { keyId, applicationKey, bucketName } = getB2Config();
  return Boolean(keyId && applicationKey && bucketName);
}

let s3Client = null;

function getS3Client() {
  if (!isB2Configured()) return null;

  const { endpoint, region, keyId, applicationKey } = getB2Config();
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: endpoint.startsWith("http") ? endpoint : `https://${endpoint}`,
      region,
      credentials: {
        accessKeyId: keyId,
        secretAccessKey: applicationKey,
      },
      forcePathStyle: true,
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return s3Client;
}

// ── Key Generator ──────────────────────────────────────────────────
function slugifyFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateObjectKey(
  mediaType = "image",
  originalFilename = "file",
  isThumbnail = false,
) {
  let prefix = "media/misc/";

  if (isThumbnail) {
    prefix = "media/thumbnails/";
  } else {
    switch (mediaType) {
      case "image":
        prefix = "media/images/";
        break;
      case "video":
      case "presentation_video":
        prefix = "media/videos/";
        break;
      case "short_video":
        prefix = "media/reels/";
        break;
      case "document":
      case "pdf":
        prefix = "media/documents/";
        break;
      case "cv":
        prefix = "media/cv/";
        break;
      default:
        prefix = "media/misc/";
    }
  }

  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  const ext = path.extname(originalFilename) || (isThumbnail ? ".jpg" : "");
  const base = slugifyFilename(path.basename(originalFilename, ext)) || "asset";
  const uniqueName = `${base}-${Date.now()}${ext}`;

  return `${prefix}${year}/${month}/${uniqueName}`;
}

// ── Stream / Multipart Upload to B2 ───────────────────────────────
export async function uploadToB2({ filePath, buffer, key, mimeType }) {
  if (!isB2Configured()) {
    throw new Error(
      "Backblaze B2 is not configured. Please set B2_KEY_ID and B2_APPLICATION_KEY.",
    );
  }

  const client = getS3Client();
  const { bucketName } = getB2Config();

  let fileSize = 0;
  if (filePath && fs.existsSync(filePath)) {
    fileSize = fs.statSync(filePath).size;
  } else if (buffer) {
    fileSize = buffer.length;
  }

  const SINGLE_PART_THRESHOLD = 10 * 1024 * 1024; // 10 MB

  // For smaller files (<= 10MB), use single-part PutObject to avoid B2 5MB minimum part size error
  if (fileSize > 0 && fileSize <= SINGLE_PART_THRESHOLD) {
    const body = filePath ? fs.createReadStream(filePath) : buffer;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: mimeType || "application/octet-stream",
      ContentLength: fileSize,
    });
    await client.send(command);
  } else {
    // For large files (> 10MB), use multipart Upload stream with 10MB part chunks
    let bodyStream;
    if (filePath) {
      bodyStream = fs.createReadStream(filePath);
    } else if (buffer) {
      bodyStream = buffer;
    } else {
      throw new Error("No file content provided for B2 upload.");
    }

    const uploadTask = new Upload({
      client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: bodyStream,
        ContentType: mimeType || "application/octet-stream",
      },
      queueSize: 1, // sequential part upload for network stability
      partSize: 10 * 1024 * 1024, // 10 MB per part (exceeds B2 5MB minimum requirement)
      leavePartsOnError: false,
    });

    await uploadTask.done();
  }

  return {
    key,
    bucket: bucketName,
  };
}

// ── Generate Presigned GET URL ────────────────────────────────────
export async function getSignedMediaUrl(key, expiresInSeconds = 3600) {
  if (!key || !isB2Configured()) return null;

  try {
    const client = getS3Client();
    const { bucketName } = getB2Config();
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  } catch (err) {
    console.error(`Failed to generate presigned URL for key [${key}]:`, err);
    return null;
  }
}

// ── Delete Object from B2 ─────────────────────────────────────────
export async function deleteFromB2(key) {
  if (!key || !isB2Configured()) return;

  try {
    const client = getS3Client();
    const { bucketName } = getB2Config();
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await client.send(command);
    console.log(`✅ Object deleted from B2: ${key}`);
  } catch (err) {
    console.error(`❌ Failed to delete object from B2 [${key}]:`, err);
    throw err;
  }
}

// ── Resolve Media Record URLs ─────────────────────────────────────
export async function resolveMediaRecord(record) {
  if (!record) return record;

  const item = { ...record };

  if (item.storage_key && isB2Configured()) {
    const signedFileUrl = await getSignedMediaUrl(item.storage_key, 3600);
    if (signedFileUrl) {
      item.file_url = signedFileUrl;
    }
  }

  if (item.thumbnail_key && isB2Configured()) {
    const signedThumbUrl = await getSignedMediaUrl(item.thumbnail_key, 3600);
    if (signedThumbUrl) {
      item.thumbnail_url = signedThumbUrl;
    }
  }

  return item;
}

export async function resolveMediaList(records = []) {
  if (!Array.isArray(records) || records.length === 0) return records;
  return Promise.all(records.map((record) => resolveMediaRecord(record)));
}
