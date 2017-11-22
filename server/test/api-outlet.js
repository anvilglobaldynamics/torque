let expect = require('chai').expect;

let { callApi } = require('./utils');
let {
  initializeServer,
  terminateServer,
  registerUser,
  loginUser,
  addOrganization
} = require('./lib');

const email = `t2${(new Date).getTime()}@gmail.com`;
const password = "123545678";
const fullName = "Test User";
const phone = 't2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

const orgEmail = `o2${(new Date).getTime()}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "My Address";
const orgPhone = 'o2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

let apiKey = null;

describe('add-outlet', _ => {

  it('START', testDoneFn => {
    initializeServer(_ => {
      registerUser({
        email, password, fullName, phone
      }, _ => {
        setTimeout(_ => {
          loginUser({
            emailOrPhone: email, password
          }, (data) => {
            apiKey = data.apiKey;
            setTimeout(_ => {
              addOrganization ({
                apiKey,
                name: orgName,
                primaryBusinessAddress: orgBusinessAddress,
                phone: orgPhone,
                email: orgEmail
              }, (data) => {
                testDoneFn();
              })
            }, 100)
          });
        }, 100)
      });
    });
  });

  // it('api/add-outlet', testDoneFn => {

  //   callApi('api/add-outlet', {
  //     json: {
  //       apiKey,
  //       name: "My Organization",
  //       primaryBusinessAddress: "My Address",
  //       phone: orgPhone,
  //       email: orgEmail
  //     }
  //   }, (err, response, body) => {
  //     expect(response.statusCode).to.equal(200);
  //     expect(body).to.have.property('hasError').that.equals(false);
  //     expect(body).to.have.property('status').that.equals('success');
  //     testDoneFn();
  //   })

  // });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});