import * as ts from 'typescript';

function isInputDecorator(decorator: ts.Decorator): boolean {
  if (ts.isCallExpression(decorator.expression)) {
    const callExpression = decorator.expression;
    if (ts.isIdentifier(callExpression.expression)) {
      return callExpression.expression.getText() === 'Input';
    }
  }
  return false;
}

function getTypeText(type: ts.TypeNode | undefined): string {
  if (!type) {
    return 'any';
  }
  const text = type.getText().trim();
  return text.includes('|') ? 'string' : text;
}

function extractSelectorFromComponentDecorator(
  componentNode: ts.ClassDeclaration
): string | undefined {
  for (const decorator of ts.getDecorators(componentNode) ?? []) {
    if (ts.isCallExpression(decorator.expression)) {
      const callExpression = decorator.expression;
      if (
        callExpression.arguments.length &&
        ts.isObjectLiteralExpression(callExpression.arguments[0])
      ) {
        const properties = callExpression.arguments[0].properties;
        for (const prop of properties) {
          if (
            ts.isPropertyAssignment(prop) &&
            ts.isIdentifier(prop.name) &&
            prop.name.text === 'selector'
          ) {
            if (ts.isStringLiteral(prop.initializer)) {
              return prop.initializer.text;
            }
          }
        }
      }
    }
  }
  return undefined;
}

function extractEnumOptions(componentString: string): Record<string, string[]> {
  const enumOptions: Record<string, string[]> = {};
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    componentString,
    ts.ScriptTarget.Latest,
    true
  );

  ts.forEachChild(sourceFile, (node) => {
    if (
      ts.isTypeAliasDeclaration(node) &&
      ts.isUnionTypeNode(node.type) &&
      node.type.types.every(
        (t) =>
          ts.isLiteralTypeNode(t) &&
          ts.isStringLiteral((t as ts.LiteralTypeNode).literal)
      )
    ) {
      enumOptions[node.name.text] = node.type.types.map(
        (t) => ((t as ts.LiteralTypeNode).literal as ts.StringLiteral).text
      );
    }
  });

  return enumOptions;
}

export function parse(componentString: string) {
  const enumOptions = extractEnumOptions(componentString);

  const sourceFile = ts.createSourceFile(
    'temp.ts',
    componentString,
    ts.ScriptTarget.Latest,
    true
  );

  const component: any = {};

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node)) {
      const className = node.name?.getText();
      if (className) {
        component.name = className;
      }

      const selector = extractSelectorFromComponentDecorator(node);
      if (selector) {
        component.selector = selector;
      }

      component.inputs = [];

      node.members.forEach((member) => {
        if (ts.isPropertyDeclaration(member)) {
          const decorators = ts.getDecorators(member);
          if (decorators) {
            decorators.forEach((decorator) => {
              if (isInputDecorator(decorator)) {
                const inputType = getTypeText(member.type);
                const input: any = {
                  name: member.name.getText(),
                  type: enumOptions[inputType] ? 'string' : inputType,
                };
                if (enumOptions[inputType]) {
                  input.enum = enumOptions[inputType];
                }
                component.inputs.push(input);
              }
            });
          }
        }
      });
    }
  });

  // Resolve typedefs used as input types
  const typeAliasMap: Record<string, string> = {};
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isTypeAliasDeclaration(node) && node.type) {
      typeAliasMap[node.name.text] = node.type.getText();
    }
  });

  component.inputs.forEach((input: any) => {
    if (typeAliasMap[input.type]) {
      input.type = typeAliasMap[input.type];
    }
  });

  return component;
}
