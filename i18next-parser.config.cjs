module.exports = {
  locales: ['en', 'uk'],
  output: 'src/locales/$LOCALE/translation.json',
  createOldCatalogs: false,
  defaultNamespace: 'translation',
  useKeysAsDefaultValue: true,
  lexers: {
    js: ['JsxLexer'],
    tsx: ['JsxLexer'],
  },
  keepRemoved: false,
};

// To parse use this command:
// npx i18next "src/**/*.jsx" --config i18next-parser.config.cjs
