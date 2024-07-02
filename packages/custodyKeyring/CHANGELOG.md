# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### Dependencies

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @metamask-institutional/sdk bumped from ^0.1.13 to ^0.1.12

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @metamask-institutional/sdk bumped from ^0.1.18 to ^0.1.19

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @metamask-institutional/sdk bumped from ^0.1.19 to ^0.1.20

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @metamask-institutional/sdk bumped from ^0.1.22 to ^0.1.23

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @metamask-institutional/sdk bumped from ^0.1.23 to ^0.1.24

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @metamask-institutional/sdk bumped from ^0.1.24 to ^0.1.25

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @metamask-institutional/sdk bumped from ^0.1.26 to ^0.1.27

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @metamask-institutional/sdk bumped from ^0.1.27 to ^0.1.28

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @metamask-institutional/sdk bumped from ^0.1.29 to ^0.1.30

## [2.0.4](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v2.0.3...custody-keyring-v2.0.4) (2024-07-02)


### Bug Fixes

* **version bump:** manual version bump and clean up ([#762](https://github.com/consensys-vertical-apps/metamask-institutional/issues/762)) ([5135d9c](https://github.com/consensys-vertical-apps/metamask-institutional/commit/5135d9c1def750422e4a8f7718ba1926242695dd))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @metamask-institutional/sdk bumped from ^0.1.30 to ^0.1.31

## [2.0.1](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v2.0.0...custody-keyring-v2.0.1) (2024-05-29)


### Bug Fixes

* **supportedchainids:** better error handling ([#733](https://github.com/consensys-vertical-apps/metamask-institutional/issues/733)) ([3c5f350](https://github.com/consensys-vertical-apps/metamask-institutional/commit/3c5f350e2ef0e9df94ad7c004f4971cc379e13e8))

## [2.0.0](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v1.1.2...custody-keyring-v2.0.0) (2024-05-17)


### ⚠ BREAKING CHANGES

* **configuration api v2:** Configuration API V2 has changed the whole structure for custodians, introducing environments noew

### Features

* **configuration api v2:** updated configClient and custodyKeyring ([#472](https://github.com/consensys-vertical-apps/metamask-institutional/issues/472)) ([504a633](https://github.com/consensys-vertical-apps/metamask-institutional/commit/504a6333a491a841062081211ffa15bae36f4c39))
* **websocketclient transasctionupdate:** initial handshake work ([#670](https://github.com/consensys-vertical-apps/metamask-institutional/issues/670)) ([5cd3bd6](https://github.com/consensys-vertical-apps/metamask-institutional/commit/5cd3bd60e9fd342b4b82c8bb589de8b4a0373c5a))


### Bug Fixes

* **bump version manually:** manually bump version of custody-keyring ([#475](https://github.com/consensys-vertical-apps/metamask-institutional/issues/475)) ([5e79afa](https://github.com/consensys-vertical-apps/metamask-institutional/commit/5e79afa4433cf03aa5c5f00f48fb3d32a579fd62))
* **check null values:** checking null values in signedMEssage and transaction ([#233](https://github.com/consensys-vertical-apps/metamask-institutional/issues/233)) ([3e21fb9](https://github.com/consensys-vertical-apps/metamask-institutional/commit/3e21fb95f764a9ffe6aea1e459737f7cf62408f7))
* **custody-keyring:** get apiUrl from custody type ([#621](https://github.com/consensys-vertical-apps/metamask-institutional/issues/621)) ([0934775](https://github.com/consensys-vertical-apps/metamask-institutional/commit/093477543ebf4866222cd8f0382c968a819fee4b))
* **custodykeyring:** bumps version ([#401](https://github.com/consensys-vertical-apps/metamask-institutional/issues/401)) ([b135a4b](https://github.com/consensys-vertical-apps/metamask-institutional/commit/b135a4bcc793cb39bad69dd2ef30e113fb3a0981))
* **custodykeyring:** the getAccounts method should return a new array of the accounts ([#482](https://github.com/consensys-vertical-apps/metamask-institutional/issues/482)) ([934f370](https://github.com/consensys-vertical-apps/metamask-institutional/commit/934f37001744a6537a1b6f77d134fe67b4e93224))
* **custodykeyring:** we dont want to run the migrations because they are very old ([#448](https://github.com/consensys-vertical-apps/metamask-institutional/issues/448)) ([49cc334](https://github.com/consensys-vertical-apps/metamask-institutional/commit/49cc3340ececf1961e8780ad9b9e8db4636f3b23))
* **fix version:** fixes metamask-institutional/custody-keyring package version ([#630](https://github.com/consensys-vertical-apps/metamask-institutional/issues/630)) ([1c9b225](https://github.com/consensys-vertical-apps/metamask-institutional/commit/1c9b225b15f28cd93b837b98ff2a53a7db535d4b))
* **lint:** lint issues were fixes ([#509](https://github.com/consensys-vertical-apps/metamask-institutional/issues/509)) ([ce5f9af](https://github.com/consensys-vertical-apps/metamask-institutional/commit/ce5f9afaa20d6afad6e81d0d97bc6894055fc00c))
* **lodash:** removes the full lodash package to install only the method needed ([#263](https://github.com/consensys-vertical-apps/metamask-institutional/issues/263)) ([f5c7f4f](https://github.com/consensys-vertical-apps/metamask-institutional/commit/f5c7f4fd23017e8be7e353349dacc72370e33317))
* **manual update:** manual update ([#685](https://github.com/consensys-vertical-apps/metamask-institutional/issues/685)) ([162a0c0](https://github.com/consensys-vertical-apps/metamask-institutional/commit/162a0c03944c2ddc518a109debbfd4086b5ccd51))
* **mmiconfiguration:** fixes the name of mmiconfiguration to start with uppercase letter ([#106](https://github.com/consensys-vertical-apps/metamask-institutional/issues/106)) ([772f9b2](https://github.com/consensys-vertical-apps/metamask-institutional/commit/772f9b28ea4e30279235b8de760e61f9cce88c36))
* **npmignore:** clean up ([#271](https://github.com/consensys-vertical-apps/metamask-institutional/issues/271)) ([a4bbae1](https://github.com/consensys-vertical-apps/metamask-institutional/commit/a4bbae1887ef3cead82b58bd2ec14fbfcd40f662))
* **onboardingurl:** adds the onboardingurl ([#533](https://github.com/consensys-vertical-apps/metamask-institutional/issues/533)) ([f3fa7fc](https://github.com/consensys-vertical-apps/metamask-institutional/commit/f3fa7fcccf112f23184b47989cdf0ea4058cbe98))
* **updates packages:** updates packages to the latest versions ([#278](https://github.com/consensys-vertical-apps/metamask-institutional/issues/278)) ([0dc78c5](https://github.com/consensys-vertical-apps/metamask-institutional/commit/0dc78c5321d8b686320a7d83bd45eae93fefb36a))
* **version bump:** version increase ([#348](https://github.com/consensys-vertical-apps/metamask-institutional/issues/348)) ([d03ae80](https://github.com/consensys-vertical-apps/metamask-institutional/commit/d03ae80c61a6dafc93b76bb3855f0f8edca038b3))

## [1.1.0](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v1.0.12...custody-keyring-v1.1.0) (2024-04-17)


### Features

* **websocketclient transasctionupdate:** initial handshake work ([#670](https://github.com/consensys-vertical-apps/metamask-institutional/issues/670)) ([5cd3bd6](https://github.com/consensys-vertical-apps/metamask-institutional/commit/5cd3bd60e9fd342b4b82c8bb589de8b4a0373c5a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @metamask-institutional/sdk bumped from ^0.1.25 to ^0.1.26
    * @metamask-institutional/types bumped from ^1.0.4 to ^1.1.0

## [1.0.12](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v1.0.11...custody-keyring-v1.0.12) (2024-04-05)


### Bug Fixes

* **manual update:** manual update ([#685](https://github.com/consensys-vertical-apps/metamask-institutional/issues/685)) ([162a0c0](https://github.com/consensys-vertical-apps/metamask-institutional/commit/162a0c03944c2ddc518a109debbfd4086b5ccd51))

## [1.0.10](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v1.0.9...custody-keyring-v1.0.10) (2024-02-13)


### Bug Fixes

* **fix version:** fixes metamask-institutional/custody-keyring package version ([#630](https://github.com/consensys-vertical-apps/metamask-institutional/issues/630)) ([1c9b225](https://github.com/consensys-vertical-apps/metamask-institutional/commit/1c9b225b15f28cd93b837b98ff2a53a7db535d4b))

## [1.0.9](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v1.0.8...custody-keyring-v1.0.9) (2024-02-08)


### Bug Fixes

* **custody-keyring:** get apiUrl from custody type ([#621](https://github.com/consensys-vertical-apps/metamask-institutional/issues/621)) ([0934775](https://github.com/consensys-vertical-apps/metamask-institutional/commit/093477543ebf4866222cd8f0382c968a819fee4b))

## [1.0.6](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v1.0.5...custody-keyring-v1.0.6) (2023-11-07)


### Bug Fixes

* **onboardingurl:** adds the onboardingurl ([#533](https://github.com/consensys-vertical-apps/metamask-institutional/issues/533)) ([f3fa7fc](https://github.com/consensys-vertical-apps/metamask-institutional/commit/f3fa7fcccf112f23184b47989cdf0ea4058cbe98))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @metamask-institutional/sdk bumped from ^0.1.21 to ^0.1.22
    * @metamask-institutional/types bumped from ^1.0.3 to ^1.0.4

## [1.0.5](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v1.0.4...custody-keyring-v1.0.5) (2023-10-20)


### Bug Fixes

* **lint:** lint issues were fixes ([#509](https://github.com/consensys-vertical-apps/metamask-institutional/issues/509)) ([ce5f9af](https://github.com/consensys-vertical-apps/metamask-institutional/commit/ce5f9afaa20d6afad6e81d0d97bc6894055fc00c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @metamask-institutional/configuration-client bumped from ^2.0.0 to ^2.0.1
    * @metamask-institutional/sdk bumped from ^0.1.20 to ^0.1.21

## [1.0.2](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v1.0.1...custody-keyring-v1.0.2) (2023-09-21)


### Bug Fixes

* **custodykeyring:** the getAccounts method should return a new array of the accounts ([#482](https://github.com/consensys-vertical-apps/metamask-institutional/issues/482)) ([934f370](https://github.com/consensys-vertical-apps/metamask-institutional/commit/934f37001744a6537a1b6f77d134fe67b4e93224))

## [1.0.1](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v1.0.0...custody-keyring-v1.0.1) (2023-09-18)


### Bug Fixes

* **bump version manually:** manually bump version of custody-keyring ([#475](https://github.com/consensys-vertical-apps/metamask-institutional/issues/475)) ([5e79afa](https://github.com/consensys-vertical-apps/metamask-institutional/commit/5e79afa4433cf03aa5c5f00f48fb3d32a579fd62))

## [1.0.0](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v0.0.27...custody-keyring-v1.0.0) (2023-09-18)


### ⚠ BREAKING CHANGES

* **configuration api v2:** Configuration API V2 has changed the whole structure for custodians, introducing environments noew

### Features

* **configuration api v2:** updated configClient and custodyKeyring ([#472](https://github.com/consensys-vertical-apps/metamask-institutional/issues/472)) ([504a633](https://github.com/consensys-vertical-apps/metamask-institutional/commit/504a6333a491a841062081211ffa15bae36f4c39))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @metamask-institutional/configuration-client bumped from ^1.0.6 to ^2.0.0

## [0.0.27](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v0.0.26...custody-keyring-v0.0.27) (2023-08-21)


### Bug Fixes

* **custodykeyring:** we dont want to run the migrations because they are very old ([#448](https://github.com/consensys-vertical-apps/metamask-institutional/issues/448)) ([49cc334](https://github.com/consensys-vertical-apps/metamask-institutional/commit/49cc3340ececf1961e8780ad9b9e8db4636f3b23))

## [0.0.26](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v0.0.25...custody-keyring-v0.0.26) (2023-07-19)


### Bug Fixes

* **custodykeyring:** bumps version ([#401](https://github.com/consensys-vertical-apps/metamask-institutional/issues/401)) ([b135a4b](https://github.com/consensys-vertical-apps/metamask-institutional/commit/b135a4bcc793cb39bad69dd2ef30e113fb3a0981))

## [0.0.25](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v0.0.24...custody-keyring-v0.0.25) (2023-06-27)


### Bug Fixes

* **version bump:** version increase ([#348](https://github.com/consensys-vertical-apps/metamask-institutional/issues/348)) ([d03ae80](https://github.com/consensys-vertical-apps/metamask-institutional/commit/d03ae80c61a6dafc93b76bb3855f0f8edca038b3))

## [0.0.24](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v0.0.23...custody-keyring-v0.0.24) (2023-05-25)


### Bug Fixes

* **check null values:** checking null values in signedMEssage and transaction ([#233](https://github.com/consensys-vertical-apps/metamask-institutional/issues/233)) ([3e21fb9](https://github.com/consensys-vertical-apps/metamask-institutional/commit/3e21fb95f764a9ffe6aea1e459737f7cf62408f7))
* **lodash:** removes the full lodash package to install only the method needed ([#263](https://github.com/consensys-vertical-apps/metamask-institutional/issues/263)) ([f5c7f4f](https://github.com/consensys-vertical-apps/metamask-institutional/commit/f5c7f4fd23017e8be7e353349dacc72370e33317))
* **mmiconfiguration:** fixes the name of mmiconfiguration to start with uppercase letter ([#106](https://github.com/consensys-vertical-apps/metamask-institutional/issues/106)) ([772f9b2](https://github.com/consensys-vertical-apps/metamask-institutional/commit/772f9b28ea4e30279235b8de760e61f9cce88c36))
* **npmignore:** clean up ([#271](https://github.com/consensys-vertical-apps/metamask-institutional/issues/271)) ([a4bbae1](https://github.com/consensys-vertical-apps/metamask-institutional/commit/a4bbae1887ef3cead82b58bd2ec14fbfcd40f662))
* **updates packages:** updates packages to the latest versions ([#278](https://github.com/consensys-vertical-apps/metamask-institutional/issues/278)) ([0dc78c5](https://github.com/consensys-vertical-apps/metamask-institutional/commit/0dc78c5321d8b686320a7d83bd45eae93fefb36a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @metamask-institutional/sdk bumped from ^0.1.15 to ^0.1.18
    * @metamask-institutional/types bumped from ^1.0.2 to ^1.0.3

## [0.0.23](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v0.0.21...custody-keyring-v0.0.23) (2023-05-17)


### Bug Fixes

* **updates packages:** updates packages to the latest versions ([#278](https://github.com/consensys-vertical-apps/metamask-institutional/issues/278)) ([0dc78c5](https://github.com/consensys-vertical-apps/metamask-institutional/commit/0dc78c5321d8b686320a7d83bd45eae93fefb36a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @metamask-institutional/sdk bumped from ^0.1.16 to ^0.1.15

## [0.0.21](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v0.0.20...custody-keyring-v0.0.21) (2023-05-15)


### Bug Fixes

* **npmignore:** clean up ([#271](https://github.com/consensys-vertical-apps/metamask-institutional/issues/271)) ([a4bbae1](https://github.com/consensys-vertical-apps/metamask-institutional/commit/a4bbae1887ef3cead82b58bd2ec14fbfcd40f662))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @metamask-institutional/configuration-client bumped from ^1.0.5 to ^1.0.6
    * @metamask-institutional/sdk bumped from ^0.1.13 to ^0.1.14

## [0.0.20](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v0.0.19...custody-keyring-v0.0.20) (2023-05-13)


### Bug Fixes

* **lodash:** removes the full lodash package to install only the method needed ([#263](https://github.com/consensys-vertical-apps/metamask-institutional/issues/263)) ([f5c7f4f](https://github.com/consensys-vertical-apps/metamask-institutional/commit/f5c7f4fd23017e8be7e353349dacc72370e33317))

## [0.0.19](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v0.0.18...custody-keyring-v0.0.19) (2023-04-20)


### Bug Fixes

* **check null values:** checking null values in signedMEssage and transaction ([#233](https://github.com/consensys-vertical-apps/metamask-institutional/issues/233)) ([3e21fb9](https://github.com/consensys-vertical-apps/metamask-institutional/commit/3e21fb95f764a9ffe6aea1e459737f7cf62408f7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @metamask-institutional/configuration-client bumped from ^1.0.4 to ^1.0.5
    * @metamask-institutional/sdk bumped from ^0.1.12 to ^0.1.13

## [0.0.17](https://github.com/consensys-vertical-apps/metamask-institutional/compare/custody-keyring-v0.0.16...custody-keyring-v0.0.17) (2023-02-02)

### Bug Fixes

- **mmiconfiguration:** fixes the name of mmiconfiguration to start with uppercase letter ([#106](https://github.com/consensys-vertical-apps/metamask-institutional/issues/106)) ([772f9b2](https://github.com/consensys-vertical-apps/metamask-institutional/commit/772f9b28ea4e30279235b8de760e61f9cce88c36))

## [0.0.15](https://github.com/consensys-vertical-apps/metamask-institutional/compare/@metamask-institutional/custody-keyring@0.0.10...@metamask-institutional/custody-keyring@0.0.15) (2023-02-02)

**Note:** Version bump only for package @metamask-institutional/custody-keyring

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @metamask-institutional/configuration-client bumped from ^0.1.8 to ^1.0.0

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @metamask-institutional/configuration-client bumped from ^1.0.0 to ^1.0.1

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @metamask-institutional/configuration-client bumped from ^1.0.1 to ^1.0.2

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @metamask-institutional/configuration-client bumped from ^1.0.2 to ^1.0.3

## [0.0.10](https://github.com/consensys-vertical-apps/metamask-institutional/compare/@metamask-institutional/custody-keyring@0.0.8...@metamask-institutional/custody-keyring@0.0.10) (2023-02-01)

**Note:** Version bump only for package @metamask-institutional/custody-keyring

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @metamask-institutional/sdk bumped from ^0.1.10 to ^0.1.11
    - @metamask-institutional/types bumped from ^0.1.28 to ^1.0.0

## [0.0.8](https://github.com/consensys-vertical-apps/metamask-institutional/compare/@metamask-institutional/custody-keyring@0.0.7...@metamask-institutional/custody-keyring@0.0.8) (2023-01-31)

**Note:** Version bump only for package @metamask-institutional/custody-keyring

## [0.0.7](https://github.com/consensys-vertical-apps/metamask-institutional/compare/@metamask-institutional/custody-keyring@0.0.6...@metamask-institutional/custody-keyring@0.0.7) (2023-01-27)

**Note:** Version bump only for package @metamask-institutional/custody-keyring

## [0.0.6](https://github.com/consensys-vertical-apps/metamask-institutional/compare/@metamask-institutional/custody-keyring@0.0.5...@metamask-institutional/custody-keyring@0.0.6) (2023-01-26)

**Note:** Version bump only for package @metamask-institutional/custody-keyring

## [0.0.5](https://github.com/consensys-vertical-apps/metamask-institutional/compare/@metamask-institutional/custody-keyring@0.0.4...@metamask-institutional/custody-keyring@0.0.5) (2023-01-25)

**Note:** Version bump only for package @metamask-institutional/custody-keyring

## [0.0.4](https://github.com/consensys-vertical-apps/metamask-institutional/compare/@metamask-institutional/custody-keyring@0.0.3...@metamask-institutional/custody-keyring@0.0.4) (2023-01-25)

**Note:** Version bump only for package @metamask-institutional/custody-keyring

## [0.0.3](https://github.com/consensys-vertical-apps/metamask-institutional/compare/@metamask-institutional/custody-keyring@0.0.2...@metamask-institutional/custody-keyring@0.0.3) (2023-01-24)

**Note:** Version bump only for package @metamask-institutional/custody-keyring

## 0.0.2 (2023-01-24)

**Note:** Version bump only for package @metamask-institutional/custody-keyring
