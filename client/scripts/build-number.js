
const fs = require('fs');
const path = require('path');

exports.updateBuildNumber = (rootDir, filePath) => {

  let absolutePath = path.join(rootDir, filePath);

  let contents = fs.readFileSync(absolutePath, 'utf8');

  let str = '<span id="build-number">'
  let index1 = contents.indexOf(str);
  let index2 = contents.indexOf('</span>');

  let left = contents.substr(index1, str.length);
  let middle = contents.substring(index1 + str.length, index2);
  let right = contents.substr(index2);

  let foundNumber = middle;
  console.log("PREVIOUS BUILD NUMBER", foundNumber);

  let newNumber = parseInt(foundNumber) + 1;
  console.log("NEW BUILD NUMBER", newNumber);

  let modifiedContents = left + newNumber + right;

  fs.writeFileSync(absolutePath, modifiedContents);
}