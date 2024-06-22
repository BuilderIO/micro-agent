export function generateAsciiTree(paths: (string | null | number)[]): string {
  if (!paths.every((path) => typeof path === 'string')) {
    throw new TypeError('All elements in the paths array must be strings.');
  }

  // Define the Tree Node structure
  type TreeNode = {
    [key: string]: TreeNode | null;
  };

  const root: TreeNode = {};

  // Function to add paths to the tree
  function addPathToTree(path: string, node: TreeNode) {
    const parts = path.split('/');
    let current = node;

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = index === parts.length - 1 ? null : {};
      }
      current = current[part] as TreeNode;
    });
  }

  // Construct the tree
  paths.forEach((path) => {
    if (typeof path === 'string') {
      addPathToTree(path, root);
    }
  });

  // Function to generate ASCII tree
  function generateTreeString(
    node: TreeNode,
    prefix: string = '',
    isLast: boolean = true
  ): string {
    const keys = Object.keys(node);
    let result = '';

    keys.forEach((key, index) => {
      const isThisLast = index === keys.length - 1;
      result += prefix + (isThisLast ? '└── ' : '├── ') + key + '\n';

      // Generate subtree if the current node is a directory
      if (node[key]) {
        result += generateTreeString(
          node[key] as TreeNode,
          prefix + (isThisLast ? '    ' : '│   '),
          isThisLast
        );
      }
    });

    return result;
  }

  return generateTreeString(root).trim();
}
