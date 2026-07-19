module.exports = {
    root: true,
    extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react/jsx-runtime', 'plugin:react-hooks/recommended', 'plugin:prettier/recommended'],
    settings: {
        react: {
            version: 'detect'
        }
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: { jsx: true }
    },
    env: {
        browser: true,
        node: true,
        es2020: true,
        jest: true
    },
    ignorePatterns: ['**/node_modules', '**/dist', '**/build', '**/coverage', '**/package-lock.json'],
    plugins: ['unused-imports'],
    rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'warn',
        'unused-imports/no-unused-vars': ['warn', { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }],
        'no-undef': 'off',
        'no-console': [process.env.CI ? 'error' : 'warn', { allow: ['warn', 'error', 'info'] }],
        'prettier/prettier': 'error',
        'react/prop-types': 'off'
    }
}
