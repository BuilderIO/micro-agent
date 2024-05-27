# Micro Agent

An AI CLI that writes code for you.

Point Micro Agent at a file (either that exists or is empty) and a prompt, and it will write code for you. It will then run a test command to ensure the code works as expected. If the test fails, it will continue to iterate on the code until the test passes.

## Installation

```bash
npm install -g @builder.io/micro-agent
```

## Running

```bash
micro-agent run ./file-to-edit.ts -t "npm test"
```

This will run the Micro Agent on the file `./file-to-edit.ts` running `npm test` to see if the code is correct.

By default, Micro Agent assumes you have a test file with the same name as the editing file but with `.test.ts` appended, such as `./file-to-edit.test.ts` for the above examples.

If this is not the case, you can specify the test file with the `-f` flag, like `micro-agent run ./file-to-edit.ts -f ./file-to-edit.spec.ts`.

You can also add a prompt to help guide the code generation, either at a file located at `<filename>.prompt.md` like `./file-to-edit.prompt.md` or by specifying the prompt file with the `-p` flag, like `micro-agent run ./file-to-edit.ts -p ./path-to-prompt.prompt.md`.

### Max runs

By default, Micro Agent will do 10 runs. If tests don't pass in 10 runs, it will stop. You can change this with the `-m` flag, like `micro-agent run ./file-to-edit.ts -m 20`.
