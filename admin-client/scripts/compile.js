
const shell = require('shelljs');
const { hashLinks } = require('./hashlinks');
const { updateBuildNumber } = require('./build-number');

const runPolymerBuild = () => {
  let res = shell.exec('polymer build')
  if (res.code !== 0) {
    shell.echo('Error: polymer build failed');
    shell.exit(1);
  }
}

const publishMain = () => {
  let res = shell.exec('gcloud app deploy app.yaml --quiet --project anvil-primary');
  if (res.code !== 0) {
    shell.echo('Error: gcloud app deploy app.yaml --quiet --project anvil-primary failed');
    shell.exit(1);
  }
}

const srcDir = './';
const buildDir = './build/custom-es5-bundled';
const rootElementPath = 'src/torque-app.html'

updateBuildNumber(srcDir, rootElementPath);
runPolymerBuild();
hashLinks(buildDir);
publishMain();