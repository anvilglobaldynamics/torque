
const shell = require('shelljs');
const { hashLinks } = require('./hashlinks');
const { updateBuildNumber } = require('./build-number');
const pathlib = require('path');

const runPolymerBuild = () => {
  let res = shell.exec('polymer build')
  if (res.code !== 0) {
    shell.echo('Error: polymer build failed');
    shell.exit(1);
  }
}

const publishPwa = ()=>{
  let res = shell.exec('gcloud app deploy pwa.yaml --quiet');
  if (res.code !== 0) {
    shell.echo('Error: gcloud app deploy pwa.yaml --quiet failed');
    shell.exit(1);
  }
}

const srcDir = './';
const traditionalBuildDir = './build/custom-es5-bundled';
const progressiveBuildDir = './build/custom-es6-service-worker';
const rootElementPath = 'src/torque-app.html'

updateBuildNumber(srcDir, rootElementPath);
runPolymerBuild();
hashLinks(traditionalBuildDir);
publishPwa();