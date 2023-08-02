const baseConfig = require("../../jest.config.js");
const path = require("path");
const { lstatSync, readdirSync } = require("fs");

// get listing of packages in the mono repo
const basePath = path.resolve(__dirname);
const packages = readdirSync(basePath).filter(name => {
  return lstatSync(path.join(basePath, name)).isDirectory();
});

module.exports = {
  ...baseConfig,
  moduleNameMapper: {
    ...packages.reduce(
      (acc, name) => ({
        ...acc,
        [`@metamask-institutional/${name}(.*)$`]: `<rootDir>/packages/../../${name}/src/$1`,
      }),
      {},
    ),
  },
};
