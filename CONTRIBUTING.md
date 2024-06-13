# Contribution Guide

## Guidelines

We would love your contributions to make this project better, and gladly accept PRs.

Note: please try to keep changes incremental. Big refactors cause heartburn, please try to make frequent, small PRs instead of large ones.

## Setting up the project

Use [nvm](https://nvm.sh) to use the appropriate Node.js version from `.nvmrc`:

```sh
nvm i
```

Install the dependencies using npm:

```sh
npm i
```

## Building the project

Run the `build` script:

```sh
npm run build
```

The package is bundled using [pkgroll](https://github.com/privatenumber/pkgroll) (Rollup). It infers the entry-points from `package.json` so there are no build configurations.

### Development

To run the CLI locally without installing it globally, you can use the `start` script:

```sh
npm start
```

## Check the lint in order to pass

First, install prettier.

```sh
npm run lint:fix
```

If you use Vscode, It is recommended to use [prettier-vscode](https://github.com/prettier/prettier-vscode)

## Send a pull request

Once you have made your changes, push them to your fork and send a pull request to the main repository. We will try to review your changes in a timely manner.
