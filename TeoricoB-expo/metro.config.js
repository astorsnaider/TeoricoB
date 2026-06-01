// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Preferir CommonJS sobre ESM (.mjs) — algunas dependencias (zustand) usan
// `import.meta.env` en sus builds .mjs, lo que rompe en web porque Metro
// no transpila `import.meta`. Forzar `main` antes que `module` carga los
// .js CommonJS equivalentes que no usan esa sintaxis.
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
