// pressbutton/.eslintrc.base.cjs
module.exports = {
  settings: {
    'import/resolver': {
      typescript: { project: './tsconfig.json' }
    }
  },
  root: false, // 作为“基础”配置被子项目继承
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'unused-imports', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: {
    'unused-imports/no-unused-imports': 'warn',
    'import/order': ['warn', {
      'alphabetize': { order: 'asc', caseInsensitive: true },
      'newlines-between': 'always',
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
    }],
  },
  ignorePatterns: ['node_modules', 'dist', 'build', '.next', 'coverage'],

};
