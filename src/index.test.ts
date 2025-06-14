import path from 'node:path';

import { RuleTester } from '@typescript-eslint/rule-tester';
import * as parser from '@typescript-eslint/parser';
import { afterAll, describe, it } from 'vitest';

import { banRule } from './index.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: process.cwd(),
    },
  },
});

describe('ban-types-in-stage', () => {
  const rule = banRule;
  const ruleName = 'ban';

  describe('relative paths', () => {
    it('should allow imports from non-banned relative paths', () => {
      ruleTester.run(ruleName, rule, {
        valid: [
          {
            code: "import { allowed } from './test-files/allowed';",
            filename: 'src/test-files/consumer.ts',
            options: [
              {
                bannedPaths: ['./test-files/banned'],
                currentStage: 'test',
              },
            ],
          },
        ],
        invalid: [],
      });
    });

    it('should disallow imports from banned relative paths', () => {
      ruleTester.run(ruleName, rule, {
        valid: [],
        invalid: [
          {
            code: "import { banned } from './test-files/banned';",
            filename: 'src/test-files/consumer.ts',
            options: [
              {
                bannedPaths: ['./test-files/banned'],
                currentStage: 'test',
              },
            ],
            errors: [
              {
                messageId: 'bannedInStage',
                data: {
                  name: 'banned',
                  stageName: 'test',
                  bannedPath: './test-files/banned',
                },
              },
            ],
          },
        ],
      });
    });
  });

  describe('absolute paths', () => {
    it('should disallow imports from banned absolute paths', () => {
      const bannedPath = path.resolve(process.cwd(), 'src/test-files/banned');
      ruleTester.run(ruleName, rule, {
        valid: [],
        invalid: [
          {
            code: "import { banned } from './test-files/banned';",
            filename: 'src/test-files/consumer.ts',
            options: [
              {
                bannedPaths: [bannedPath],
                currentStage: 'test',
              },
            ],
            errors: [
              {
                messageId: 'bannedInStage',
                data: {
                  name: 'banned',
                  stageName: 'test',
                  bannedPath: bannedPath,
                },
              },
            ],
          },
        ],
      });
    });
  });

  describe('bare module specifiers', () => {
    it('should allow imports from non-banned bare module specifiers', () => {
      ruleTester.run(ruleName, rule, {
        valid: [
          {
            code: "import { myLib } from 'my-lib';",
            filename: 'src/consumer.ts',
            options: [
              {
                bannedPaths: ['another-lib'],
                currentStage: 'test',
              },
            ],
          },
        ],
        invalid: [],
      });
    });

    it('should disallow imports from banned bare module specifiers', () => {
      ruleTester.run(ruleName, rule, {
        valid: [],
        invalid: [
          {
            code: "import { myLib } from 'my-lib';",
            filename: 'src/consumer.ts',
            options: [
              {
                bannedPaths: ['my-lib'],
                currentStage: 'test',
              },
            ],
            errors: [
              {
                messageId: 'bannedInStage',
                data: {
                  name: 'myLib',
                  stageName: 'test',
                  bannedPath: 'my-lib',
                },
              },
            ],
          },
        ],
      });
    });

    it('should disallow imports from banned scoped bare module specifiers', () => {
      ruleTester.run(ruleName, rule, {
        valid: [],
        invalid: [
          {
            code: "import { scopedPkg } from '@scoped/pkg';",
            filename: 'src/consumer.ts',
            options: [
              {
                bannedPaths: ['@scoped/pkg'],
                currentStage: 'test',
              },
            ],
            errors: [
              {
                messageId: 'bannedInStage',
                data: {
                  name: 'scopedPkg',
                  stageName: 'test',
                  bannedPath: '@scoped/pkg',
                },
              },
            ],
          },
        ],
      });
    });
  });
}); 