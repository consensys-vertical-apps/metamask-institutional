# Instructions

## Installing dependecies

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

```
lerna version --no-private
```

Note the above operation does not push the package to any NPM repository. If instead we also want Lerna to take care of the publishing process, we can use `lerna publish` instead.

## Publish

If you want to publish, first of all, you need to log in to `npmjs` using this command:

`$ npm login`

If we run `$ yarn run publish` Lerna executes the version incrementing workflow (same as `lerna version`) and in addition also pushes the packages to NPM.

## Create new packages

You can create a packages folder and start adding creating your packages there or use this command
`$ npx lerna create @projectName/packagename.`
