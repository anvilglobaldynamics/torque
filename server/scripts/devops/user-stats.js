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

const insert = async (collectionName, doc) => {
  let results = await db.collection(collectionName).insert(doc);
  return results;
}

// ====================================== code

const runCode = async () => {
  await connect(dbConfig);

  // let collectionName = 'api-call-log';
  // let list = await db.collection(collectionName).aggregate([
  //   { $match: { apiPath: '/api/lite-user-register' } },
  //   { "$group": { _id: "$ip", count: { $sum: 1 } } }
  // ]).sort({ count: -1 }).toArray();
  // console.log(list)

  let startDate = new Date('2019-10-01');
  let endDate = new Date('2019-11-30');

  let dateCount = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

  console.log(dateCount)

  for (let i = 0; i <= dateCount; i++) {
    let date = new Date(startDate.getTime());
    date.setDate(date.getDate() + i);

    let dateString = date.toISOString().replace('T00:00:00.000Z', '');
    let dateWithEndTime = new Date(date.toISOString().replace('T00:00:00.000Z', 'T23:59:59.000Z'));

    // console.log(dateString)
    // console.log(dateWithEndTime)

    let collectionName = 'sales';
    let dauCount = (await db.collection(collectionName).aggregate([
      {
        $match: {
          originApp: 'torque-lite',
          createdDatetimeStamp: {
            $gte: date.getTime(),
            $lte: dateWithEndTime.getTime()
          }
        }
      },
      { "$group": { _id: "$outletId", count: { $sum: 1 } } }
    ]).sort({ count: -1 }).toArray()).length;

     collectionName = 'sales';
    let salesCount = (await db.collection(collectionName).aggregate([
      {
        $match: {
          originApp: 'torque-lite',
          createdDatetimeStamp: {
            $gte: date.getTime(),
            $lte: dateWithEndTime.getTime()
          }
        }
      },
      // { "$group": { _id: "$", count: { $sum: 1 } } }
    ]).sort({ count: -1 }).toArray()).length;


    let str = `"${dateString}",${dauCount},${salesCount}`;
    console.log(str)

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