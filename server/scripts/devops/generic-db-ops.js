// ===== WARNING =====
// This script is not designed to be run by developers.

// ===== NOTE =====
// must be run from /server dir

// ====================================== lib

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const fslib = require('fs');

let db = null;

const config = (mode) => {
  let path = (mode === 'production' ? './config-production.json' : './config.json');
  let config = JSON.parse(fslib.readFileSync(path, 'utf8'));
  return config.db;
}

const connect = async ({ path, name }) => {
  const client = await MongoClient.connect(path);
  db = client.db(name);
}

const find = async (collectionName, query) => {
  let sort = { 'id': -1 };
  return await db.collection(collectionName).find(query).sort(sort).toArray();
}

const updateOne = async (collectionName, query, modifications) => {
  let results = await db.collection(collectionName).updateOne(query, modifications);
  return (results.matchedCount === 1);
}

// ====================================== code

const runCode = async () => {
  await connect(dbConfig);

  // Part 1. Set organizationId
  let productAcquisitionList = await find('product-acquisition', {});

  for (let productAcquisition of productAcquisitionList) {
    if ('organizationId' in productAcquisition) continue;
    let inventory = await find('inventory', { id: productAcquisition.inventoryId });
    await updateOne('product-acquisition', { id: productAcquisition.id }, {
      $set: {
        organizationId: inventory[0].organizationId
      }
    });
    console.log('set organizationId')
  }

  // Part 2. Set vendorId
  for (let productAcquisition of productAcquisitionList) {
    if ('vendorId' in productAcquisition) continue;
    await updateOne('product-acquisition', { id: productAcquisition.id }, {
      $set: {
        vendorId: null
      }
    });
    console.log('set vendorId')
  }

  // Part 3. set productAcquisitionNumber
  let organizationList = await find('organization', {});
  for (let organization of organizationList) {
    let productAcquisitionNumber = 1;
    let productAcquisitionList = await find('product-acquisition', { organizationId: organization.id });
    for (let productAcquisition of productAcquisitionList) {
      await updateOne('product-acquisition', { id: productAcquisition.id }, {
        $set: {
          productAcquisitionNumber
        }
      });
      productAcquisitionNumber += 1;
      console.log({ productAcquisitionNumber });
    }

    await updateOne('auto-generated-organization-specific-number', { organizationId: organization.id }, {
      $set: {
        productAcquisitionNumberSeed: productAcquisitionNumber
      }
    });
  }
}

// ====================================== start

const mode = 'dev';
let dbConfig = config(mode);
runCode()
  .then(() => {
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit();
  });