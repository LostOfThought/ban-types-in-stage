import type { Linter } from 'eslint';

export const factorio: Linter.Config[] = [
  {
    files: ['src/control/**/*.ts'],
    plugins: { '@lostofthought/ban-types-in-stage': {} as never },
    rules: {
      '@lostofthought/ban-types-in-stage/ban': [
        'error',
        {
          bannedPaths: ['typed-factorio/settings', 'typed-factorio/prototype'],
          currentStage: 'control',
        },
      ],
    },
  },
  {
    files: ['src/data/**/*.ts'],
    plugins: { '@lostofthought/ban-types-in-stage': {} as never },
    rules: {
      '@lostofthought/ban-types-in-stage/ban': [
        'error',
        {
          bannedPaths: ['typed-factorio/control', 'typed-factorio/settings'],
          currentStage: 'data',
        },
      ],
    },
  },
  {
    files: ['src/settings/**/*.ts'],
    plugins: { '@lostofthought/ban-types-in-stage': {} as never },
    rules: {
      '@lostofthought/ban-types-in-stage/ban': [
        'error',
        {
          bannedPaths: ['typed-factorio/control', 'typed-factorio/data'],
          currentStage: 'settings',
        },
      ],
    },
  },

  {
    files: ['src/shared/**/*.ts'],
    plugins: { '@lostofthought/ban-types-in-stage': {} as never },
    rules: {
      '@lostofthought/ban-types-in-stage/ban': [
        'error',
        {
          bannedPaths: [
            'typed-factorio/settings',
            'typed-factorio/prototype',
            'typed-factorio/data',
          ],
          currentStage: 'none',
        },
      ],
    },
  },
  {
    files: ['src/*.ts'],
    plugins: { '@lostofthought/ban-types-in-stage': {} as never },
    rules: {
      '@lostofthought/ban-types-in-stage/ban': [
        'error',
        {
          bannedPaths: [
            'typed-factorio/settings',
            'typed-factorio/prototype',
            'typed-factorio/data',
          ],
          currentStage: 'none - use files in their respective stage folders',
        },
      ],
    },
  },
]; 