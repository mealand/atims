# Supabase Storage Setup

Run these steps in the Supabase Dashboard → Storage after running migrations.

## 1. Create the documents bucket

```
Bucket name:  atims-documents
Public:       NO (private — files served via signed URLs)
```

## 2. Storage RLS policies

In SQL Editor, run:

```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "entity_upload_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'atims-documents'
  AND (storage.foldername(name))[1] IN ('entities', 'batches')
);

-- Allow authenticated users to read files they have access to
CREATE POLICY "entity_read_own"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'atims-documents'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Service role has full access (API handles all file ops)
CREATE POLICY "service_full_access"
ON storage.objects
TO service_role
USING (bucket_id = 'atims-documents');
```

## 3. File path conventions

| Content | Path pattern |
|---|---|
| Entity documents | `entities/{entity_id}/{doc_type}_{filename}` |
| Batch documents | `batches/{batch_id}/{doc_type}_{filename}` |
| Lab reports | `batches/{batch_id}/lab_{filename}` |
