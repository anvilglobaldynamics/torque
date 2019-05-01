
# Environment Setup
1. Install nodejs (latest LTS version)
2. Install mongodb and export `mongod` to PATH
3. Make an empty directory called `/data/db` (unix) or `C:/data/db` (windows). (custom path will also work)
4. Install Polymer CLI `npm install -g polymer-cli` (v.1.4.1 or later)
5. Install nodemon (optional) `npm install -g nodemon`
5. Install mocha (required for testing) `npm install -g mocha`
6. Install bower `npm install -g bower`

# Project Setup
1. Clone **torque** repository.
2. navigate to `torque/server` directory.
3. run `npm install`
4. navigate to `torque/client` directory.
5. run `npm install`
6. run `bower install`

# Running Projects
1. run `mongod` on a terminal and keep it running. (use `mongod --dbpath /path` for custom path)
2. navigate to `torque/server` directory.
3. run `npm start` (recommended) or `node start.js` on a separate terminal and keep it running. Server now should be running on `localhost:8540`. (Alternatively use `npm run dev` or `nodemon start.js` to start the server and restart it every time you change the code.)
4. navigate to `torque/client` directory.
5. run `npm start` on a separate terminal and keep it running. Client now should be running on `localhost:8545`.

# Testing server
1. Make sure that server is **NOT** running.
2. navigate to `torque/server` directory.
3. run `npm test`

