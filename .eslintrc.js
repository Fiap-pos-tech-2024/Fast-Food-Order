module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    env: {
        node: true, // Define o ambiente Node.js para reconhecer 'module'
    },
    rules: {
        'prettier/prettier': 'error',
        '@typescript-eslint/no-explicit-any': 'off', // Ignore the use of 'any'
    },
    settings: {
        'import/resolver': {
            typescript: {},
        },
    },
}
