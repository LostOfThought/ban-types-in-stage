---
title: "@lostofthought/ban-types-in-stage/ban"
---

# Ban Types/Values in Stage (`@lostofthought/ban-types-in-stage/ban`)

Disallow using types/values that are defined in specific files for a given stage.

This rule is primarily intended for use with [typed-factorio](https://github.com/GlassBricks/typed-factorio) when developing a Factorio mod with multiple [Factorio API stages](https://lua-api.factorio.com/latest/) (`settings`, `prototype`, `runtime`) in the same TypeScript project.

When using `typed-factorio`, it's common to include types for multiple stages in your `tsconfig.json` (e.g., `"types": ["typed-factorio/prototype", "typed-factorio/runtime"]`). This makes all globals from all specified stages available everywhere, which can lead to accidentally using a `runtime`-only API in the `prototype` stage, and vice-versa. This rule prevents such mistakes.

## Rule Details

This rule analyzes the origin of identifiers (variables, types, etc.) and reports an error if they are imported or defined in a file or module that is "banned" for the current file's stage.

Examples of **incorrect** code for the `data` (prototype) stage:

```typescript
// data-stage-file.ts

// Incorrect: script is a runtime-only global
script.on_event(defines.events.on_tick, () => {});

// Incorrect: LuaEntity is a runtime-only type
const myEntity: LuaEntity = game.get_player(1)!.character!;
```

Examples of **correct** code for the `data` (prototype) stage:

```typescript
// data-stage-file.ts

// Correct: data is a prototype-stage global
data.extend([
  {
    type: "item",
    name: "my-item",
    // ...
  },
]);
```

## Options

This rule has two required options in an object:

- `currentStage` (`string`): The name of the stage for the files being linted. This is used in the error message.
- `bannedPaths` (`string[]`): A list of paths that are not allowed to be used in this stage. Paths can be:
  - Bare module specifiers (e.g., `"typed-factorio/runtime"`). The rule will also handle `@types/` packages correctly.
  - Relative paths from the project root (e.g., `"./src/control"`).

### Example Configuration

Here is an example configuration for a `data` stage directory in an `eslint.config.js` file:

```javascript
// eslint.config.js
export default [
  {
    files: ["src/data/**/*.ts"],
    rules: {
      "@lostofthought/ban-types-in-stage/ban": [
        "error",
        {
          currentStage: "data",
          bannedPaths: [
            "typed-factorio/runtime", // from typed-factorio
            "typed-factorio/settings",
            "./src/control", // from your own code
          ],
        },
      ],
    },
  },
];
```

## When Not To Use It

You should not use this rule if your project does not have strict separations between parts of your codebase that have different available APIs, such as a Factorio mod. If you are not developing for an environment with stages like Factorio's, this rule will likely not be useful.
