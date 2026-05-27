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

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function extFromMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg': return '.jpg';
    case 'image/png': return '.png';
    case 'image/webp': return '.webp';
    case 'image/gif': return '.gif';
    case 'image/svg+xml': return '.svg';
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

    // Sibling path: admin/ -> ../main/public/uploads
    const uploadsDir = path.join(process.cwd(), '..', 'main', 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error('Upload failed:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
