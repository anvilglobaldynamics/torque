
const shell = require('shelljs');
const { hashLinks } = require('./hashlinks');
const { updateBuildNumber } = require('./build-number');

const runPolymerBuild = () => {
  let res = shell.exec('polymer build')
  if (res.code !== 0) {
    shell.echo('Error: Git commit failed');
    shell.exit(1);
  }
}

const srcDir = './';
const buildDir = './build/custom-es5-bundled';
const rootElementPath = 'src/torque-app.html'

updateBuildNumber(srcDir, rootElementPath);
runPolymerBuild();
hashLinks(buildDir);