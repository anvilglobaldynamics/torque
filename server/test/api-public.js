
let expect = require('chai').expect;
let { callApi } = require('./utils');
let {
  getDatabase,
  initializeServer,
  terminateServer
} = require('./lib');

describe('public apis', _ => {

  it('START', testDoneFn => {
    initializeServer(_ => {
      testDoneFn();
    });
  });

  it('internal--status', testDoneFn => {

    require('./utils').callGetApi('internal--status', (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.contain('Server: Online');
      testDoneFn();
    });

  });

  it('get-designation-list', testDoneFn => {

    callApi('api/get-designation-list', {
      json: {
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('designationList').that.is.an('array');
      expect(body.designationList).to.contain('Owner');
      testDoneFn();
    })

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});

