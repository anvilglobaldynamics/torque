
let { generateBulkData, printApiCallMetrics } = require('./bulk-core');

let params = {
  organizationCount: 1,
  employeeCount: 10,
  warehouseCount: 3,
  outletCount: 8,
  productBlueprintCount: 100,
  serviceBlueprintCount: 30,
  productCountPerBlueprint: 1000,
  salesCountPerOutlet: 40,
  customerCount: 50
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
