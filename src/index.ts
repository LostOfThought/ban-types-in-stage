import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';

import { factorio } from './configs.js';
import {
  extname,
  getModuleFromFilename,
  isAbsolute,
  resolvePath,
} from './path-utils.js';

export type BanTypesOptions = {
  readonly bannedPaths: readonly string[];
  readonly currentStage: string;
  readonly requiresTypeChecking: boolean;
};

type RuleDocs = {
  readonly requiresTypeChecking: boolean;
};

const createRuleUrl = (name: string): string => `https://github.com/LostOfThought/eslint-plugin-ban-types-in-stage/blob/main/docs/rules/${name}.md`;

const createRule = ESLintUtils.RuleCreator<RuleDocs>(createRuleUrl);

export const banRule = createRule({
  create: (context, [{ bannedPaths, currentStage }]) => {
    if (bannedPaths.length === 0) {
      return {};
    }

    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    const cwd = context.cwd.replace(/\\/g, '/');

    return {
      Identifier: (node: TSESTree.Identifier): void => {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        if (!tsNode) {
          return;
        }
        const symbol = checker.getSymbolAtLocation(tsNode);
        if (!symbol?.declarations) {
          return;
        }

        for (const declaration of symbol.declarations) {
          const sourceFileName = declaration
            .getSourceFile()
            .fileName.replace(/\\/g, '/');

          for (const bannedPath of bannedPaths) {
            const isBareModuleSpecifier =
              !bannedPath.startsWith('.') && !isAbsolute(bannedPath);

            if (isBareModuleSpecifier) {
              const moduleName = getModuleFromFilename(sourceFileName);
              if (!moduleName) {
                continue;
              }

              const definitelyTypedPkgName = bannedPath.startsWith('@')
                ? `@types/${bannedPath.slice(1).replace('/', '__')}`
                : `@types/${bannedPath}`;

              if (
                moduleName === bannedPath ||
                moduleName === definitelyTypedPkgName
              ) {
                context.report({
                  data: {
                    bannedPath,
                    name: node.name,
                    stageName: currentStage,
                  },
                  messageId: 'bannedInStage',
                  node,
                });
                return;
              }
            } else {
              const absoluteBannedPath = bannedPath.startsWith('/')
                ? bannedPath
                : resolvePath(cwd, bannedPath).replace(/\\/g, '/');

              const ext = extname(sourceFileName);
              const sourceWithoutExt = ext
                ? sourceFileName.slice(0, -ext.length)
                : sourceFileName;

              if (
                sourceFileName === absoluteBannedPath ||
                sourceFileName.startsWith(`${absoluteBannedPath}/`) ||
                sourceWithoutExt === absoluteBannedPath
              ) {
                context.report({
                  data: {
                    bannedPath,
                    name: node.name,
                    stageName: currentStage,
                  },
                  messageId: 'bannedInStage',
                  node,
                });
                return;
              }
            }
          }
        }
      },
    };
  },
  defaultOptions: [
    {
      bannedPaths: [] as readonly string[],
      currentStage: 'unknown',
    },
  ],
  meta: {
    docs: {
      description:
        'Disallow using types/values that are defined in specific files for a given stage.',
      requiresTypeChecking: true,
    },
    messages: {
      bannedInStage:
        "'{{name}}' is unavailable in the '{{stageName}}' stage. It is defined in a file from '{{bannedPath}}'.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          bannedPaths: {
            items: {
              type: 'string',
            },
            type: 'array',
          },
          currentStage: {
            type: 'string',
          },
        },
        required: ['bannedPaths', 'currentStage'],
        type: 'object',
      },
    ],
    type: 'problem',
  },
  name: 'ban',
});

/**
 * ESLint plugin containing the ban-types-in-stage rule.
 */
const banTypesInStagePlugin: Record<string, unknown> = {
  rules: {
    ban: banRule,
  },
};

banTypesInStagePlugin['configs'] = {
  factorio: factorio.map((config) => ({
    ...config,
    plugins: {
      '@lostofthought/ban-types-in-stage': banTypesInStagePlugin,
    },
  })),
};

export default banTypesInStagePlugin;