import { ImageResponse } from 'next/og';

import {
  OG_HEIGHT,
  OG_NAVY,
  OG_SLATE,
  OG_TAGLINE,
  OG_WHITE,
  OG_WIDTH,
} from '@/lib/og/constants';
import { loadOgFonts } from '@/lib/og/fonts';
import { getLogoDataUri } from '@/lib/og/load-logo';

export interface OgImageOptions {
  title: string;
  badge?: string;
  subtitle?: string;
}

function titleFontSize(title: string): number {
  if (title.length > 90) return 36;
  if (title.length > 60) return 44;
  if (title.length > 40) return 50;
  return 56;
}

export async function generateOgImage(
  options: OgImageOptions,
): Promise<ImageResponse> {
  const [fonts, logoSrc] = await Promise.all([loadOgFonts(), getLogoDataUri()]);
  const titleSize = titleFontSize(options.title);
  const subtitle = options.subtitle ?? OG_TAGLINE;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: OG_WHITE,
          fontFamily: 'Inter',
        }}
      >
        <div style={{ height: 8, width: '100%', background: OG_NAVY }} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            padding: '52px 64px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 40,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={52} height={52} alt="" />
            <span
              style={{
                fontSize: 30,
                fontWeight: 600,
                color: OG_NAVY,
                letterSpacing: '-0.02em',
              }}
            >
              TaxChecker
            </span>
          </div>

          {options.badge ? (
            <div
              style={{
                display: 'flex',
                alignSelf: 'flex-start',
                marginBottom: 20,
                padding: '8px 16px',
                borderRadius: 999,
                background: 'rgba(15, 45, 92, 0.08)',
                border: '1px solid rgba(15, 45, 92, 0.15)',
                fontSize: 18,
                fontWeight: 600,
                color: OG_NAVY,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {options.badge}
            </div>
          ) : null}

          <div
            style={{
              display: 'flex',
              flex: 1,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: titleSize,
                fontWeight: 600,
                color: OG_NAVY,
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
              }}
            >
              {options.title}
            </div>
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 400,
              color: OG_SLATE,
              lineHeight: 1.4,
              marginTop: 24,
            }}
          >
            {subtitle}
          </div>
        </div>

        <div style={{ height: 6, width: '100%', background: OG_NAVY }} />
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts,
    },
  );
}
