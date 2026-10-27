import js from '@eslint/js'
import globals from 'globals'
import hooks from 'eslint-plugin-react-hooks'
import refresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', '.qa', '.private', 'assets'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': hooks, 'react-refresh': refresh },
    rules: {
      ...hooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['scripts/*.mjs', '*.js'],
    ...js.configs.recommended,
    languageOptions: { globals: globals.node },
  },
  {
    files: ['scripts/verify*.mjs', 'scripts/inspect-projects.mjs'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
)
