# Instructions

## Installing dependecies

If you have common dev dependencies, it’s better to specify them in the workspace root package.json. For instance, this can be dependencies like Jest, Husky, Storybook, Eslint, Prettier, etc.

`yarn add husky --D -W`

_Adding the -W flag makes it explicit that we’re adding the dependency to the workspace root._

To install, for example, react as a dependency into all packages, you can use the following command:

`$ lerna add react`

If you want to install react as dependency only to a particular package, execute the following command:

`$ lerna add react --scope my-package`

If you have installed react for every package but would like to upgrade/downgrade to a particular version only for a specific package then you can do it like this:

`$ lerna add react@16.0.0 --scope my-package`

## Local build

`$ yarn build`

## Versioning

Lerna comes with a `version` command that allows you to increment your package's version number, commit the changes and tag them accordingly. Note that by passing `--no-private` we exclude all packages that are marked `private` in their `package.json` file.

```typescript
lerna version --no-private
```

Note the above operation does not push the package to any NPM repository. If instead we also want Lerna to take care of the publishing process, we can use `lerna publish` instead.

## Publish

If you want to publish, first of all, you need to log in to `npmjs` using this command:

`$ npm login`

If we run `$ yarn run publish` Lerna executes the version incrementing workflow (same as `lerna version`) and in addition also pushes the packages to NPM.

## Create new packages

Create a directory for your package in the packages folder, and run npm init as normal to create the package.json for your new package.

### Writing commit messages with Conventional Commits

#### Type

The type is mandatory and determines the intent of the change. Here are possible values:

- build: changes affecting build systems or external dependencies
- ci: updating configuration files for continuous integration and deployment services
- chore: updating grunt tasks etc.; no production code change
- docs: documentation-only changes
- feat: a new feature
- fix: a bug fix
- perf: a code change that improves performance
- refactor: a code change that neither fixes a bug nor adds a feature
- style: changes that do not affect the meaning of the code (white-space, formatting, missing semicolons, etc.)
- test: adding missing tests or correcting existing tests

#### Scope

A scope is an optional value that provides additional contextual information about the change. For example, when the module’s name, npm package, or particular routine was affected.

The scope, when present, must be contained within parenthesis.

#### Subject

The subject is the headline of the commit. It should summarize in one sentence the nature of change.

####  Example with monorepos

```typescript
packages
├── api
├── app
└── web

❯ echo "build(api): change something in api's build" | commitlint
⧗   input: build(api): change something in api's build
✔   found 0 problems, 0 warnings

❯ echo "test(foo): this won't pass" | commitlint
⧗   input: test(foo): this won't pass
✖   scope must be one of [api, app, web] [scope-enum]
✖   found 1 problems, 0 warnings

❯ echo "ci: do some general maintenance" | commitlint
⧗   input: ci: do some general maintenance
✔   found 0 problems, 0 warnings
```
