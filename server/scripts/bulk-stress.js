
let {
  generateBulkData,
  createSales,
  createOutletProduct,
  createEmployee,
  createOutlet,
  callApi,
  printApiCallMetrics
} = require('./bulk-core');

// let params = {
//   organizationCount: 1,
//   employeeCount: 10,
//   warehouseCount: 1,
//   outletCount: 4,
//   productBlueprintCount: 100,
//   serviceBlueprintCount: 30,
//   productCountPerBlueprint: 1000,
//   salesCountPerOutlet: 40,
//   customerCount: 50
// };

let params = {
  organizationCount: 1,
  employeeCount: 2,
  warehouseCount: 1,
  outletCount: 2,
  productBlueprintCount: 6,
  serviceBlueprintCount: 2,
  productCountPerBlueprint: 1000,
  salesCountPerOutlet: 3,
  customerCount: 1
};

const sleep = (timeout) => {
  console.log("SLEEPING", timeout, 'ms');
  return new Promise(accept => {
    setTimeout(accept, timeout);
  });
}

/* background */
const _getOutlet = async ({ apiKey, outletId }) => {
  console.log('CALLING get-outlet');
  let results = await callApi('api/get-outlet', {
    apiKey,
    outletId
  });
  return {};
}

/* background */
const _getUserDisplayInformation = async ({ apiKey, userId, organizationId }) => {
  console.log('CALLING get-user-display-information');
  let results = await callApi('api/get-user-display-information', {
    apiKey,
    userId,
    organizationId,
  });
  return {};
}

/* background */
const _getActiveServiceList = async ({ apiKey, outletId }) => {
  console.log('CALLING get-active-service-list');
  let results = await callApi('api/get-active-service-list', {
    apiKey,
    outletId,
    searchString: ''
  });
  return {};
}

/* background + heavy */
const _getAggregatedInventoryDetails = async ({ apiKey, inventoryId }) => {
  console.log("CALLING get-aggregated-inventory-details", inventoryId);
  let results = await callApi('api/get-aggregated-inventory-details', {
    apiKey,
    inventoryId
  });
  return {};
}

/* heavy */
const _addSales = createSales;

/* heavy */
const _bulkImportProductBlueprint = async ({ apiKey, organizationId }) => {
  console.log("CALLING bulk-import-product-blueprints");
  let results = await callApi('api/bulk-import-product-blueprints', {
    apiKey,
    organizationId,
    rowList: [
      ["Should Be Unique 1", "pc", 300, 500, 10, "Yes", ''],
      ["Should Be Unique 2", "haali", 10, 10, 10, "No", ''],
      ["Should Be Unique 3", "pc", 300, 500, 10, "Yes", ''],
      ["Should Be Unique 4", "pc", 300, 500, 10, "No", ''],
      ["Should Be Unique 5", "pc", 300, 500, 10, "Yes", ''],
      ["Should Be Unique 6", "pc", 300, 500, 10, "No", ''],
      ["Should Be Unique 7", "pc", 300, 500, 10, "Yes", ''],
      ["Should Be Unique 8", "pc", 300, 500, 10, "No", ''],
      ["Should Be Unique 9", "pc", 300, 500, 10, "Yes", ''],
      ["Should Be Unique 10", "pc", 300, 500, 10, "No", ''],
      ["Should Be Unique 11", "pc", 300, 500, 10, "No", ''],
      ["Should Be Unique 12", "pc", 300, 500, 10, "No", ''],
      ["Should Be Unique 13", "pc", 300, 500, 10, "No", ''],
      ["Should Be Unique 14", "pc", 300, 500, 10, "No", ''],
      ["Should Be Unique 15", "pc", 300, 500, 10, "No", ''],
      ["Should Be Unique 16", "pc", 300, 500, 10, "No", ''],
    ]
  });
  return {};
}

/* heavy */
const _getSalesList = async ({ apiKey, organizationId }) => {
  console.log("CALLING get-sales-list");
  let results = await callApi('api/get-sales-list', {
    apiKey,
    organizationId,
    outletId: null,
    customerId: null,

    shouldFilterByOutlet: false,
    shouldFilterByCustomer: false,

    fromDate: (new Date()).getTime() - (30 * 24 * 60 * 60 * 1000),
    toDate: (new Date()).getTime(),
    includeExtendedInformation: true,

    // searchString: String(salesId)
  });
  return { salesList: results.salesList };
}

/* heavy */
const _getSales = async ({ apiKey, salesId }) => {
  console.log("CALLING get-sales");
  let results = await callApi('api/get-sales', {
    apiKey,
    salesId,
  });
  return {};
}

/* heavy */
const _getServiceMembershipList = async ({ apiKey, organizationId }) => {
  console.log("CALLING get-service-membership-list");
  let results = await callApi('api/get-service-membership-list', {
    apiKey,
    organizationId,
    serviceBlueprintId: null,
    outletId: null,
    customerId: null,

    shouldFilterByServiceBlueprint: false,
    shouldFilterByOutlet: false,
    shouldFilterByCustomer: false,

    fromDate: (new Date()).getTime() - (30 * 24 * 60 * 60 * 1000),
    toDate: (new Date()).getTime()
  });
  return {};
}

/* heavy */
const _reportInventoryDetails = async ({ apiKey, inventoryId }) => {
  console.log("CALLING report-inventory-details");
  let results = await callApi('api/report-inventory-details', {
    apiKey,
    inventoryIdList: [inventoryId]
  });
  return {};
}

/* heavy */
const _reportCollectionDetails = async ({ apiKey, organizationId }) => {
  console.log("CALLING report-collection-details");
  let results = await callApi('api/report-collection-details', {
    apiKey,
    organizationId,
    outletId: null,
    customerId: null,

    shouldFilterByOutlet: false,
    shouldFilterByCustomer: false,

    paymentMethod: null,

    fromDate: (new Date()).getTime() - (30 * 24 * 60 * 60 * 1000),
    toDate: (new Date()).getTime()
  });
  return {};
}

/* heavy */
const _shopGetOutletDetails = async ({ outletId }) => {
  console.log("CALLING shop-get-outlet-details");
  let results = await callApi('api/shop-get-outlet-details', {
    outletId
  });
  return {};
}

/* heavy */
const _shopLocateNearbyOutlets = async ({ }) => {
  console.log("CALLING shop-locate-nearby-outlets");
  let results = await callApi('api/shop-locate-nearby-outlets', {
    northEast: {
      lat: 0,
      lng: 0,
    },
    southWest: {
      lat: 100,
      lng: 100,
    },
    categoryCode: null,
    searchString: ''
  });
  return {};
}

/* heavy */
const _transferBetweenInventories = async ({ apiKey, fromInventoryId, toInventoryId, productList }) => {
  console.log("CALLING transfer-between-inventories");
  let results = await callApi('api/transfer-between-inventories', {
    apiKey,
    fromInventoryId,
    toInventoryId,
    productList
    // productList: [
    //   { productId: productToBeTransferred.productId, count: 3 }
    // ]
  });
  return {};
}

// add-sales
// get-sales-list DONE
// get-sales DONE
// get-service-membership-list DONE
// report-inventory-details DONE
// report-collection-details DONE
// shop-get-outlet-details DONE
// shop-locate-nearby-outlets DONE
// transfer-between-inventories DONE

const simulateHeavyApiCalling = async ({ apiKey, primaryUserPhone, commonPassword, userId, organizationId, outletList, productList }) => {
  const delay = 1 * 1000;
  const times = 12;

  console.log("HEAVY API CALLING");

  console.log(outletList);
  console.log(productList)
  console.log(productList.map(product => ({ productId: product.productId, count: 1 })));

  for (let i = 0; i < times; i++) {
    console.log("HEAVY API CALLING: PASS #", i);
    await _getAggregatedInventoryDetails({ apiKey, inventoryId: outletList[0].outletDefaultInventoryId });
    let { salesList } = await _getSalesList({ apiKey, organizationId });
    await _getSales({ apiKey, salesId: salesList[0].id });
    await _getServiceMembershipList({ apiKey, organizationId });
    await _reportInventoryDetails({ apiKey, inventoryId: outletList[0].outletDefaultInventoryId });
    await _reportCollectionDetails({ apiKey, organizationId });
    await _shopGetOutletDetails({ outletId: outletList[0].outletId });
    await _bulkImportProductBlueprint({ apiKey, organizationId });
    await _shopLocateNearbyOutlets({});
    await _transferBetweenInventories({
      apiKey,
      fromInventoryId: outletList[0].outletDefaultInventoryId,
      toInventoryId: outletList[1].outletDefaultInventoryId,
      productList: productList.map(product => ({ productId: product.productId, count: 1 }))
    });

    let sellingProductList = [];
    let product = productList[2];
    sellingProductList.push({ productId: product.productId, count: 1 });
    await createSales({ apiKey, outletId: outletList[0].outletId, productList: sellingProductList, i });
    await sleep(delay);
  }

  console.log("HEAVY API CALLING - ENDED");
}


const simulateOfflineMode = async ({ apiKey, primaryUserPhone, commonPassword, userId, organizationId, outletList }) => {
  const delay = 1 * 1000;
  const times = 12;

  console.log("SIMULATING BACKGROUND SYNC");

  for (let i = 0; i < times; i++) {
    console.log("SIMULATING BACKGROUND: PASS #", i);
    await _getAggregatedInventoryDetails({ apiKey, inventoryId: outletList[0].outletDefaultInventoryId });
    await _getUserDisplayInformation({ apiKey, userId, organizationId });
    await _getOutlet({ apiKey, outletId: outletList[0].outletId });
    await _getActiveServiceList({ apiKey, outletId: outletList[0].outletId });
    await sleep(delay);
  }

  console.log("SIMULATING BACKGROUND SYNC - ENDED");
}

(async () => {
  let { apiKey, primaryUserPhone, commonPassword, ownerUserId: userId, reusables } = await generateBulkData(params);
  let { outletList, organizationId, productList } = reusables;
  // console.log({ apiKey, primaryUserPhone, commonPassword, userId, outletList });

  // await simulateOfflineMode({ apiKey, primaryUserPhone, commonPassword, userId, organizationId, outletList });
  await simulateHeavyApiCalling({ apiKey, primaryUserPhone, commonPassword, userId, organizationId, outletList, productList });

  printApiCallMetrics();

  process.exit(0);
})().catch(ex => {
  console.error(ex);
  process.exit(0);
});
