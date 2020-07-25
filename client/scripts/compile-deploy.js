
/*
This tool lets you both compile the client and optionally, directly deploy to live server(s).

arguments - 
  --android = only build for android. The --deploy keyword is not supported in that case.
  --pwa = only build for android.
  --deploy = after compiling, directly deploy to google cloud.
  n/b: if --pwa or --android is not provided then compiles for the base website.
*/

const shell = require('shelljs');
const { hashLinks } = require('./hashlinks');
const { updateBuildNumber } = require('./build-number');
const pathlib = require('path');
const fslib = require('fs');

const runPolymerBuild = () => {
  let res = shell.exec('polymer build --verbose')
  if (res.code !== 0) {
    shell.echo('Error: polymer build failed');
    shell.exit(1);
  }
}

const publishPwa = () => {
  let res = shell.exec('gcloud app deploy app-pwa.yaml --quiet --project anvil-primary');
  if (res.code !== 0) {
    shell.echo('Error: gcloud app deploy app-pwa.yaml --quiet --project anvil-primary failed');
    shell.exit(1);
  }
}

const publishMain = () => {
  let res = shell.exec('gcloud app deploy app-fallback.yaml --quiet --project anvil-primary');
  if (res.code !== 0) {
    shell.echo('Error: gcloud app deploy app-fallback.yaml --quiet --project anvil-primary failed');
    shell.exit(1);
  }
}

const getCommandLineArguments = () => {
  let deploy = false;
  let android = false;
  let pwa = true;
  if (process.argv.indexOf('--fallback') > -1) {
    pwa = false;
  }
  if (process.argv.indexOf('--android') > -1) {
    android = true;
  }
  if (process.argv.indexOf('--deploy') > -1) {
    deploy = true;
  }
  if (android && deploy) {
    shell.echo("Error: both --android and --deploy can not be used together.");
    shell.exit(2);
  }
  return { deploy, android, pwa };
}

const polymerJsonBuildConfig = {
  "custom-es5-bundled": {
    "name": "custom-es5-bundled",
    "js": {
      "minify": true,
      "compile": true
    },
    "css": {
      "minify": true
    },
    "html": {
      "minify": true
    },
    "bundle": {
      "excludes": [],
      "stripComments": true,
      "inlineCss": true,
      "sourcemaps": false
    },
    "addServiceWorker": false,
    "addPushManifest": false,
    "preset": "es5-bundled"
  },
  "custom-es5-android": {
    "basePath": "/android_asset/www/",
    "name": "custom-es5-android",
    "js": {
      "minify": false,
      "compile": true
    },
    "css": {
      "minify": false
    },
    "html": {
      "minify": false
    },
    "bundle": false,
    "addServiceWorker": false,
    "addPushManifest": false
  },
  "custom-es6-service-worker": {
    "name": "custom-es6-service-worker",
    "js": {
      "minify": false,
      "compile": false
    },
    "css": {
      "minify": false
    },
    "html": {
      "minify": false
    },
    "addServiceWorker": true,
    "addPushManifest": true,
    "preset": "es6-unbundled"
  }
}

const readPolymerJson = (polymerJsonPath) => {
  return JSON.parse((fslib.readFileSync(polymerJsonPath, 'utf8')));
}

const writePolymerJson = (polymerJsonPath, data) => {
  return (fslib.writeFileSync(polymerJsonPath, JSON.stringify(data, null, 2), 'utf8'));
}

// region: main =======

const cmdArgs = getCommandLineArguments();
console.log("Arguments:", cmdArgs);

const srcDir = './';
const polymerJsonPath = './polymer.json';
const traditionalBuildDir = './build/custom-es5-bundled';
const progressiveBuildDir = './build/custom-es6-service-worker';
const rootElementPath = 'src/torque-app.html'

const originalPolymerJson = readPolymerJson(polymerJsonPath);
let polymerJson = JSON.parse(JSON.stringify(originalPolymerJson));

let newBuildNumber = updateBuildNumber(srcDir, rootElementPath);

if (cmdArgs.android) {
  polymerJson.builds.push(polymerJsonBuildConfig["custom-es5-android"]);
} else {
  if (cmdArgs.pwa) {
    polymerJson.builds.push(polymerJsonBuildConfig["custom-es6-service-worker"]);
  } else {
    polymerJson.builds.push(polymerJsonBuildConfig["custom-es5-bundled"]);
  }
}
console.log(JSON.stringify(polymerJson, null, 2));
writePolymerJson(polymerJsonPath, polymerJson);
runPolymerBuild();
writePolymerJson(polymerJsonPath, originalPolymerJson);

// Update service worker console log
{
  let p = '/home/larson/Documents/Github/torque/client/build/custom-es6-service-worker/service-worker.js';
  let c = fslib.readFileSync(p, 'utf-8');
  c = c.replace("self.addEventListener('install', function (event) {", `self.addEventListener('install', function (event) { \n console.log('install ${newBuildNumber}');`);
  c = c.replace("self.addEventListener('activate', function (event) {", `self.addEventListener('activate', function (event) { \n console.log('activate ${newBuildNumber}');`);
  fslib.writeFileSync(p, c);
}

if (!cmdArgs.pwa && !cmdArgs.android) {
  hashLinks(traditionalBuildDir);
}

if (cmdArgs.deploy && !cmdArgs.pwa) {
  publishMain();
}

if (cmdArgs.deploy && cmdArgs.pwa) {
  publishPwa();
}
