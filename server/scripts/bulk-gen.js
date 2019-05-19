
let { generateBulkData, printApiCallMetrics } = require('./bulk-core');

let params = {
  organizationCount: 1,
  employeeCount: 6,
  warehouseCount: 2,
  outletCount: 3,
  productBlueprintCount: 20,
  serviceBlueprintCount: 5,
  productCountPerBlueprint: 1000,
  salesCountPerOutlet: 20,
  customerCount: 5
};

(async () => {
  let { apiKey, primaryUserPhone, commonPassword } = await generateBulkData(params);
  console.log({ apiKey, primaryUserPhone, commonPassword });

  printApiCallMetrics();

  process.exit(0);
})().catch(ex => {
  console.error(ex);
  process.exit(0);
});
