module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
  },
  env: {
    es6: true,
    browser: true,
  },
  extends: ["eslint:recommended"],
  parser: "babel-eslint",
  rules: {},
  // Fixed bug with this...
  // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-loss-of-precision.md
  // note you must disable the base rule as it can report incorrect errors
  "no-loss-of-precision": "off",
  "@typescript-eslint/no-loss-of-precision": ["error"],
};
