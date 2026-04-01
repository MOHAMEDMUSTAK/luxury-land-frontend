import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.landmarket.app',
  appName: 'LandMarket',
  webDir: 'out',
  server: {
    // This points to your live Next.js development server running on your PC
    // For Production: replace this with your actual website URL (e.g. 'https://my-land-market.com')
    // Or set it to use the "webDir" for static exports if you completely decouple SSR.
    url: 'http://10.27.245.75:3000',
    cleartext: true, // Required for http:// addresses
  },
  android: {
    // Allows swiping to go back and generic WebView settings
    allowMixedContent: true,
  }
};

export default config;
