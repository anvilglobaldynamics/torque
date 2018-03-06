
# Environment Setup
1. Install nodejs (latest LTS version)
2. Install mongodb and export `mongod` to PATH
3. Make an empty directory called `/db/data` (unix) or `C:/db/data` (windows)
4. Install Polymer CLI `npm install -g polymer-cli` (v.1.4.1 or later)
5. Install nodemon (optional) `npm install -g nodemon`
5. Install mocha (required for testing) `npm install -g mocha`

# Project Setup
1. Clone **torque** repository.
2. navigate to `torque/server` directory.
3. run `npm install`
4. navigate to `torque/client` directory.
5. run `bower install`

# Running Projects
1. run `mongod` on a terminal and keep it running.
2. navigate to `torque/server` directory.
3. run `npm start` (recommended) or `nodemon start.js` or `node start.js` on a separate terminal and keep it running. Server now should be running on `localhost:8540`.
4. navigate to `torque/client` directory.
5. run `npm start` on a separate terminal and keep it running. Client now should be running on `localhost:8545`.

# Testing server
1. Make sure that server is **NOT** running.
2. navigate to `torque/server` directory.
3. run `npm test`

