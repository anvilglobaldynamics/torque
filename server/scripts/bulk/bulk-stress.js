
let {
  generateBulkData,
  createSales,
  createOutletProduct,
  createEmployee,
  createOutlet,
  callApi,
  generateBulkData
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

(async () => {
  let { apiKey, primaryUserPhone, commonPassword, reusables } = await generateBulkData(params);
  console.log({ apiKey, primaryUserPhone, commonPassword, reusables });




  process.exit(0);
})().catch(ex => {
  console.error(ex);
  process.exit(0);
});
