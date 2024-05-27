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

      node.decorators?.forEach((decorator) => {
        if (ts.isCallExpression(decorator.expression)) {
          const callExpression = decorator.expression;
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

      node.members.forEach((member) => {
        if (ts.isPropertyDeclaration(member)) {
          member.decorators?.forEach((decorator) => {
            if (ts.isCallExpression(decorator.expression)) {
              const callExpression = decorator.expression;
              if (callExpression.expression.getText() === 'Input') {
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
      });
    }
  });

  return component;
}
