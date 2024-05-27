import * as ts from 'typescript';

function isDecoratorWithExpression(node: ts.Node, expressionText: string): node is ts.Decorator {
  return ts.isDecorator(node) && ts.isCallExpression(node.expression) &&
    ts.isIdentifier(node.expression.expression) && node.expression.expression.text === expressionText;
}

function getTypeText(type: ts.TypeNode): string {
  return type.getText();
}

function extractSelectorFromComponentDecorator(node: ts.Decorator): string | undefined {
  let selector: string | undefined;

  if (ts.isCallExpression(node.expression)) {
    const callExpression = node.expression;

    if (callExpression.arguments.length && ts.isObjectLiteralExpression(callExpression.arguments[0])) {
      const properties = callExpression.arguments[0].properties;

      properties.forEach(prop => {
        if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'selector') {
          if (ts.isStringLiteral(prop.initializer)) {
            selector = prop.initializer.text;
          }
        }
      });
    }
  }

  return selector;
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
      node.type.types.every(t => ts.isLiteralTypeNode(t) && ts.isStringLiteral((t as ts.LiteralTypeNode).literal))
    ) {
      enumOptions[node.name.text] = node.type.types.map(t => (t as ts.LiteralTypeNode).literal.text);
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

  let component: any = {};

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node)) {
      component.name = node.name?.getText();

      node.members.forEach((member) => {
        if (ts.isPropertyDeclaration(member)) {
          const inputDecorator = member.decorators?.find((decorator) =>
            isDecoratorWithExpression(decorator, 'Input')
          );

          if (inputDecorator) {
            if (!component.inputs) {
              component.inputs = [];
            }
            const inputType = getTypeText(member.type!);
            const input: any = {
              name: member.name.getText(),
              type: inputType,
            };
            if (enumOptions[inputType]) {
              input.enum = enumOptions[inputType];
              input.type = 'string';
            }
            component.inputs.push(input);
          }
        }
      });

      if (node.decorators) {
        node.decorators.forEach(decorator => {
          const selector = extractSelectorFromComponentDecorator(decorator);
          if (selector) {
            component.selector = selector;
          }
        });
      }
    }
  });

  return component;
}