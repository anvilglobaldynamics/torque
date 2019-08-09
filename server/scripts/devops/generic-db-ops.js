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

// ====================================== code

const process = async () => {
  await connect(dbConfig);
  let productAcquisitionList = await find('product-acquisition', {});
  console.log(productAcquisitionList)
}

// ====================================== start

const mode = 'dev';
let dbConfig = config(mode);
process();