import * as fs from 'fs';
import * as path from 'path';

export function ensureUploadsDirectory() {
  const uploadsDir = path.join(process.cwd(), 'uploads', 'screenshots');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

