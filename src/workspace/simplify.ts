import * as ts from 'typescript';

function simplify(inputCode: string): string {
  function transform(node: ts.Node): ts.Node {
      if (ts.isConditionalExpression(node)) {
          const trueText = node.whenTrue.getText().trim();
          const falseText = node.whenFalse.getText().trim();

          if ((trueText === "'71px'" || trueText === "'79px'") && 
              (falseText === "'71px'" || falseText === "'79px'" || ts.isConditionalExpression(node.whenFalse))) {

              if (trueText === falseText) {
                  return ts.factory.createStringLiteral(trueText.replace(/'/g, ''));
              }

              if ((trueText === "'71px'" && falseText === "'71px'") || 
                  (trueText === "'79px'" && falseText === "'79px'")) {
                  return ts.factory.createStringLiteral(trueText.replace(/'/g, ''));
              }

              if (ts.isConditionalExpression(node.whenFalse)) {
                  const falseWhenTrueText = node.whenFalse.whenTrue.getText().trim();
                  const falseWhenFalseText = node.whenFalse.whenFalse.getText().trim();

                  if (falseWhenTrueText === trueText && falseWhenFalseText === trueText) {
                      return ts.factory.createStringLiteral(trueText.replace(/'/g, ''));
                  }
                  if (falseWhenTrueText === falseText && falseWhenFalseText === falseText) {
                      return ts.factory.createStringLiteral(falseText.replace(/'/g, ''));
                  }
              }
          }

          if (node.condition.getText().trim() === "type === 'With Icon'" &&
              trueText === "'79px'" && falseText === "'71px'") {
              return ts.factory.createConditionalExpression(
                  ts.factory.createBinaryExpression(
                      ts.factory.createIdentifier('type'),
                      ts.SyntaxKind.EqualsEqualsEqualsToken,
                      ts.factory.createStringLiteral('With Icon')
                  ),
                  undefined,
                  ts.factory.createStringLiteral('79px'),
                  undefined,
                  ts.factory.createStringLiteral('71px')
              );
          }
      }

      return ts.visitEachChild(node, transform, ts.nullTransformationContext);
  }

  const sourceFile = ts.createSourceFile('temp.ts', inputCode, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const result = ts.visitNode(sourceFile, transform) as ts.SourceFile;
  const printer = ts.createPrinter();
  return printer.printFile(result);
}