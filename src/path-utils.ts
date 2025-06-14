export const getModuleFromFilename = (filename: string): string | undefined => {
  const nodeModulesIndex = filename.lastIndexOf('/node_modules/');
  if (nodeModulesIndex === -1) {
    return undefined;
  }

  const pathInNodeModules = filename.substring(
    nodeModulesIndex + '/node_modules/'.length,
  );

  const parts = pathInNodeModules.split('/');

  const scopeOrPkg = parts[0];

  if (scopeOrPkg === undefined) {
    return undefined;
  }

  if (scopeOrPkg.startsWith('@')) {
    const pkg = parts[1];
    if (pkg === undefined) {
      return undefined;
    }
    return `${scopeOrPkg}/${pkg}`;
  }
  return scopeOrPkg;
};

export const isAbsolute = (p: string): boolean => {
  return p.startsWith('/') || /^[A-Z]:[\\/]/i.test(p);
};

export const normalizePath = (p: string): string => {
  const isAbs = isAbsolute(p);
  const parts = p.split(/[/\\]+/);
  const stack: string[] = [];

  // On Windows, the first part could be a drive letter which we want to preserve.
  if (isAbs && /^[A-Z]:/i.test(parts[0] ?? '')) {
    stack.push(parts.shift() as string);
  }

  for (const part of parts) {
    if (part === '..') {
      // Don't pop past the root.
      if (stack.length > 0 && stack[stack.length - 1] !== '..') {
        stack.pop();
      }
    } else if (part !== '.' && part !== '') {
      stack.push(part);
    }
  }

  let result = stack.join('/');
  if (isAbs && p.startsWith('/')) {
    result = `/${result}`;
  }
  return result;
};

export const resolvePath = (from: string, to: string): string => {
  if (isAbsolute(to)) {
    return normalizePath(to);
  }
  return normalizePath(`${from}/${to}`);
};

export const extname = (p: string): string => {
  const lastDotIndex = p.lastIndexOf('.');
  if (lastDotIndex <= 0) {
    return '';
  }

  const lastSlashIndex = p.lastIndexOf('/');
  if (lastDotIndex < lastSlashIndex) {
    return ''; // dot is in a directory name
  }

  if (lastSlashIndex !== -1 && p.slice(lastSlashIndex + 1).startsWith('.')) {
    const basename = p.slice(lastSlashIndex + 1);
    if (basename.lastIndexOf('.') === 0) {
      return '';
    }
  }

  return p.slice(lastDotIndex);
}; 