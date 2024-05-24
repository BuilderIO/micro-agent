import ts from 'typescript';

function simplify(inputCode: string): string {
    const sourceFile = ts.createSourceFile('temp.ts', inputCode, ts.ScriptTarget.Latest);
    const kindMap: { [key: string]: string } = {};

    function visit(node: ts.Node): void {
        if (ts.isConditionalExpression(node)) {
            const condition = node.condition.getText();
            const whenTrue = node.whenTrue.getText();

            if (!kindMap[whenTrue]) {
                kindMap[whenTrue] = condition;
            } else {
                kindMap[whenTrue] += ' || ' + condition;
            }

            ts.forEachChild(node, visit);
        } else {
            ts.forEachChild(node, visit);
        }
    }

    ts.forEachChild(sourceFile, visit);

    const cases = Object.entries(kindMap).sort(([a], [b]) => (a > b ? -1 : 1));
    const simplified = cases.map(([value, condition], index) =>
        index === 0 ? `${condition} ? ${value}` : ` : ${condition} ? ${value}`
    ).join('');

    return `${simplified} : ${cases[cases.length - 1][0]}`;
}

const inputCode = `type === 'Default' && status === 'Default'
? '71px'
: type === 'With Icon' && status === 'Default'
? '79px'
: type === 'With Icon' && status === 'Neutral'
? '79px'
: type === 'With Icon' && status === 'Active'
? '79px'
: type === 'With Icon' && status === 'Alert'
? '79px'
: type === 'With Icon' && status === 'Caution'
? '79px'
: type === 'Default' && status === 'Neutral'
? '71px'
: type === 'Default' && status === 'Active'
? '71px'
: type === 'Default' && status === 'Alert'
? '71px'
: '71px'`;

console.log(simplify(inputCode));