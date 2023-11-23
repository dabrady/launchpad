module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    "ecmaVersion": 2018,
    "sourceType": "module",
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],

    /** NOTE(dabrady) This is just vastly more readable to me. */
    "object-curly-spacing": ["error", "always"],

    /** NOTE(dabrady) I prefer named functions for many reasons. */
    "prefer-arrow-callback": "off",

    /**
     * NOTE(dabrady) I prefer single quotes because double-quotes require pressing
     * two keys.
     */
    "quotes": ["error", "single", { allowTemplateLiterals: true }],

    /** NOTE(dabrady) This isn't Python. Here we use compact indentation. */
    "indent": ["error", 2],

    /**
     * NOTE(dabrady) My opinions on line-length are tightly coupled to the font I
     * use when developing. This number is comfortable for me, but I don't care to
     * enforce it strongly.
     */
    "max-len": ["warn", { code: 84, ignoreComments: true }],

    /** NOTE(dabrady) `var` is good, `var` is great. */
    "no-var": "off",
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
