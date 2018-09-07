/*
This script generates a huge number of bulk data in order to test manually.
*/

const fslib = require('fs-extra');

const phonePrefix = '998';
const commonPassword = '12345678';

const organizationCount = 50;
const employeeCount = {
  min: 0,
  max: 2
};
const warehouse = {
  min: 3,
  max: 20
};
const outlet = {
  min: 3,
  max: 40
};
const productCategoryCount = {
  min: 10,
  max: 100
};
const productCountPerCategory = {
  min: 1,
  max: 1000
};

const getSolidCount = (item) => {
  if (typeof item === 'number') return item;
  return (Math.floor(Math.random() * (item.max - item.min + 1)) + item.min);
}

const _loadDataFragment = (name) => {
  let text = fslib.readFileSync(`./scripts/bulk/${name}.txt`, 'utf8');
  return text.split('\n').filter(line => line.length > 1);
}

const adjectiveList = _loadDataFragment('adjectives');
const nameList = _loadDataFragment('names');
const nounList = _loadDataFragment('nouns');

const pickOne = (list) => {
  return list[Math.floor(Math.random() * list.length)];
}

