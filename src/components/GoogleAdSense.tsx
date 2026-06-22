import Script from 'next/script';

const ADSENSE_CLIENT = 'ca-pub-4750251278461517';
const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

export function GoogleAdSense() {
  return (
    <>
      <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
      <Script
        async
        src={ADSENSE_SCRIPT_SRC}
        crossOrigin="anonymous"
        strategy="beforeInteractive"
      />
    </>
  );
}
