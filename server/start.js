let { Program } = require('./src/index');

let mainProgram = new Program({
  allowUnsafeApis: false,
  muteLogger: false
});

mainProgram.initiateServer(_ => {
  console.log('Server Initiated Completely.')
});