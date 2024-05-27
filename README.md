# Micro Agent

An AI CLI that writes code for you.

Point Micro Agent at a file (either that exists or is empty) and a test, and it will write code for you until your tests pass.

## Installation

```bash
npm install -g @builder.io/micro-agent
```

## Running

```bash
micro-agent run ./file-to-edit.ts -t "npm test"
```

This will run the Micro Agent on the file `./file-to-edit.ts` running `npm test` and will write code until the tests pass.s

The above assumes the following file structure:

```bash
./
├──file-to-edit.ts
├──file-to-edit.test.ts # test file. if you need a different path, use the -t argument
└──file-to-edit.prompt.md # optional prompt file. if you need a different path, use the -p argument
```

By default, Micro Agent assumes you have a test file with the same name as the editing file but with `.test.ts` appended, such as `./file-to-edit.test.ts` for the above examples.

If this is not the case, you can specify the test file with the `-f` flag, like `micro-agent run ./file-to-edit.ts -f ./file-to-edit.spec.ts`.

You can also add a prompt to help guide the code generation, either at a file located at `<filename>.prompt.md` like `./file-to-edit.prompt.md` or by specifying the prompt file with the `-p` flag, like `micro-agent run ./file-to-edit.ts -p ./path-to-prompt.prompt.md`.

### Max runs

By default, Micro Agent will do 10 runs. If tests don't pass in 10 runs, it will stop. You can change this with the `-m` flag, like `micro-agent run ./file-to-edit.ts -m 20`.

### Config

You can configure the CLI with the `config` command, for instance to set your OpenAI API key:

```bash
micro-agent config set OPENAI_KEY=<your token>
```

Or using interactive mode:

```bash
micro-agent config
```

## Usage

```bash
Usage:
  micro-agent <file path> [flags...]
  micro-agent <command>

Commands:
  config        Configure the CLI
  run           Run the micro agent from the given prompt and test script.
  update        Update Micro Agent to the latest version

Flags:
  -h, --help                      Show help
  -m, --max-runs <number>         The maximum number of runs to attempt
  -p, --prompt <string>           Prompt to run
  -t, --test <string>             The test script to run
  -f, --test-file <string>        The test file to run
      --thread <string>           Thread ID to resume
      --version                   Show version
```
