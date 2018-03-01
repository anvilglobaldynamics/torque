const shell = require('shelljs');
const { hashLinks } = require('./hashlinks.js');

const runPolymerBuild = () => {
  let res = shell.exec('polymer build')
  if (res.code !== 0) {
    shell.echo('Error: Git commit failed');
    shell.exit(1);
  }
}

const buildDir = './build/custom-es5-bundled'
runPolymerBuild();
hashLinks(buildDir);