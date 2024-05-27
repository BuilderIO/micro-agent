import * as ts from 'typescript';

export function parse(componentString: string) {
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
          const inputDecorator = member.modifiers?.find(
            (modifier) => modifier.getText() === '@Input'
          );
          if (inputDecorator) {
            if (!component.inputs) {
              component.inputs = [];
            }
            component.inputs.push({
              name: member.name.getText(),
              type: member.type?.getText(),
            });
          }
        }
      });
    }

    if (ts.isDecorator(node) && ts.isCallExpression(node.expression)) {
      const callExpression = node.expression;
      if (callExpression.expression.getText() === 'Component') {
        callExpression.arguments.forEach((arg) => {
          if (ts.isObjectLiteralExpression(arg)) {
            arg.properties.forEach((prop) => {
              if (ts.isPropertyAssignment(prop)) {
                const initializer = prop.initializer;
                if (ts.isStringLiteral(initializer)) {
                  component[prop.name.getText()] = initializer.text;
                }
              }
            });
          }
        });
      }
    }
  });

  return component;
}
