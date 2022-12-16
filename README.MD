# Instructions

## Installing dependecies

To install, for example, react as a dependency into all packages, you can use the following command:
$ lerna add react
If you want to install react as dependency only to a particular package, execute the following command:
$ lerna add react --scope my-package
If you have installed react for every package but would like to upgrade/downgrade to a particular version only for a specific package then you can do it like this:
$ lerna add react@16.0.0 --scope my-package

## Adding packages

You can create a packages folder and start adding creating your packages there or use this command $ npx lerna create @projectName/packagename.
