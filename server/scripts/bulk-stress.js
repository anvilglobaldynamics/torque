
let {
  generateBulkData,
  createSales,
  createOutletProduct,
  createEmployee,
  createOutlet,
  callApi,
  printApiCallMetrics
} = require('./bulk-core');

let params = {
  organizationCount: 1,
  employeeCount: 10,
  warehouseCount: 1,
  outletCount: 4,
  productBlueprintCount: 100,
  serviceBlueprintCount: 30,
  productCountPerBlueprint: 1000,
  salesCountPerOutlet: 40,
  customerCount: 50
};

const _addSales = createSales;

const _getAggregatedInventoryDetails = async ({ apiKey, inventoryId }) => {

  console.log("CALLING get-aggregated-inventory-details");

  let results = await callApi('api/get-aggregated-inventory-details', {
    apiKey,
    inventoryId
  });

  return {};

}

const _bulkImportProductBlueprint = async ({ apiKey, organizationId }) => {

  // console.log('should add product to outlet', i);

  let results = await callApi('api/bulk-import-product-blueprints', {
    apiKey,
    organizationId,
    rowList: [
      ["Should Be Unique 1", "pc", 300, 500, 10, "Yes", ''],
      ["Should Be Unique 2", "haali", 10, 10, 10, "No", '']
    ]
  });

  return {};

}

const _getSalesList = async ({ apiKey, organizationId }) => {

  // console.log('should add product to outlet', i);

  let results = await callApi('api/get-sales-list', {
    apiKey,
    organizationId,
    outletId: null,
    customerId: null,

    shouldFilterByOutlet: false,
    shouldFilterByCustomer: false,

    fromDate: (new Date()).getTime(),
    toDate: (new Date()).getTime(),
    includeExtendedInformation: true,

    // searchString: String(salesId)
  });

  return {};

}

const _getServiceMembershipList = async ({ apiKey, inventoryId }) => {

  console.log('should add product to outlet', i);

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


// const _getAggregatedInventoryDetails = async (apiKey, inventoryId) => {

//   console.log('should add product to outlet', i);

//   let results = await callApi('api/get-aggregated-inventory-details', {
//     apiKey,
//     inventoryId
//   });

//   return {};

// }


// get - user - display - information
// get - outlet
// inv det
// get - active - service - list

const sleep = (timeout) => {
  return new Promise(accept => {
    setTimeout(accept, timeout);
  });
}

const simulateOfflineMode = async ({ apiKey, primaryUserPhone, commonPassword, outletList }) => {
  const delay = 30 * 1000;
  const times = 12;

  console.log("SIMULATING BACKGROUND SYNC");

  for (let i = 0; i < times; i++) {
    console.log("SIMULATING BACKGROUND: PASS #", i);
    await _getAggregatedInventoryDetails({ apiKey, inventoryId: outletList[0].outletDefaultInventoryId });
  }


}


(async () => {
  let { apiKey, primaryUserPhone, commonPassword, reusables } = await generateBulkData(params);
  let { outletList } = reusables;
  console.log({ apiKey, primaryUserPhone, commonPassword, outletList });

  await simulateOfflineMode({ apiKey, primaryUserPhone, commonPassword, outletList });

  printApiCallMetrics();

  process.exit(0);
})().catch(ex => {
  console.error(ex);
  process.exit(0);
});
