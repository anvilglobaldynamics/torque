let expect = require('chai').expect;
let { callApi } = require('./utils');
let {
  rnd,
  generateInvalidId,
  getDatabase,
  initializeServer,
  terminateServer
} = require('./lib');

const prefix = 's';

const email = `${rnd(prefix)}@gmail.com`;
const changedEmail = 'ce' + `${rnd(prefix)}@gmail.com`;
const password = "123545678";
const changedPassword = "1235456781";
const changedPassword2 = "1235456782";
const changedPassword3 = "1235456783";
const fullName = "Test User";
const phone = rnd(prefix, 11);

let apiKey = null;

describe.only('user apis (1)', _ => {

  it('START', testDoneFn => {
    initializeServer(_ => {
      testDoneFn();
    });
  });

  // ================================================== Register

  it('api/user-register (Valid, Unique): ' + email, testDoneFn => {

    callApi('api/user-register', {
      json: {
        email,
        password,
        phone,
        fullName
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200)
      expect(body).to.have.property('hasError').that.equals(false)
      expect(body).to.have.property('status').that.equals('success')
      expect(body).to.have.property('userId').that.is.a('number');
      testDoneFn()
    })

  });

  it('api/user-register (Valid, Not Unique): ' + email, testDoneFn => {

    callApi('api/user-register', {
      json: {
        email,
        password,
        phone,
        fullName
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200)
      expect(body).to.have.property('hasError').that.equals(true)
      testDoneFn()
    })

  });

  it('api/user-register (Invalid Email): ' + email + '%', testDoneFn => {

    callApi('api/user-register', {
      json: {
        email: (email + '%'),
        password,
        phone,
        fullName
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200)
      expect(body).to.have.property('hasError').that.equals(true)
      testDoneFn()
    })

  });

  it('api/user-register (Invalid Password): ' + email, testDoneFn => {

    callApi('api/user-register', {
      json: {
        email,
        password: 'short',
        phone,
        fullName
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200)
      expect(body).to.have.property('hasError').that.equals(true)
      testDoneFn()
    })

  });

  // ================================================== Login

  it('api/user-login (Correct, Using Email): ' + email, testDoneFn => {

    callApi('api/user-login', {
      json: {
        emailOrPhone: email,
        password
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      expect(body).to.have.property('apiKey').that.is.a('string');
      expect(body).to.have.property('sessionId').that.is.a('number');
      expect(body).to.have.property('warning').that.is.an('array');
      expect(body.warning).to.include('You have less than 24 hours to verify your email address.');
      expect(body.warning).to.include('You have less than 24 hours to verify your phone number.');      
      expect(body).to.have.property('user').that.is.an('object')

      apiKey = body.apiKey;
      testDoneFn();
    })

  });

  // ================================================== Change Password

  it('api/user-change-password (Correct): ' + email, testDoneFn => {

    callApi('api/user-change-password', {
      json: {
        apiKey,
        oldPassword: password,
        newPassword: changedPassword
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  // ================================================== Logout

  it('api/user-logout (Correct): ' + email, testDoneFn => {

    callApi('api/user-logout', {
      json: {
        apiKey
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    });

  });

  // ================================================== Login

  it('api/user-login (Correct, Using Email and Changed Password): ' + email, testDoneFn => {

    callApi('api/user-login', {
      json: {
        emailOrPhone: email,
        password: changedPassword
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      expect(body).to.have.property('apiKey').that.is.a('string')
      expect(body).to.have.property('sessionId').that.is.a('number')
      expect(body).to.have.property('warning').that.is.an('array');
      expect(body.warning).to.include('You have less than 24 hours to verify your email address.');
      expect(body.warning).to.include('You have less than 24 hours to verify your phone number.'); 
      expect(body).to.have.property('user').that.is.an('object')
      apiKey = body.apiKey;
      testDoneFn();
    })

  });

  // ================================================== Edit Profile

  it('api/user-edit-profile', testDoneFn => {

    callApi('api/user-edit-profile', {
      json: {
        apiKey: apiKey,
        fullName: 'Test User',
        email: email,
        phone: phone,
        nid: '',
        physicalAddress: '',
        emergencyContact: '',
        bloodGroup: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  // ================================================== Edit Profile

  it('api/user-edit-profile', testDoneFn => {

    callApi('api/user-edit-profile', {
      json: {
        apiKey: apiKey,
        fullName: 'Test User',
        email: changedEmail,
        phone: phone,
        nid: '',
        physicalAddress: '',
        emergencyContact: '',
        bloodGroup: 'A+'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  // ================================================== Logout

  it('api/user-logout (Correct): ' + email, testDoneFn => {

    callApi('api/user-logout', {
      json: {
        apiKey
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    });

  });

  // ================================================== Password Reset - Request

  it('api/user-reset-password--request', testDoneFn => {

    callApi('api/user-reset-password--request', {
      json: {
        emailOrPhone: changedEmail
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  // ================================================== Password Reset - Get Token Info

  it('api/user-reset-password--get-token-info', testDoneFn => {

    getDatabase().find('password-reset-request', { forEmail: changedEmail }, (err, docList) => {
      if (err) throw err;
      if (docList.length < 1) throw new Error('Expected doc');
      let passwordResetRequest = docList[0];

      callApi('api/user-reset-password--get-token-info', {
        json: {
          uniqueToken: passwordResetRequest.confirmationToken
        }
      }, (err, response, body) => {
        expect(response.statusCode).to.equal(200);
        expect(body).to.have.property('hasError').that.equals(false);
        expect(body).to.have.property('status').that.equals('success');
        testDoneFn();
      })
    });
  });
  // ================================================== Password Reset - Confirm

  it('api/user-reset-password--confirm', testDoneFn => {

    getDatabase().find('password-reset-request', { forEmail: changedEmail }, (err, docList) => {
      if (err) throw err;
      if (docList.length < 1) throw new Error('Expected doc');
      let passwordResetRequest = docList[0];

      callApi('api/user-reset-password--confirm', {
        json: {
          uniqueToken: passwordResetRequest.confirmationToken,
          newPassword: changedPassword2
        }
      }, (err, response, body) => {
        expect(response.statusCode).to.equal(200);
        expect(body).to.have.property('hasError').that.equals(false);
        expect(body).to.have.property('status').that.equals('success');
        testDoneFn();
      })
    });

  });

  // ================================================== Login

  it('api/user-login (Correct, Using Email and Changed Password): ' + email, testDoneFn => {

    callApi('api/user-login', {
      json: {
        emailOrPhone: changedEmail,
        password: changedPassword2
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      expect(body).to.have.property('apiKey').that.is.a('string')
      expect(body).to.have.property('sessionId').that.is.a('number')
      expect(body).to.have.property('warning').that.is.an('array');
      expect(body.warning).to.include('You have less than 24 hours to verify your email address.')
      expect(body.warning).to.include('You have less than 24 hours to verify your phone number.'); 
      expect(body).to.have.property('user').that.is.an('object')
      apiKey = body.apiKey;
      testDoneFn();
    })

  });

  // ================================================== Logout

  it('api/user-logout (Correct): ' + email, testDoneFn => {

    callApi('api/user-logout', {
      json: {
        apiKey
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    });

  });

  // ================================================== Email Verification

  it('api/verify-email', testDoneFn => {

    getDatabase().find('email-verification-request', { forEmail: changedEmail }, (err, docList) => {
      if (err) throw err;
      if (docList.length < 1) throw new Error('Expected doc');
      let emailVerificationRequest = docList[0];

      require('./utils').callGetApi('verify-email/' + emailVerificationRequest.verificationToken, (err, response, body) => {
        expect(response.statusCode).to.equal(200);
        expect(body).to.contain('Email Verification Successful')
        testDoneFn();
      });

    });

  });

  // ================================================== Login

  it('api/user-login (Correct, Using Email and Changed Password): ' + email, testDoneFn => {

    callApi('api/user-login', {
      json: {
        emailOrPhone: changedEmail,
        password: changedPassword2
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      expect(body).to.have.property('apiKey').that.is.a('string')
      expect(body).to.have.property('sessionId').that.is.a('number')
      expect(body).to.have.property('warning').that.is.an('array').that.deep.equals(["You have less than 24 hours to verify your phone number."]);
      expect(body).to.have.property('user').that.is.an('object')
      apiKey = body.apiKey;
      testDoneFn();
    })

  });

  // ================================================== Logout

  it('api/user-logout (Correct): ' + email, testDoneFn => {

    callApi('api/user-logout', {
      json: {
        apiKey
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    });

  });

  // ================================================== Password Reset - Request

  it('api/user-reset-password--request', testDoneFn => {

    callApi('api/user-reset-password--request', {
      json: {
        emailOrPhone: changedEmail
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  // ================================================== Password Reset - Get Token Info

  it('api/user-reset-password--get-token-info', testDoneFn => {

    getDatabase().find('password-reset-request', { forEmail: changedEmail }, (err, docList) => {
      if (err) throw err;
      if (docList.length < 1) throw new Error('Expected doc');
      let passwordResetRequest = docList.find(doc => doc.isPasswordResetComplete === false);

      callApi('api/user-reset-password--get-token-info', {
        json: {
          uniqueToken: passwordResetRequest.confirmationToken
        }
      }, (err, response, body) => {
        expect(response.statusCode).to.equal(200);
        expect(body).to.have.property('hasError').that.equals(false);
        expect(body).to.have.property('status').that.equals('success');
        testDoneFn();
      })
    });
  });
  // ================================================== Password Reset - Confirm

  it('api/user-reset-password--confirm', testDoneFn => {

    getDatabase().find('password-reset-request', { forEmail: changedEmail }, (err, docList) => {
      if (err) throw err;
      if (docList.length < 1) throw new Error('Expected doc');
      let passwordResetRequest = docList.find(doc => doc.isPasswordResetComplete === false);

      callApi('api/user-reset-password--confirm', {
        json: {
          uniqueToken: passwordResetRequest.confirmationToken,
          newPassword: changedPassword3
        }
      }, (err, response, body) => {
        expect(response.statusCode).to.equal(200);
        expect(body).to.have.property('hasError').that.equals(false);
        expect(body).to.have.property('status').that.equals('success');
        testDoneFn();
      })
    });

  });

  // ================================================== Login

  it('api/user-login (Correct, Using Email and Changed Password): ' + email, testDoneFn => {

    callApi('api/user-login', {
      json: {
        emailOrPhone: changedEmail,
        password: changedPassword3
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      expect(body).to.have.property('apiKey').that.is.a('string')
      expect(body).to.have.property('sessionId').that.is.a('number')
      expect(body).to.have.property('user').that.is.an('object')
      apiKey = body.apiKey;
      testDoneFn();
    })

  });

  // ================================================== Logout

  it('api/user-logout (Correct): ' + email, testDoneFn => {

    callApi('api/user-logout', {
      json: {
        apiKey
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    });

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});