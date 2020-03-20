let expect = require('chai').expect;

let { callApi } = require('./utils');

let {
  rnd,
  generateInvalidId,
  initializeServer,
  terminateServer,
  registerUser,
  loginUser,
  addOrganization,

  validateGenericApiFailureResponse,
  validateGenericApiSuccessResponse
} = require('./lib');

const prefix = 's';

const email = `${rnd(prefix)}@gmail.com`;
const password = "123545678";
const fullName = "Test User";
const phone = rnd(prefix, 11);

const orgEmail = 'o' + `${rnd(prefix)}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "My Address";
const orgPhone = 'o' + rnd(prefix, 11);

let fromDate = new Date();
fromDate.setDate(fromDate.getDate() - 1);
fromDate = fromDate.getTime();

let apiKey = null;
let organizationId = null;
let accountToBeEdited = null;
let transactionToBeEdited = null;

describe.only('Accounting', _ => {

  it('START', testDoneFn => {
    initializeServer(_ => {
      registerUser({
        password, fullName, phone
      }, _ => {
        loginUser({
          emailOrPhone: phone, password
        }, (data) => {
          apiKey = data.apiKey;
          addOrganization({
            apiKey,
            name: orgName,
            primaryBusinessAddress: orgBusinessAddress,
            phone: orgPhone,
            email: orgEmail
          }, (data) => {
            organizationId = data.organizationId;
            testDoneFn();
          })
        });
      });
    });
  });

  // Account tests - start

  it('api/add-account (Valid, Bank)', testDoneFn => {

    callApi('api/add-account', {
      json: {
        apiKey,
        organizationId,
        displayName: "DBDL Bank Account",
        nature: 'asset',
        isMonetaryAccount: true,
        note: "My Primary Account",
      }
    }, (err, response, body) => {
      console.log(body);
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      testDoneFn();
    })

  });

  it('api/add-account (Valid, Rent)', testDoneFn => {

    callApi('api/add-account', {
      json: {
        apiKey,
        organizationId,
        displayName: "Rent Expenses",
        nature: 'expense',
        isMonetaryAccount: false,
        note: "",
      }
    }, (err, response, body) => {
      console.log(body);
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      testDoneFn();
    })

  });

  it('api/get-account-list (Valid onlyMonetaryAccounts)', testDoneFn => {

    callApi('api/get-account-list', {
      json: {
        apiKey,
        organizationId,
        filterByNature: 'all',
        filterByIsMonetary: 'only-monetary',
        accountIdList: []
      }
    }, (err, response, body) => {
      console.log(body)
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body.accountList.length).to.equal(1);

      accountToBeEdited = body.accountList[0];
      testDoneFn();
    });

  });

  it('api/edit-account (Valid)', testDoneFn => {

    callApi('api/edit-account', {
      json: {
        apiKey,
        accountId: accountToBeEdited.id,
        displayName: "DBDL Bank Account UPDATED",
        note: "A note holding some detail."
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/get-account-list (Valid, modification check)', testDoneFn => {

    callApi('api/get-account-list', {
      json: {
        apiKey,
        organizationId,
        filterByNature: 'all',
        filterByIsMonetary: 'all',
        accountIdList: [accountToBeEdited.id]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body.accountList.length).to.equal(1);
      expect(body.accountList[0].displayName).to.equal('DBDL Bank Account UPDATED');
      testDoneFn();
    });

  });

  // Account tests - end
  // Transaction tests - start

  it('api/add-transaction (Valid)', testDoneFn => {

    callApi('api/add-transaction', {
      json: {
        apiKey,
        organizationId,
        note: "A transaction added from test.",
        amount: 1000,
        transactionType: "system"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      testDoneFn();
    })

  });

  it('api/get-transaction-list (Valid)', testDoneFn => {

    callApi('api/get-transaction-list', {
      json: {
        apiKey,
        organizationId,
        fromDate,
        toDate: (new Date()).getTime(),
        transactionTypeList: [],
        accountIdList: []
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);

      transactionToBeEdited = body.transactionList[0];
      testDoneFn();
    });

  });

  it.skip('api/edit-transaction (Valid)', testDoneFn => {

    callApi('api/edit-transaction', {
      json: {
        apiKey,
        transactionId: 1,
        // transactionToBeEdited.id
        note: "UPDATE A transaction added from test.",
        amount: 1000
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    })

  });

  // Transaction tests - end

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});