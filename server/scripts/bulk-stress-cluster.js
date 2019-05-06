const cluster = require('cluster');
const http = require('http');
// const numCPUs = require('os').cpus().length;

const numOrganizations = 1;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  const numCpuThreads = numOrganizations * 4;
  for (let i = 0; i < numCpuThreads; i++) {
    cluster.fork();
  }

  let fullMetrics = {};

  for (let id in cluster.workers) {
    cluster.workers[id].on('message', (metrics) => {
      for (let key in metrics) {
        if (!(key in fullMetrics)) fullMetrics[key] = { timesCalled: 0 };
        fullMetrics[key].timesCalled += metrics[key].timesCalled;
      }
      cluster.workers[id].kill();
    });
  }

  let deadCount = 0;
  cluster.on('exit', (worker, code, signal) => {
    deadCount += 1;
    console.log(`worker ${worker.process.pid} is done`);
    if (deadCount === numCpuThreads) {
      console.log("All workers are done");
      console.log(fullMetrics);
    }
  });

} else {

  require('./bulk-stress').run({ noMetrics: true }).then(metrics => {
    // console.log(metrics);
    process.send(metrics);
  })
    .catch(ex => {
      console.error(ex);
      process.exit(0);
    });

  console.log(`Worker ${process.pid} started`);
}
