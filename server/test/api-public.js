
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
      expect(body).to.contain('Server: Online')
      testDoneFn();
    });

  });

  // it('api/user-register (Valid, Not Unique): ' + email, testDoneFn => {

  //   callApi('api/user-register', {
  //     json: {
  //       email,
  //       password,
  //       phone,
  //       fullName
  //     }
  //   }, (err, response, body) => {
  //     expect(response.statusCode).to.equal(200)
  //     expect(body).to.have.property('hasError').that.equals(true)
  //     testDoneFn()
  //   })

  // });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});

