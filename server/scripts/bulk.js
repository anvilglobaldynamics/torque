/*
This script generates a huge number of bulk data in order to test manually.
*/

const fslib = require('fs-extra');

let { rnd } = require('../test/lib');

// --------------------------------------------------------------

const phonePrefix = '+800';
const emailPrefix = 'mail';
const commonPassword = 'johndoe1pass';

// --------------------------------------------------------------

const organizationCount = 1;
const employeeCount = {
  min: 0,
  max: 20
};
const warehouseCount = {
  min: 3,
  max: 20
};
const outletCount = {
  min: 3,
  max: 40
};
const productBlueprintCount = {
  min: 5,
  max: 200
};
const serviceBlueprintCount = {
  min: 5,
  max: 200
};
const productCountPerBlueprint = {
  min: 1,
  max: 1000
};
const salesCountPerOutlet = {
  min: 1,
  max: 10
};

const getSolidCount = (item) => {
  if (typeof item === 'number') return item;
  return (Math.floor(Math.random() * (item.max - item.min + 1)) + item.min);
}

// --------------------------------------------------------------

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

const utils = require('./../test/utils.js');

let callApi = async (path, data) => {
  return await new Promise((accept, reject) => {
    utils.callApi(path, { json: data }, (err, response, body) => {
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

const createUser = async ({ phone }) => {
  console.log('should create user', phone, commonPassword);
  let { userId } = data = await callApi('api/user-register', {
    phone,
    password: commonPassword,
    fullName: pickOne(nameList)
  });
  let { apiKey } = await callApi('api/user-login', {
    emailOrPhone: phone,
    password: commonPassword
  });

  return { apiKey, userId };
}

const createOrganization = async ({ apiKey }, db) => {
  console.log('should create organization');

  let { organizationId } = await callApi('api/add-organization', {
    apiKey,
    name: (pickOne(adjectiveList) + ' Company ' + (uid++)),
    primaryBusinessAddress: 'ADDRESS GOES HERE',
    phone: makePhoneNumber(),
    email: makeEmailId()
  });
  let packageActivationId = await db.packageActivation.create({ packageCode: 'U01', organizationId, createdByAdminName: 'default', paymentReference: 'n/aaaa' });
  let result = await db.organization.setPackageActivationId({ id: organizationId }, { packageActivationId });

  return { organizationId };
}

const createProductBlueprint = async ({ apiKey, organizationId }) => {
  console.log('should create productBlueprint');

  let { productBlueprintId } = await callApi('api/add-product-blueprint', {
    apiKey,
    organizationId,
    name: pickOne(nounList) + " Blueprint " + (uid++),
    unit: "kg",
    defaultDiscountType: "percent",
    defaultDiscountValue: 10,
    defaultPurchasePrice: 120,
    defaultVat: 15,
    defaultSalePrice: 190,
    isReturnable: true
  });

  return { productBlueprintId };
}

const createServiceBlueprint = async ({ apiKey, organizationId }) => {
  console.log('should create serviceBlueprint');

  let { serviceBlueprintId } = await callApi('api/add-service-blueprint', {
    apiKey,
    organizationId,
    name: pickOne(nounList) + " Blueprint " + (uid++),
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

const createWarehouse = async ({ apiKey, organizationId }) => {
  console.log('should create warehouse');

  let { warehouseId } = await callApi('api/add-warehouse', {
    apiKey,
    organizationId,
    name: pickOne(nameList),
    physicalAddress: pickOne(nameList),
    phone: makePhoneNumber(),
    contactPersonName: pickOne(nameList)
  });

  return { warehouseId };

}

const createOutlet = async ({ apiKey, organizationId }) => {
  console.log('should create outlet');

  let { outletId } = await callApi('api/add-outlet', {
    apiKey,
    organizationId,
    name: pickOne(nounList),
    physicalAddress: 'Really Not Important',
    phone: makePhoneNumber(),
    contactPersonName: pickOne(nameList)
  });

  let body = await callApi('api/get-outlet', {
    apiKey,
    outletId
  });
  let outletDefaultInventoryId = body.defaultInventory.id;

  return { outletId, outletDefaultInventoryId };
}

const createEmployee = async ({ apiKey, organizationId }) => {
  console.log('should create employee');

  let { employeeId } = await callApi('api/add-new-employee', {
    apiKey,

    fullName: pickOne(nameList),
    phone: makePhoneNumber(),
    password: commonPassword,

    organizationId,
    role: "Joi.string().max(1024).required()",
    designation: "Joi.string().max(1024).required()",
    companyProvidedId: "abc123",

    privileges: {
      PRIV_VIEW_USERS: true,
      PRIV_MODIFY_USERS: true,

      PRIV_ACCESS_POS: true,
      PRIV_VIEW_SALES: true,
      PRIV_MODIFY_SALES: true,
      PRIV_ALLOW_FLAT_DISCOUNT: true,

      PRIV_VIEW_SALES_RETURN: true,
      PRIV_MODIFY_SALES_RETURN: true,

      PRIV_VIEW_ALL_INVENTORIES: true,
      PRIV_MODIFY_ALL_PRODUCT_BLUEPRINTS: true,
      PRIV_TRANSFER_ALL_INVENTORIES: true,
      PRIV_ADD_PRODUCTS_TO_ALL_INVENTORIES: true,

      PRIV_MODIFY_ALL_SERVICE_BLUEPRINTS: true,
      PRIV_VIEW_ALL_SERVICES: true,
      PRIV_MODIFY_ALL_SERVICES_AVAILABILITY_IN_ALL_OUTLETS: true,

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

const createProduct = async ({ apiKey, organizationId, outletId, productBlueprintId, outletDefaultInventoryId, count }) => {
  console.log('should create product');

  let results = await callApi('api/add-product-to-inventory', {
    apiKey,
    inventoryId: outletDefaultInventoryId,
    productList: [
      { productBlueprintId, purchasePrice: 100, salePrice: 200, count }
    ]
  });

  return { productId: results.insertedProductList[0].productId };
}

const createSales = async ({ apiKey, outletId, productList }) => {
  console.log('should create sales');

  productList.forEach(product => {
    product.discountType = 'fixed';
    product.discountValue = 0;
    product.salePrice = 200
    product.vatPercentage = 5;
  });

  let { salesId } = await callApi('api/add-sales', {
    apiKey,

    outletId,
    customerId: null,

    productList,

    serviceList: [],

    payment: {
      totalAmount: 0,
      vatAmount: 0,
      discountType: 'fixed',
      discountValue: 0,
      discountedAmount: 0,
      serviceChargeAmount: 0,
      totalBilled: 0,
      paidAmount: 1000000000,
      changeAmount: 0,
      shouldSaveChangeInAccount: false,
      paymentMethod: 'cash'
    }
  });

  return { salesId };
}

// --------------------------------------------------------------

const generateBulkData = async () => {
  let { Program } = require('./../src/index');
  let mainProgram = new Program({ allowUnsafeApis: false, muteLogger: true });
  await mainProgram.initiateServer();
  let db = mainProgram.exposeDatabaseForTesting();

  let primaryUserPhone = makePhoneNumber();
  let { userId: ownerUserId, apiKey } = await createUser({ phone: primaryUserPhone });

  for (let i = 0; i < getSolidCount(organizationCount); i++) {
    let { organizationId } = await createOrganization({ apiKey }, db);

    for (let i = 0; i < getSolidCount(employeeCount); i++) {
      let { employeeId } = await createEmployee({ apiKey, organizationId });
    }

    for (let i = 0; i < getSolidCount(warehouseCount); i++) {
      let { warehouseId } = await createWarehouse({ apiKey, organizationId });
    }

    let outletList = [];
    for (let i = 0; i < getSolidCount(outletCount); i++) {
      let { outletId, outletDefaultInventoryId } = await createOutlet({ apiKey, organizationId });
      outletList.push({ outletId, outletDefaultInventoryId });
    }

    let productBlueprintIdList = [];
    for (let i = 0; i < getSolidCount(productBlueprintCount); i++) {
      let { productBlueprintId } = await createProductBlueprint({ apiKey, organizationId });
      productBlueprintIdList.push(productBlueprintId);
    }

    let serviceBlueprintIdList = [];
    for (let i = 0; i < getSolidCount(serviceBlueprintCount); i++) {
      let { serviceBlueprintId } = await createServiceBlueprint({ apiKey, organizationId });
      serviceBlueprintIdList.push(serviceBlueprintId);
    }

    for (let outlet of outletList) {
      let { outletId, outletDefaultInventoryId } = outlet
      let productList = [];
      for (let productBlueprintId of productBlueprintIdList) {
        let count = getSolidCount(productCountPerBlueprint);
        let { productId } = await createProduct({ apiKey, organizationId, outletId, productBlueprintId, outletDefaultInventoryId, count });
        productList.push({ productId, count });
      }
      // add sales -
      for (let i = 0; i < getSolidCount(salesCountPerOutlet); i++) {
        if (productList.length === 0) break;
        let amount = getSolidCount({ min: 1, max: Math.min(productList.length, 5) });
        if (productList.length === 0) break;
        let sellingProductList = [];
        do {
          if (productList.length === 0) break;
          sellingProductList.push(productList.pop());
        } while (amount--);
        let { salesId } = await createSales({ apiKey, outletId, productList: sellingProductList });
      }
    }

  }

  console.log('Done. Primary User and Pass', primaryUserPhone, commonPassword);

  process.exit(0);
}

generateBulkData().catch(ex => {
  console.error(ex);
  process.exit(0);
});

