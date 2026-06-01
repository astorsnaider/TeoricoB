module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    overrides: [
      {
        // Algunas dependencias (zustand 4.x ESM) usan `import.meta.env.MODE`
        // que Metro/web no soporta. Aplicamos el plugin solo a esos paquetes
        // para transformar el sintaxis incompatible.
        test: /[\\/]node_modules[\\/](zustand)[\\/]/,
        plugins: [['babel-plugin-transform-import-meta', { module: 'ES6' }]],
      },
    ],
  };
};
