import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mannan.app',
  appName: 'Jhalawan Hospital',
  webDir: 'www',
  plugins: {
    Media: {
      androidGalleryMode: true,
    },
  },
};

export default config;
