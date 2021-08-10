# WebRTC VATRP

## Release Notes

Detailed release notes are in the docs directory.

## Pre-requisites
* [NodeJS](https://nodejs.org/en/) 
* [Yarn](https://yarnpkg.com/en/)

To initialize, running `yarn` will install the necessary dependencies. This command also needs to be re-run whenever a new dependency is added to package.json. After installation, run `yarn copy-custom` to add custom JSSIP geolocation functionality into the application.

## Building the project
To build the project, you need to first install docker and docker-compose. Usually, if you want to run a new build, just run `docker-compose up`, which will create a dist directory if it does not already exist, and create executables there. If you change the package.json to add new dependencies, run a `docker-compose down` followed by a `docker-compose build` to refresh the dependencies. The first time the build is run on a fresh container, it will download electron-builder dependencies - you can volume mount the cache directories to skip this, but this may cause incompatibilities if you pick up a newer version of electron-builder.

You can also build outside of docker with a `yarn build`, which :should: work on Windows, MacOS, and Linux (though it's only verified on CentOS)

## Running the project

We run the project through yarn scripts. Two terminals are required, one to run the react server and one to start the electron process. In the first terminal, run `yarn start` to start the react server, and in the second terminal `yarn electron-start` to start the electron process

## Useful links

For those new to React, the [concepts guide](https://reactjs.org/docs/hello-world.html) in React's official documentation is a great place to start.

Electron also has an excellent set of [documentation](https://electronjs.org/docs), as well as an informative [electron-api-demos project repository](https://github.com/electron/electron-api-demos) which serves as a useful guide for seeing electron APIs in action.

## Troubleshooting

If `yarn electron-start` is not working (Electron window is not opening), a known bug may be occuring with Electron's roaming appdata. A script to fix this issue has been created and can be run with `yarn fix-electron`

## Project Structure

### .vscode
Contains project-specific settings, including debugging configurations

### config
Contains configuration files for many pieces of infrastructure our code uses including webpack, jest, and general settings

### electronSrc
Contains javascript files related specifically to the electron process including handlers for hardware components like cameras and file access

### public
front-facing files including the index.html, stylesheets and bootstrap-specific files

### reactSrc
Contains react-specific files, including component definitions, workers, env files and services

### scripts
when a yarn script (eg. `yarn start`) needs a javascript portion, that script goes in this directory
