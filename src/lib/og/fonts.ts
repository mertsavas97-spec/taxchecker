type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 600;
  style: 'normal';
};

let fontCache: OgFont[] | null = null;

async function loadGoogleFont(
  family: string,
  weight: 400 | 600,
): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap`;
  const css = await fetch(cssUrl, {
    headers: {
      // Legacy user agent requests TTF/WOFF formats compatible with Satori.
      'User-Agent':
        'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load font CSS (${weight}): ${response.status}`);
    }
    return response.text();
  });

  const sources = [...css.matchAll(/src:\s*url\(([^)]+)\)\s*format\(['"]([^'"]+)['"]\)/g)];

  const preferred = sources.find(([, , format]) =>
    ['truetype', 'opentype', 'woff'].includes(format),
  );
  const fallback = sources[0];
  const match = preferred ?? fallback;

  if (!match?.[1]) {
    throw new Error(`Failed to parse font CSS for ${family} ${weight}`);
  }

  const fontUrl = match[1].replace(/['"]/g, '');
  const response = await fetch(fontUrl);
  if (!response.ok) {
    throw new Error(`Failed to load OG font (${weight}): ${response.status}`);
  }

  return response.arrayBuffer();
}

export async function loadOgFonts(): Promise<OgFont[]> {
  if (fontCache) {
    return fontCache;
  }

  const [regular, semibold] = await Promise.all([
    loadGoogleFont('Inter', 400),
    loadGoogleFont('Inter', 600),
  ]);

  fontCache = [
    { name: 'Inter', data: regular, weight: 400, style: 'normal' },
    { name: 'Inter', data: semibold, weight: 600, style: 'normal' },
  ];

  return fontCache;
}
