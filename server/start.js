let { Program } = require('./src/index');

let mainProgram = new Program({
  allowUnsafeApis: false,
  muteLogger: false
});

(async () => {
  await mainProgram.initiateServer();
  console.log('(program)> Server Initiated Completely.')
})();

