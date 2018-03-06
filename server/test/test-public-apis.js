
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
    });

  });

  it('get-privilege-list', testDoneFn => {

    callApi('api/get-privilege-list', {
      json: {
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('privilegeList').that.is.an('array');
      expect(body.privilegeList.some(privilege => {
        return privilege.code === 'PRIV_ACCESS_POS';
      })).to.equal(true);
      testDoneFn();
    });

  });

  it('get-role-list', testDoneFn => {

    callApi('api/get-role-list', {
      json: {
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('roleList').that.is.an('array');
      expect(body.roleList).to.contain('owner');
      testDoneFn();
    });

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});

