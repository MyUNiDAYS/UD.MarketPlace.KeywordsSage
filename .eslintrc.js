module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true, // Always try to resolve types under `@types` directory
        project: "./tsconfig.json",
      },
    },
  },
  plugins: ["@typescript-eslint", "no-type-assertion"],
  rules: {
    "import/no-default-export": "error",
    complexity: ["error", 8],
    "max-params": ["error", 3],
    "max-lines": [
      "error",
      { max: 150, skipComments: true, skipBlankLines: true },
    ],
    "import/no-unresolved": 1,
    "no-redeclare": 1,
    "@typescript-eslint/no-non-null-assertion": "error",
    "import/no-duplicates": "error",
    semi: 0,
    quotes: 0,
    indent: 0,
    "multiline-ternary": "off",
    "space-before-function-paren": 0,
    "comma-dangle": [
      "error",
      {
        arrays: "always-multiline",
        objects: "always-multiline",
        imports: "always-multiline",
        exports: "always-multiline",
        functions: "never",
      },
    ],
    "object-shorthand": "error",
    "no-type-assertion/no-type-assertion": "error",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-unused-vars": "off",
    "import/no-namespace": "off",

    radix: "error",
  },
  overrides: [
    // Allow for tests to be longer than 150 lines
    {
      files: ["**/*.spec.tsx", "**/*.spec.ts"],
      rules: {
        "max-lines": 0,
        "no-type-assertion/no-type-assertion": "off",
      },
    },
    {
      files: ["**/*.js"],
      rules: {
        "@typescript-eslint/no-require-imports": "off",
      },
    },
  ],
};
