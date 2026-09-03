# Backblaze B2 Object Storage Setup & Migration Guide

This repository has been configured to move binary media file storage to **Backblaze B2 Object Storage** (accessed via its S3-compatible API) while using **Neon PostgreSQL** exclusively for metadata.

---

## 1. Backblaze B2 Bucket Setup

1. Log into your [Backblaze B2 Console](https://www.backblaze.com/b2/cloud-storage.html).
2. Create a new Bucket:
   - **Bucket Unique Name**: `portfolio-media` (or your preferred name)
   - **Files in Bucket**: `Private`
   - **Default Encryption**: Enabled (SSE-B2)
3. Navigate to **App Keys**:
   - Click **Add a New Application Key**.
   - **Name**: `portfolio-backend-key`
   - **Allow Access to Bucket(s)**: Select `portfolio-media` (Restrict key to this bucket only).
   - **Type of Access**: Read and Write (`readFiles`, `writeFiles`, `deleteFiles`).
   - Copy the generated `keyID` and `applicationKey` immediately (the application key will only be shown once).

---

## 2. Environment Configuration

Add the B2 credentials to your `backend/.env` file:

```env
# Backblaze B2 Storage Configuration (S3-Compatible API)
B2_ENDPOINT=https://s3.us-west-004.backblazeb2.com
B2_REGION=us-west-004
B2_BUCKET_NAME=portfolio-media
B2_KEY_ID=your_key_id_here
B2_APPLICATION_KEY=your_application_key_here
```

> ⚠️ **Security Warning**:
> Never expose `B2_APPLICATION_KEY` or `B2_KEY_ID` to the frontend or commit `.env` to Git. The backend handles all B2 operations and generates short-lived presigned URLs for client requests.

---

## 3. Database Migration

Run the database schema migration to ensure `storage_key` and `thumbnail_key` columns are present in Neon PostgreSQL:

```bash
cd backend
node -e "import('./db/migrate.js').then(m => m.runMigrations())"
```

---

## 4. Migrating Existing Local Media Files to B2

If you have existing uploaded media files located in `backend/uploads/`:

```bash
cd backend
node scripts/migrateMediaToB2.js
```

The script will:

- Scan `media_assets` in Neon PostgreSQL for assets without a `storage_key`.
- Read local files from `uploads/` and stream them to the Backblaze B2 bucket under structured object keys (`media/images/YYYY/MM/...`, `media/videos/YYYY/MM/...`, `media/thumbnails/YYYY/MM/...`, etc.).
- Update Neon PostgreSQL metadata with the B2 `storage_key` and `thumbnail_key`.
- Report migration progress and leave original files safe.

---

## 5. B2 Bucket Structure Overview

All media files are stored using structured, sanitized object keys:

```
portfolio-media/
└── media/
    ├── images/YYYY/MM/filename-timestamp.webp
    ├── videos/YYYY/MM/filename-timestamp.mp4
    ├── reels/YYYY/MM/filename-timestamp.mp4
    ├── thumbnails/YYYY/MM/filename-timestamp.webp
    ├── documents/YYYY/MM/filename-timestamp.pdf
    └── cv/YYYY/MM/filename-timestamp.pdf
```
