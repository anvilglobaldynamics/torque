/*
This script generates a huge number of bulk data in order to test manually.
*/

const fslib = require('fs-extra');

let { rnd } = require('../test/lib');

const toTitleCase = (str) => {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(' ');
};

// --------------------------------------------------------------

const phonePrefix = '+800';
const emailPrefix = 'mail';
const commonPassword = 'johndoe1pass';

// --------------------------------------------------------------

// NOTE Variable style 
// const organizationCount = 1;
// const employeeCount = {
//   min: 0,
//   max: 20
// };
// const warehouseCount = {
//   min: 3,
//   max: 20
// };
// const outletCount = {
//   min: 3,
//   max: 40
// };
// const productBlueprintCount = {
//   min: 5,
//   max: 200
// };
// const serviceBlueprintCount = {
//   min: 5,
//   max: 200
// };
// const productCountPerBlueprint = {
//   min: 1,
//   max: 1000
// };
// const salesCountPerOutlet = {
//   min: 1,
//   max: 10
// };
// const customerCount = {
//   min: 20,
//   max: 100
// };

const getSolidCount = (item) => {
  if (typeof item === 'number') return item;
  return (Math.floor(Math.random() * (item.max - item.min + 1)) + item.min);
}

// --------------------------------------------------------------

const _loadDataFragment = (name) => {
  let text = fslib.readFileSync(`./scripts/bulk/${name}.txt`, 'utf8');
  return text
    .split('\n')
    .filter(line => line.length > 1)
    .map(line => line.replace('\r', ''))
    .map(line => toTitleCase(line));
}

const adjectiveList = _loadDataFragment('adjectives');
const nameList = _loadDataFragment('names');
const nounList = _loadDataFragment('nouns');

const pickOne = (list) => {
  return list[Math.floor(Math.random() * list.length)];
}

// --------------------------------------------------------------

let phoneNumberCount = 0;
const makePhoneNumber = () => {
  phoneNumberCount += 1;
  return rnd(phonePrefix, 11);
}

let emailIdCount = 0;
const makeEmailId = () => {
  emailIdCount += 1;
  return `${rnd(emailPrefix)}@gmail.com`;
}

let uid = 0;

// --------------------------------------------------------------

let request = require('request');

let genUrl = exports.genUrl = (path) => {
  // return "https://single-server.lipi.live/" + path;
  return "http://localhost:8540/" + path;
}

_callApi = (...args) => {
  args[0] = genUrl(args[0]);
  request.post(...args);
}

let apiCallMetrics = {};

const callApi = async (path, data) => {
  if (!(path in apiCallMetrics)) apiCallMetrics[path] = { timesCalled: 0 };
  apiCallMetrics[path].timesCalled += 1;
  return await new Promise((accept, reject) => {
    _callApi(path, { json: data }, (err, response, body) => {
      if (err) return reject(err);
      if (response.statusCode !== 200) {
        console.log(body);
        return reject(new Error('Non ok status code'));
      }
      if (body.hasError) {
        console.log(body.error);
        return reject(new Error('Response has error'));
      }
      return accept(body);
    });
  });
}

const printApiCallMetrics = (apiCallMetrics) => {
  console.log("================================================");
  console.log("API Call Metrics");
  console.log("================================================");
  for (let path in apiCallMetrics) {
    console.log(path, apiCallMetrics[path].timesCalled);
  }
}

const getApiCallMetrics = () => { return apiCallMetrics };

const createUser = async ({ phone }) => {
  console.log('should create user', phone, commonPassword);
  let { userId } = data = await callApi('api/user-register', {
    phone,
    password: commonPassword,
    fullName: pickOne(nameList),
    hasAgreedToToc: true
  });
  let { apiKey } = await callApi('api/user-login', {
    emailOrPhone: phone,
    password: commonPassword
  });

  return { apiKey, userId };
}

const createOrganization = async ({ apiKey }) => {
  console.log('should create organization');

  let { organizationId } = await callApi('api/add-organization', {
    apiKey,
    name: (pickOne(adjectiveList) + ' Company ' + (uid++)),
    primaryBusinessAddress: 'ADDRESS GOES HERE',
    phone: makePhoneNumber(),
    email: makeEmailId()
  });

  let adminApiKey = (await callApi('api/admin-login', {
    username: 'default',
    password: commonPassword
  })).apiKey;

  await callApi('api/admin-assign-package-to-organization', {
    apiKey: adminApiKey,
    organizationId,
    packageCode: "R-U01",
    paymentReference: "buk-stress"
  })

  // let packageActivationId = await db.packageActivation.create({ packageCode: 'R-U01', organizationId, createdByAdminName: 'default', paymentReference: 'n/aaaa' });
  // let result = await db.organization.setPackageActivationId({ id: organizationId }, { packageActivationId });

  return { organizationId };
}

const createProductBlueprint = async ({ apiKey, organizationId, i }) => {
  console.log('should create productBlueprint', i);

  let { productBlueprintId } = await callApi('api/add-product-blueprint', {
    apiKey,
    organizationId,
    name: pickOne(nounList) + " Product Blueprint " + (uid++),
    unit: "kg",
    defaultPurchasePrice: 120,
    identifierCode: '',
    defaultVat: 15,
    defaultSalePrice: 190,
    isReturnable: true
  });

  return { productBlueprintId };
}

const createServiceBlueprint = async ({ apiKey, organizationId, i }) => {
  console.log('should create serviceBlueprint', i);

  let { serviceBlueprintId } = await callApi('api/add-service-blueprint', {
    apiKey,
    organizationId,
    name: pickOne(nounList) + " Service Blueprint " + (uid++),
    defaultVat: 15,
    defaultSalePrice: 250,
    isLongstanding: false,
    serviceDuration: null,
    isEmployeeAssignable: true,
    isCustomerRequired: true,
    isRefundable: true,
    avtivateInAllOutlets: true
  });

  return { serviceBlueprintId };
}

const createWarehouse = async ({ apiKey, organizationId, i }) => {
  console.log('should create warehouse', i);

  let { warehouseId } = await callApi('api/add-warehouse', {
    apiKey,
    organizationId,
    name: pickOne(nounList) + " Warehouse " + (uid++),
    physicalAddress: 'Really not important',
    phone: makePhoneNumber(),
    contactPersonName: pickOne(nameList)
  });

  let body = await callApi('api/get-warehouse', {
    apiKey,
    warehouseId
  });
  let warehouseDefaultInventoryId = body.defaultInventory.id;

  return { warehouseId, warehouseDefaultInventoryId };
}

const createCustomer = async ({ apiKey, organizationId, i }) => {
  console.log('should create customer', i);

  let { customerId } = await callApi('api/add-customer', {
    apiKey,
    organizationId,
    fullName: pickOne(nameList),
    phone: makePhoneNumber(),
    email: makeEmailId(),
    address: pickOne(nameList)
  });

  return { customerId };
}

const createOutlet = async ({ apiKey, organizationId, i }) => {
  console.log('should create outlet', i);

  let { outletId } = await callApi('api/add-outlet', {
    apiKey,
    organizationId,
    name: pickOne(nounList) + " Outlet " + (uid++),
    physicalAddress: 'Really not important',
    phone: makePhoneNumber(),
    contactPersonName: pickOne(nameList),
    location: { lat: 23.7945153, lng: 90.4139857 },
    categoryCode: 'CAT_GENERAL'
  });

  let body = await callApi('api/get-outlet', {
    apiKey,
    outletId
  });
  let outletDefaultInventoryId = body.defaultInventory.id;

  return { outletId, outletDefaultInventoryId };
}

const createEmployee = async ({ apiKey, organizationId, i }) => {
  console.log('should create employee', i);

  let { employeeId } = await callApi('api/add-new-employee', {
    apiKey,

    fullName: pickOne(nameList),
    phone: makePhoneNumber(),
    password: commonPassword,

    organizationId,
    role: "Untitled Role",
    designation: "Untitled Designation",
    companyProvidedId: "No ID",

    privileges: {
      PRIV_VIEW_USERS: true,
      PRIV_MODIFY_USERS: true,

      PRIV_ACCESS_POS: true,
      PRIV_VIEW_SALES: true,
      PRIV_MODIFY_SALES: true,
      PRIV_ALLOW_FLAT_DISCOUNT: true,
      PRIV_VIEW_PURCHASE_PRICE: true,

      PRIV_MODIFY_DISCOUNT_PRESETS: true,

      PRIV_VIEW_SALES_RETURN: true,
      PRIV_MODIFY_SALES_RETURN: true,

      PRIV_VIEW_ALL_INVENTORIES: true,
      PRIV_VIEW_ALL_SERVICES: true,
      PRIV_MODIFY_ALL_PRODUCT_BLUEPRINTS: true,
      PRIV_MODIFY_ALL_SERVICE_BLUEPRINTS: true,
      PRIV_VIEW_ALL_SERVICE_BLUEPRINTS: true,
      PRIV_VIEW_ALL_PRODUCT_BLUEPRINTS: true,
      PRIV_TRANSFER_ALL_INVENTORIES: true,
      PRIV_ADD_PRODUCTS_TO_ALL_INVENTORIES: true,
      PRIV_MODIFY_ALL_SERVICES_AVAILABILITY_IN_ALL_OUTLETS: true,

      PRIV_VIEW_ALL_SERVICE_MEMBERSHIPS: true,
      PRIV_MODIFY_ALL_SERVICE_MEMBERSHIPS: true,

      PRIV_VIEW_ALL_OUTLETS: true,
      PRIV_MODIFY_ALL_OUTLETS: true,

      PRIV_VIEW_ALL_WAREHOUSES: true,
      PRIV_MODIFY_ALL_WAREHOUSES: true,

      PRIV_VIEW_ORGANIZATION_STATISTICS: true,
      PRIV_MODIFY_ORGANIZATION: true,

      PRIV_VIEW_CUSTOMER: true,
      PRIV_MODIFY_CUSTOMER: true,
      PRIV_MANAGE_CUSTOMER_WALLET_BALANCE: true
    }
  });

  return { employeeId };
}

const createOutletProduct = async ({ apiKey, organizationId, outletId, productBlueprintId, outletDefaultInventoryId, count, i }) => {
  console.log('should add product to outlet', i);

  let results = await callApi('api/add-product-to-inventory', {
    apiKey,
    inventoryId: outletDefaultInventoryId,
    productList: [
      { productBlueprintId, purchasePrice: 100, salePrice: 200, count }
    ]
  });

  return { productId: results.insertedProductList[0].productId };
}

const createWarehouseProduct = async ({ apiKey, organizationId, warehouseId, productBlueprintId, warehouseDefaultInventoryId, count, i }) => {
  console.log('should add product to warehouse', i);

  let results = await callApi('api/add-product-to-inventory', {
    apiKey,
    inventoryId: warehouseDefaultInventoryId,
    productList: [
      { productBlueprintId, purchasePrice: 100, salePrice: 200, count }
    ]
  });

  return { productId: results.insertedProductList[0].productId };
}

const createSales = async ({ apiKey, outletId, productList, i }) => {
  console.log('should create sales', i);

  productList.forEach(product => {
    product.salePrice = 200
    product.vatPercentage = 5;
  });

  let { salesId } = await callApi('api/add-sales', {
    apiKey,

    outletId,
    customerId: null,

    productsSelectedFromWarehouseId: null,
    productList,
    serviceList: [],

    serviceList: [],

    payment: {
      totalAmount: 0,
      vatAmount: 0,
      discountPresetId: null,
      discountType: 'fixed',
      discountValue: 0,
      discountedAmount: 0,
      serviceChargeAmount: 0,
      totalBilled: 0,
      paidAmount: 1000000000,
      changeAmount: 0,
      shouldSaveChangeInAccount: false,
      paymentMethod: 'cash'
    },

    assistedByEmployeeId: null,

    wasOfflineSale: false
  });

  return { salesId };
}

// --------------------------------------------------------------

const generateBulkData = async (params) => {

  let {
    organizationCount,
    employeeCount,
    warehouseCount,
    outletCount,
    productBlueprintCount,
    serviceBlueprintCount,
    productCountPerBlueprint,
    salesCountPerOutlet,
    customerCount
  } = params;

  // let { Program } = require('./../src/index');
  // let mainProgram = new Program({ allowUnsafeApis: false, muteLogger: true });
  // await mainProgram.initiateServer();
  // let db = mainProgram.exposeDatabaseForTesting();

  let primaryUserPhone = makePhoneNumber();
  let { userId: ownerUserId, apiKey } = await createUser({ phone: primaryUserPhone });

  let reusables = {
    outletList: [],
    productList: [],
    organizationId: null
  }

  for (let i = 0; i < getSolidCount(organizationCount); i++) {
    let { organizationId } = await createOrganization({ apiKey });
    reusables.organizationId = organizationId;

    for (let i = 0; i < getSolidCount(employeeCount); i++) {
      let { employeeId } = await createEmployee({ apiKey, organizationId, i });
    }

    let warehouseList = [];
    for (let i = 0; i < getSolidCount(warehouseCount); i++) {
      let { warehouseId, warehouseDefaultInventoryId } = await createWarehouse({ apiKey, organizationId, i });
      warehouseList.push({ warehouseId, warehouseDefaultInventoryId });
    }

    let outletList = [];
    for (let i = 0; i < getSolidCount(outletCount); i++) {
      let { outletId, outletDefaultInventoryId } = await createOutlet({ apiKey, organizationId, i });
      outletList.push({ outletId, outletDefaultInventoryId });
      reusables.outletList.push({ outletId, outletDefaultInventoryId })
    }

    let productBlueprintIdList = [];
    for (let i = 0; i < getSolidCount(productBlueprintCount); i++) {
      let { productBlueprintId } = await createProductBlueprint({ apiKey, organizationId, i });
      productBlueprintIdList.push(productBlueprintId);
    }

    let serviceBlueprintIdList = [];
    for (let i = 0; i < getSolidCount(serviceBlueprintCount); i++) {
      let { serviceBlueprintId } = await createServiceBlueprint({ apiKey, organizationId, i });
      serviceBlueprintIdList.push(serviceBlueprintId);
    }

    let iA = 0;
    for (let warehouse of warehouseList) {
      let { warehouseId, warehouseDefaultInventoryId } = warehouse;
      for (let productBlueprintId of productBlueprintIdList) {
        iA += 1;
        let count = getSolidCount(productCountPerBlueprint);
        await createWarehouseProduct({ apiKey, organizationId, warehouseId, productBlueprintId, warehouseDefaultInventoryId, count, i: iA });
      }
    }

    let iB = 0;
    for (let outlet of outletList) {
      let { outletId, outletDefaultInventoryId } = outlet;
      let productList = [];
      for (let productBlueprintId of productBlueprintIdList) {
        iB += 1;
        let count = getSolidCount(productCountPerBlueprint);
        let { productId } = await createOutletProduct({ apiKey, organizationId, outletId, productBlueprintId, outletDefaultInventoryId, count, i: iB });
        productList.push({ productId, count });
        if (outletList[0].outletId === outlet.outletId) {
          reusables.productList.push({ productId, count });
        }
      }
      // add sales -
      for (let i = 0; i < getSolidCount(salesCountPerOutlet); i++) {
        if (productList.length === 0) break;
        // let amount = getSolidCount({ min: 1, max: Math.min(productList.length, 5) });
        let amount = 1;
        if (productList.length === 0) break;
        let sellingProductList = [];
        do {
          if (productList.length === 0) break;
          let product = productList[0];
          sellingProductList.push({ productId: product.productId, count: 1 });
        } while (amount--);
        let { salesId } = await createSales({ apiKey, outletId, productList: sellingProductList, i });
      }
    }

    for (let i = 0; i < getSolidCount(customerCount); i++) {
      let { customerId } = await createCustomer({ apiKey, organizationId, i });
    }

  }

  console.log('Done. Primary User and Pass', primaryUserPhone, commonPassword);

  // process.exit(0);
  return { apiKey, primaryUserPhone, commonPassword, reusables, ownerUserId }
}

exports.generateBulkData = generateBulkData;
exports.createSales = createSales;
exports.createOutletProduct = createOutletProduct;
exports.createEmployee = createEmployee;
exports.createOutlet = createOutlet;
exports.callApi = callApi;
exports.printApiCallMetrics = printApiCallMetrics;
exports.getApiCallMetrics = getApiCallMetrics;