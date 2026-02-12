// https://github.com/michael-ciniawsky/postcss-load-config

import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
// import rtlcss from 'postcss-rtlcss'

export default {
  plugins: [
    // Tailwind needs to process before SCSS is compiled
    tailwindcss(),

    autoprefixer({
      overrideBrowserslist: [
        'last 4 Chrome versions',
        'last 4 Firefox versions',
        'last 4 Edge versions',
        'last 4 Safari versions',
        'last 4 Android versions',
        'last 4 ChromeAndroid versions',
        'last 4 FirefoxAndroid versions',
        'last 4 iOS versions',
      ],
    }),
    // rtlcss()
  ],
};
