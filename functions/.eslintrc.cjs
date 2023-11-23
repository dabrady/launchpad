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
    "object-curly-spacing": ["error", "always"],
    // I dislike arrow functions for Reasons.
    "prefer-arrow-callback": "off",
    "quotes": ["error", "double", { allowTemplateLiterals: true }],
    "indent": ["error", 2],
    "max-len": ["error", { code: 84, ignoreComments: true }],
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
