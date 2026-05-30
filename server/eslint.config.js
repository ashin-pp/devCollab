import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            'no-console': 'warn', // Warns us if we leave console.logs in our code
            '@typescript-eslint/no-explicit-any': 'warn', // Discourages using the "any" type in TS
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Errors if variables are defined but never used
        },
    }
);
