/*
This script generates a huge number of bulk data in order to test manually.
*/

const fslib = require('fs-extra');

const phonePrefix = '998';
const commonPassword = '12345678';

const organizationCount = 4;
const employeeCount = {
  min: 0,
  max: 2
};
const warehouseCount = {
  min: 3,
  max: 20
};
const outletCount = {
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

const createUser = async () => {
  console.log('should create user');
}

const createOrganization = async () => {
  console.log('should create organization');
}

const createProductCategory = async () => {
  console.log('should create productCategory');
}

const createWarehouse = async () => {
  console.log('should create warehouse');
}

const createOutlet = async () => {
  console.log('should create outlet');
}

const createProduct = async () => {
  console.log('should create product');
}

const generateBulkData = async () => {
  let owner = await createUser();

  for (let i = 0; i < getSolidCount(organizationCount); i++) {
    let organization = await createOrganization();

    for (let i = 0; i < getSolidCount(employeeCount); i++) {
      let employee = await createOrganization();
    }

    for (let i = 0; i < getSolidCount(warehouseCount); i++) {
      let warehouse = await createWarehouse();
    }

    for (let i = 0; i < getSolidCount(outletCount); i++) {
      let outlet = await createOutlet();
    }

    for (let i = 0; i < getSolidCount(productCategoryCount); i++) {
      let productCategory = await createProductCategory();
    }

  }

}

generateBulkData();

