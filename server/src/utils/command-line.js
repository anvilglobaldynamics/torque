
exports.parseCommandLineParameters = _ => {

  let params = {};

  if (!process.argv.some(str => str.includes('_mocha'))) {
    var program = require('commander');
    params = program
      .version('0.1.0')
      .option('-p, --dry-run', 'Runs the startup process without starting server.')
      .option('-P, --validate', 'Check database integrity')
      .option('-P, --db <db>', 'Override db to use')
      .parse(process.argv);
  }

  let {
    validate = false,
    dryRun = false,
    db = null,
  } = params;

  return {
    validate,
    dryRun,
    db
  };
}