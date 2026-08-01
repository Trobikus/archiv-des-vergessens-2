import js from "@eslint/js";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { flatConfigs as importX } from "eslint-plugin-import-x";
import * as reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import { configs as tsConfigs, config as tsConfig } from "typescript-eslint";

export default tsConfig(
  {
    ignores: [
      "**/dist/**",
      "**/dist-types/**",
      "**/coverage/**",
      "**/node_modules/**",
      "apps/desktop/**",
      "apps/launcher/**",
      "tools/e2e/**",
    ],
  },
  js.configs.recommended,
  ...tsConfigs.strictTypeChecked,
  importX.recommended,
  importX.typescript,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            "*.js",
            "*.mjs",
            "vitest.config.ts",
            "apps/client/vite.config.ts",
            "tools/migrate-v1-saves/*.ts",
          ],
          defaultProject: "./tsconfig.eslint.json",
        },
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          project: "./tsconfig.eslint.json",
          alwaysTryTypes: true,
        }),
      ],
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": true,
          "ts-expect-error": "allow-with-description",
          minimumDescriptionLength: 8,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "import-x/no-cycle": ["error", { maxDepth: 8 }],
      "import-x/no-duplicates": "error",
      "import-x/no-unresolved": "error",
      "import-x/no-named-as-default": "off",
      "import-x/no-named-as-default-member": "off",
      "import-x/default": "off",
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["apps/client/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...tsConfigs.disableTypeChecked,
  },
  {
    files: [
      "tools/**/*.{js,mjs,ts}",
      "packages/*/scripts/**/*.{js,mjs}",
      "eslint.config.js",
      "**/vite.config.ts",
      "vitest.config.ts",
    ],
    rules: {
      "no-console": "off",
    },
  },
);
