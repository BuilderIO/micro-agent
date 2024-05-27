## Angular Parser Test

This test is used to test the Angular parser. The Angular parser is used to parse Angular components and extract information from them.

Run this test locally with:

```bash
npm start -- src/tests/angular-parser/parse.ts \
  -p src/tests/angular-parser/prompt.md \
  -t "npm test parser" \
  -f src/tests/angular-parser/parse.test.ts \
  -m 20
```
