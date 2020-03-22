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

let cashAccount = null;
let rentExpenseAccount = null;
let interestIncomeAccount = null;

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

  it('api/add-account (Valid, Interest Income)', testDoneFn => {

    callApi('api/add-account', {
      json: {
        apiKey,
        organizationId,
        displayName: "Interest Income",
        nature: 'revenue',
        isMonetaryAccount: false,
        note: "My Primary Account",
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      interestIncomeAccount = body.accountId;
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
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      rentExpenseAccount = body.accountId;
      testDoneFn();
    })

  });

  it('api/get-account-list (Valid)', testDoneFn => {

    callApi('api/get-account-list', {
      json: {
        apiKey,
        organizationId,
        filterByNature: 'all',
        filterByIsMonetary: 'all',
        accountIdList: []
      }
    }, (err, response, body) => {

      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);

      body.accountList.forEach(account => {
        if (account.codeName === 'CASH') {
          cashAccount = account.id;
        }
      });

      expect(cashAccount).to.not.equal(null);
      testDoneFn();
    });

  });

  it('api/edit-account (Valid)', testDoneFn => {

    callApi('api/edit-account', {
      json: {
        apiKey,
        accountId: rentExpenseAccount,
        displayName: "Rent Account UPDATED",
        note: "Paid Rents"
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
        accountIdList: [rentExpenseAccount]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body.accountList.length).to.equal(1);
      expect(body.accountList[0].displayName).to.equal('Rent Account UPDATED');
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

        transactionOrigin: 'add-expense',
        transactionDatetimeStamp: Date.now(),

        debitedAccountId: rentExpenseAccount,
        creditedAccountId: cashAccount,
        amount: 5000,

        note: "Paid Rent with Cash",

        action: null
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      transactionToBeEdited = body.transactionId;
      testDoneFn();
    })

  });

  it('api/get-transaction-list (Valid)', testDoneFn => {

    callApi('api/get-transaction-list', {
      json: {
        apiKey,
        organizationId,

        fromDate: (new Date()).getTime() - 24 * 60 * 60 * 1000,
        toDate: (new Date()).getTime(),

        preset: 'query',
        accountIdList: [],

        transactionId: null
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body.transactionList.length).to.equal(1);
      testDoneFn();
    });

  });

  it('api/edit-transaction (Valid)', testDoneFn => {

    callApi('api/edit-transaction', {
      json: {
        apiKey,
        transactionId: transactionToBeEdited,
        note: "UPDATE A transaction added from test.",
        transactionDatetimeStamp: Date.now(),
        debitedAccountId: rentExpenseAccount,
        creditedAccountId: cashAccount,
        amount: 1000
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/get-transaction-list (Valid, modification check)', testDoneFn => {

    callApi('api/get-transaction-list', {
      json: {
        apiKey,
        organizationId,

        fromDate: (new Date()).getTime() - 24 * 60 * 60 * 1000,
        toDate: (new Date()).getTime(),

        preset: 'query',
        accountIdList: [],

        transactionId: null
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body.transactionList.length).to.equal(1);
      expect(body.transactionList[0].note).to.equal('UPDATE A transaction added from test.');
      testDoneFn();
    });

  });

  // Transaction tests - end

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});