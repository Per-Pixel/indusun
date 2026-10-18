// Image upload endpoint.
// Writes files into the *main* app's public/uploads/ folder so they are served
// by the public site at /uploads/<filename>.
//
// Assumes a monorepo layout where `admin/` and `main/` are siblings on disk.
// In a split deployment this would need to be replaced with object storage.

import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
]);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function extFromMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg': return '.jpg';
    case 'image/png': return '.png';
    case 'image/webp': return '.webp';
    case 'image/gif': return '.gif';
    case 'image/svg+xml': return '.svg';
    case 'application/pdf': return '.pdf';
    default: return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json({ error: `Unsupported type: ${file.type}` }, { status: 415 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 413 });
    }

    const ext = extFromMime(file.type) || path.extname(file.name) || '';
    const filename = `${randomUUID()}${ext}`;

    // Save to both admin/public/uploads (so admin can view it directly on :3001)
    // and ../main/public/uploads (so public site can also serve it)
    const adminUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const mainUploadsDir = path.join(process.cwd(), '..', 'main', 'public', 'uploads');
    await mkdir(adminUploadsDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(adminUploadsDir, filename), buffer);
    try {
      await mkdir(mainUploadsDir, { recursive: true });
      await writeFile(path.join(mainUploadsDir, filename), buffer);
    } catch {
      // Ignore if sibling main dir is not writable in standalone deploy
    }

    return NextResponse.json({ url: `/uploads/${filename}`, name: file.name, type: file.type });
  } catch (err) {
    console.error('Upload failed:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
