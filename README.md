# Micro Agent

An AI CLI that writes code for you.

Point Micro Agent at a file (either that exists or is empty) and a prompt, and it will write code for you. It will then run a test command to ensure the code works as expected. If the test fails, it will continue to iterate on the code until the test passes.

Useful for saving brain cycles letting Micro Agent write code for you.

## Installation

```bash
npm install -g @builder.io/micro-agent
```

## Running

```bash
mi run ./src/file-to-edit.ts -p ./prompt.md -t "npm test"
```

This will read the prompt in `./prompt.md`, and write the output to `./src/file-to-edit.ts`. It will then run the command `npm test` to test the output, and if the test fails, it will continue to iterate on the output until the test passes.

## Integration with Figma

One use case for Micro Agent is to automate the process of creating code from Figma via [Visual Copilot](https://www.builder.io/c/docs/visual-copilot) that
strictly matches your coding style (e.g. linting, formatting, etc.).
