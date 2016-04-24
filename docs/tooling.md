# Tooling

We use various tooling to improve the developer workflow. This document lists most of them. You only need to run `npm install` to install all the required dependencies, and install the necessary plugins for your Editor.

The following commands are configured in this repository,

1. `npm start` - start the node server (runs with `babel-node` in developement, and transpiles files on production)
1. `npm test` - run tests with Jest
2. `npm run flow` - typecheck files with Flow
3. `npm run lint` - lint changed files with ESLint
4. `npm run build` - build files with Webpack
5. `npm run clean` - clean all built files

**NOTE:** You need at least Node v5.0.0 for these to work

## Maintaining code consistency with [EditorConfig](http://editorconfig.org/)

EditorConfig helps maintain consistent coding styles between different editors and IDEs. This repository contains an `.editorconfig` file, which can automatically set project-specific settings such as indentation.

### Editor plugins

* **Atom** - [`atom-editorconfig`](https://atom.io/packages/atom-editorconfig)
* **Sublime Text** - [`EditorConfig`](https://packagecontrol.io/packages/EditorConfig)
* **Brackets** - [`brackets-editorconfig`](https://github.com/kidwm/brackets-editorconfig/)

## ES201x with [Babel](https://babeljs.io/)

Babel allows to use latest JavaScript syntax as well as custom syntaxes like JSX and Flow type annotations, and then transpiles them to ES5 code.

Babel is configured to transpile the following features in this repository,

1. [All new features in ES2015](https://babeljs.io/docs/learn-es2015/)
2. [All features which reached stage-1](https://babeljs.io/docs/plugins/preset-stage-1/)
3. [React's JSX syntax](https://facebook.github.io/jsx/)
4. [Flow type annotations](flowtype.org/docs/type-annotations.html)

### Editor plugins

* **Atom** - [`language-babel`](https://atom.io/packages/language-babel)
* **Sublime Text** - [`Babel`](https://packagecontrol.io/packages/Babel)

## Building files with [Webpack](https://webpack.github.io/)

### Why

1. Single build tool to manage everything, including JavaScript, Sass, etc.
2. Minimal configuration
3. Hot reload functionality
4. Can produce chunks instead of a single bundle, as well as a common bundle with shared modules if desired

### How

Webpack works by using loaders on the input files, such as [`babel-loader`](https://github.com/babel/babel-loader) for transpiling ES2015 using Babel, [`style-loader`](https://github.com/webpack/style-loader) and [`css-loader`](https://github.com/webpack/css-loader) to bundle CSS etc. To handle hot reload, minification etc. various plugins can be used, e.g.- `webpack.optimize.UglifyJsPlugin`,  The configuration can be specified in a `webpack.config.js` file.

```js
const webpack = require("webpack");
const path = require("path");

module.exports = {
	entry: [
		"./index"
	],
	output: {
		path: path.resolve(__dirname, "static/dist/scripts"),
		publicPath: "/dist/scripts",
		filename: "bundle.min.js"
	},
	plugins: [ new webpack.optimize.UglifyJsPlugin() ],
	module: {
		loaders: [
			{ test: /\.js$/, loaders: [ "babel" ] }
		]
	}
};
```

### Setup

Webpack is already configured in the repo and you build the bundle using the command `npm run build`, or run the build server with hot reloading functionality with `npm run build-server`. You don't need to install Webpack globally. To use the `webpack` command directly, install Webpack globally by running `npm install -g webpack` and install the dev server globally by running `npm install -g webpack-dev-server`.

## Running tests with [Jest](https://facebook.github.io/jest/)

### Why

1. All CommonJS style dependencies are mocked by default
2. Automatically finds all tests located in `__tests__` folders in the repo
3. Allows to test async code synchronously
4. Tests run in parallel, so that they finish sooner
5. Includes [`jsdom`](https://github.com/tmpvar/jsdom) by default to run DOM related tests

### How

Usage is almsot the same as you'd do with `mocha`, except you need to tell Jest not to mock the module you're testing.

```js
// lib/multiply.js

module.exports = function multiply(a, b) {
	return a * b;
}
```

```js
// lib/__tests__/multiply-test.js

jest.unmock("../multiply");

describe("lib", function() {
	it("multiplies 2 numbers", function() {
		const multiply = require("../multiply");

		expect(multiply(2, 3)).toBe(6);
	});
});
```

Now you can either run the test by using the `jest` command, or use `--watch` to run the tests whenever the files change.

**NOTES:**

1. You can also use the `assert` library if you want.
2. You need to require the module after the `jest.unmock(...)` statement. ES2015 imports are hoisted to the top, so cannot use them.
3. To turn off auto-mocking modules, use `jest.autoMockOff()`.

### Setup

Jest is already configured in the repo and you can run the tests by using the command `npm test`. You don't need to install Jest globally. To use the `jest` command directly, install Jest globally by running `npm install -g jest-cli`.

## Type checking with [Flow](http://flowtype.org/)

### Why

1. **Type-safety** - Flow will typecheck the files and can easily catch common errors.
2. **Auto-complete** - The IDE can provide correct auto-completion (which is awesome).

### How

For Flow to typecheck your file, you need to add a comment '/* @flow */' at the top of your file. Then you can annotate to take advantage of flow.

```js
/* @flow */

import Ebus from "ebus";

type Bus = {
	emit(event: string, options: Object, callback?: Function): void;
	on(event: string, callback: Function, priority?: number): void;
}

const bus: Bus = new Ebus();

export default bus;
```

When using third-party modules, you can add a interface file to provide flow type checking and autocomplete,

```js
// interfaces/somemodule.js

declare module "somemodule" {
    declare function doStuff(what: string, options?: object): void;
}
```

When publishing your own library, you can copy the flow annotated file to, say 'coollib.js.flow', and publish a flow-stripped version (may be with a npm pre-publish script), so people who use flow can get all the benefits of flow, and people who don't use flow can still use the library.

### Ignoring Flow errors

Errors should be fixed instead of ignoring, but if it's a flow issue, or the error cannot be fixed easily, there are two ways to ignore the errors configured in this repo.

1. `$FlowIssue` - If the error is due to a bug in Flow, and not in your code, use this
2. `$FlowFixMe` - If the error is in your code, use this

```js
// $FlowFixMe: suppressing this error until we can refactor
const x: string = 123;
```

### Editor plugins

* **Nuclide** - Inbuilt flow support
* **Atom** - [`linter-flow`](https://atom.io/packages/linter-flow) (linting), [`nuclide`](https://atom.io/packages/nuclide) (liniting and auto-completion),  [`flow-ide`](https://atom.io/packages/flow-ide) (liniting and auto-completion)
* **Sublime Text** -  [`SublimeLinter-flow`](https://packagecontrol.io/packages/SublimeLinter-flow) (linting)
* **Visual Studio Code** - [`flow-for-vscode`](https://github.com/flowtype/flow-for-vscode) (linting and auto-completion)
* **Brackets** - [`brackets-flow`](https://github.com/fdecampredon/brackets-flow) (liniting and auto-completion)

### Setup

Flow is already configured in the repo and you can typecheck the files using the command `npm run flow`. You don't need to install Flow globally. To use the `flow` command directly, install Flow globally by running `npm install -g flow-bin`;

## Linting with [ESLint](http://eslint.org/)

### Why

1. Customizable warning levels
2. Supports plugins and custom parsers, e.g.- [`eslint-plugin-react`](https://github.com/yannickcr/eslint-plugin-react), [`babel-eslint`](https://github.com/babel/babel-eslint)

### How

The linter configuration can be specified in the `.eslintrc` file. To ignore certain files, they can be added to the `.eslintignore` file.

### Ignoring ESLint warnings

Sometimes you need to suppress the errors which cannot be fixed, for example, cyclic dependency between functions in the same file. ESLint provides two kind of comments to suppress warnings, suppress for current scope, or suppress for line.

```js
/* eslint-disable no-use-before-define */

function multiply(a: number|string, b: number): number|string {
	if (typeof a === "string") {
		return repeat(a, b);
	}

	return a * b;
}

function repeat(a: string|number, b: number): string|number {
	if (typeof a === "number") {
		return multiply(a, b);
	}

	return a.repeat(b);
}
```

```js
eval("console.log('Hello world!')"); // eslint-disable-line no-eval
```

### Editor plugins

* **Atom** - [`linter-eslint`](https://atom.io/packages/linter-eslint)
* **Sublime Text** - [`SublimeLinter-contrib-eslint`](https://packagecontrol.io/packages/SublimeLinter-contrib-eslint)
* **Visual Studio Code** - [Inbuilt (needs to be enabled)](https://code.visualstudio.com/updates/v0_8_0#_languages-javascript-linting-as-you-type)
* **Brackets** - [`brackets-eslint`](https://github.com/zaggino/brackets-eslint)

### Setup

ESLint is already configured in the repo and you can lint the files using the command `npm run lint` (Note that it'll only check the files which are tracked by GIT and have been changed). You don't need to install ESLint globally. To use the `eslint` command directly, install ESLint globally by running `npm install -g eslint`;
