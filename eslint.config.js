import js from '@eslint/js';
import configPrettier from 'eslint-config-prettier';
import pluginTypeScript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const ext2file = (ext) => `src/**/*.${ext}`;

export default [
  // eslint:recommended
  js.configs.recommended,
  // for TypeScript
  {
    files: ['ts', 'tsx'].map(ext2file),
    plugins: {
      '@typescript-eslint': pluginTypeScript,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
      },
    },
    rules: {
      ...pluginTypeScript.configs['eslint-recommended'].overrides[0].rules,
      ...pluginTypeScript.configs['recommended-type-checked'].rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  // override for Prettier
  configPrettier,
];
