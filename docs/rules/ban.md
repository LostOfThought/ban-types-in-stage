---
title: "@lostofthought/ban-types-in-stage/ban"
---

# Ban types/values from a specific stage (`@lostofthought/ban-types-in-stage/ban`)

Disallow using types/values that are defined in specific files for a given stage.

This rule is useful when you have a single TypeScript project that contains code for different "stages" or environments (e.g., `settings`, `prototype`, and `runtime` in Factorio mods; or `frontend` and `backend` in a web app) and you want to prevent code from one stage from being used in another.

## Rule Details

This rule works by analyzing your `import` and `require` statements, as well as global types. When it encounters a type or value, it traces it back to its origin file. If that file is located in a path that you have banned for the current file's stage, it will report an error.

The rule requires typed linting to be configured.

Examples of **incorrect** code for this rule:

With the following configuration in your `eslint.config.js`:

```javascript
// eslint.config.js
export default [
  /* ...
    parser setup
  ... */
  {
    files: ['src/frontend/**/*.ts'],
    rules: {
      '@lostofthought/ban-types-in-stage/ban': ['error', {
        bannedPaths: ['src/backend', 'node-pty'],
        currentStage: 'frontend',
      }],
    },
  },
];
```

The following code in `src/frontend/index.ts` would be an error:

```typescript
// src/frontend/index.ts
import { someBackendFunction } from '../backend/utils'; // Error: '../backend/utils' is in a banned path 'src/backend'
import * as pty from 'node-pty'; // Error: 'node-pty' is a banned module

function doSomething() {
  someBackendFunction();
}
```

Examples of **correct** code for this rule:

Using the same configuration as above, the following is allowed:

```typescript
// src/frontend/index.ts
import { someFrontendFunction } from './utils';

function doSomething() {
  someFrontendFunction();
}
```

## Options

The rule takes one argument, an object with the following properties:

- `bannedPaths` (`string[]`): An array of paths or modules to ban in the current stage.
  - **Path**: A relative path (from the project root) to a directory or file. Any import that resolves to this path or a sub-path will be banned. Example: `src/backend`.
  - **Module**: The name of an npm package. Any import from this module will be banned. Example: `node-pty`.
- `currentStage` (`string`): The name of the current stage. This is used in the error message to provide context. Example: `frontend`.

This rule is intended to be used in a configuration that applies it with different options to different parts of your project, as shown in the example above and in the main `README.md`.
