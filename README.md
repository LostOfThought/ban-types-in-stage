# @lostofthought/eslint-plugin-ban-types-in-stage

An ESLint plugin to prevent the usage of types and values from one programming "stage" in another.

This plugin is primarily intended for use with [typed-factorio](https://github.com/GlassBricks/typed-factorio) when developing a Factorio mod with multiple [Factorio API stages](https://lua-api.factorio.com/latest/) (`settings`, `prototype`, `runtime`) in the same TypeScript project.

When using `typed-factorio`, it's common to include types for multiple stages in your `tsconfig.json` (e.g., `"types": ["typed-factorio/prototype", "typed-factorio/runtime"]`). This makes all globals from all specified stages available everywhere, which can lead to accidentally using a `runtime`-only API in the `prototype` stage, and vice-versa. This plugin provides a rule to prevent such mistakes.

## Installation and Setup

This plugin relies on **typed linting**, which requires a specific setup to grant ESLint access to your project's TypeScript type information.

**1. Install Dependencies**

Install ESLint, TypeScript, the TypeScript parser, and the plugin in one command:

```sh
pnpm add -D eslint typescript @typescript-eslint/parser @lostofthought/eslint-plugin-ban-types-in-stage
```

**2. Configure ESLint**

To get everything working, you need to configure the TypeScript parser and then add the plugin's recommended configuration. Here is a complete `eslint.config.js` example:

```javascript
// eslint.config.js
import typescriptParser from '@typescript-eslint/parser';
import banTypesInStagePlugin from '@lostofthought/eslint-plugin-ban-types-in-stage';

export default [
  // This first part sets up the parser for typed linting.
  // It must come before any rules that require type information.
  {
    files: ['src/**/*.ts'], // Adjust this glob to match your source files
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Add the plugin's recommended configuration for Factorio development.
  // This assumes a directory structure like:
  // - src/control/ for runtime files
  // - src/data/ for prototype files
  // - src/settings/ for settings files
  ...banTypesInStagePlugin.configs.factorio,
];
```

For more details on typed linting, see the [typescript-eslint documentation](https://typescript-eslint.io/getting-started/typed-linting).

## Usage

Once installed and configured, ESLint will automatically use this plugin to check your code. No further steps are needed.

## Rules

This plugin exports one rule:

- [`@lostofthought/ban-types-in-stage/ban`](./docs/rules/ban.md): Disallow using types/values that are defined in specific files for a given stage.

## License

MIT
