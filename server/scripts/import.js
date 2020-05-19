
const fs = require('fs-extra');
const shell = require('shelljs');
const readlineSync = require('readline-sync');

const importRemote = (password) => {
  let command = `mongodump --db torque --host 35.200.184.65:27017 -u torque-admin -p ${password} --authenticationDatabase torque --out ./mongo-temp-import`
  let res = shell.exec(command);
  if (res.code !== 0) {
    shell.echo(`Error: mongodump failed`);
    shell.exit(1);
  }
}

const exportToLocal = () => {
  let command = `mongorestore --db torque-imported --drop ./mongo-temp-import/torque`
  let res = shell.exec(command);
  if (res.code !== 0) {
    shell.echo(`Error: mongorestore failed`);
    shell.exit(1);
  }
}

let password = readlineSync.question('Please enter your password for "torque-admin" mongodb user for "db.lipi.live": ', {
  hideEchoBack: true
});

importRemote(password);
exportToLocal();
console.log('Imported as db: "torque-imported"')
