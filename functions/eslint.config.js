import stylistic from '@stylistic/eslint-plugin';
import js from '@eslint/js';
export default [
  // Base config
  {
    languageOptions: {
      globals: {
        process: 'readable',
      },
    },
  },

  // 3rd Party configs to extend
  js.configs.recommended,
  stylistic.configs.customize({
    semi: true,
  }),

  // My config
  {
    rules: {
      'no-restricted-globals': ['error', 'name', 'length'],

      // This is supposed to be the default, but it's not.
      '@stylistic/brace-style': ['error', '1tbs'],

      /** NOTE(dabrady) This is just vastly more readable to me. */
      '@stylistic/object-curly-spacing': ['error', 'always'],

      /** NOTE(dabrady) I prefer named functions for many reasons. */
      '@stylistic/prefer-arrow-callback': 'off',

      /**
       * NOTE(dabrady) I prefer single quotes because double-quotes require pressing
       * two keys.
       */
      '@stylistic/quotes': ['error', 'single', { allowTemplateLiterals: true }],

      /** NOTE(dabrady) This isn't Python. Here we use compact indentation. */
      '@stylistic/indent': ['error', 2, { SwitchCase: 0 }],

      /**
       * NOTE(dabrady) My opinions on line-length are tightly coupled to the font I
       * use when developing. This number is comfortable for me, but I don't care to
       * enforce it strongly.
       */
      '@stylistic/max-len': ['warn', { code: 84, ignoreComments: true }],

      /** NOTE(dabrady) `var` is good, `var` is great. */
      '@stylistic/no-var': 'off',
    },
  },
];
