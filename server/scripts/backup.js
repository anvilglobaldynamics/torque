
const fs = require('fs-extra');
const shell = require('shelljs');
const readlineSync = require('readline-sync');
const os = require('os');
const pathlib = require('path');
const moment = require('moment');

const importRemote = (password, finalPath) => {
  let command = `mongodump --db torque --host 35.244.48.152:27017 -u torque-admin -p ${password} --authenticationDatabase torque --out "${finalPath}"`
  let res = shell.exec(command);
  if (res.code !== 0) {
    shell.echo(`Error: mongodump failed`);
    shell.exit(1);
  }
}

let password = readlineSync.question('Please enter your password for "torque-admin" mongodb user for "db.lipi.live": ', {
  hideEchoBack: true
});

let name = readlineSync.question("Provide a name for the backup: ");

if (!name || name.length === 0) {
  name = "untitled";
  console.log(`No name provided. The name '${name}' will be used.`);
}

let homedir = os.homedir();

let date = moment().format("YYYY MMMM Do, hh mm ss a");

// console.log({ date, homedir, password, name });

let subdir = 'Torque Db Backups';

let filename = date + ' - ' + name;

let finalPath = pathlib.join(homedir, subdir, filename);

console.log("Data will be imported into: \"" + finalPath + "\"");

importRemote(password, finalPath);

