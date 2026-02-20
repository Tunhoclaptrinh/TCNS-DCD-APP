module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@src': './src',
            '@config': './src/config',
            '@services': './src/services',
            '@utils': './src/utils',
            '@components': './src/components',
            '@screens': './src/screens',
            '@types': './src/types',
            '@stores': './src/store',
            '@hooks': './src/hooks',
            '@constants': './src/constants',
            '@styles': './src/styles',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
