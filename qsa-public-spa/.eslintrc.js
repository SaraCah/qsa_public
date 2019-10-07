module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended"
  ],
  plugins: ["react", "@typescript-eslint", "prettier"],
  env: {
    browser: true
  },
  rules: {
    "prettier/prettier": ["error", { singleQuote: true, printWidth: 120 }],
    "react/self-closing-comp": ["error", { component: true, html: true }],
    "react/no-array-index-key": "error",
    "@typescript-eslint/no-explicit-any": "off",
    "react/prop-types": "off"
  },
  settings: {
    react: {
      pragma: "React",
      version: "detect"
    }
  },
  parser: "@typescript-eslint/parser"
};