
const fs = require('fs-extra');
const shell = require('shelljs');

const publish = () => {
  let res = shell.exec('gcloud app deploy --quiet --project anvil-primary');
  if (res.code !== 0) {
    shell.echo('Error: gcloud app deploy --quiet --project anvil-primary failed');
    shell.exit(1);
  }
}

if (!fs.existsSync('./config-production.json')) {
  throw new Error("Could not find config-production.json. Create the file and try again. Make sure it is not committed.");
}
const devConfig = fs.readFileSync('./config.json', 'utf8');
const productionConfig = fs.readFileSync('./config-production.json', 'utf8');
fs.writeFileSync('./config.json', productionConfig, { encoding: 'utf8' });
publish();
fs.writeFileSync('./config.json', devConfig, { encoding: 'utf8' });
console.log("Publish Finished.")