import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const LOGO_PATH = join(process.cwd(), 'public/brand/taxchecker-logo.png');

let cachedLogoDataUri: string | null = null;

/** Load TaxChecker logo as a data URI for Satori / ImageResponse. */
export async function getLogoDataUri(): Promise<string> {
  if (cachedLogoDataUri) {
    return cachedLogoDataUri;
  }

  const buffer = await readFile(LOGO_PATH);
  cachedLogoDataUri = `data:image/png;base64,${buffer.toString('base64')}`;
  return cachedLogoDataUri;
}
