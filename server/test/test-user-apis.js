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
const changedPhone = '9' + rnd(prefix, 11);

let apiKey = null;

describe('user apis (1)', _ => {

  it('START', testDoneFn => {
    initializeServer(_ => {
      testDoneFn();
    });
  });

  // ================================================== Register

  it('api/user-register (Valid, Unique)', testDoneFn => {

    callApi('api/user-register', {
      json: {
        password,
        phone,
        fullName,
        hasAgreedToToc: true
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200)
      expect(body).to.have.property('hasError').that.equals(false)
      expect(body).to.have.property('status').that.equals('success')
      expect(body).to.have.property('userId').that.is.a('number');
      testDoneFn()
    })

  });

  it('api/user-register (Valid, Did not agree)', testDoneFn => {

    callApi('api/user-register', {
      json: {
        password,
        phone,
        fullName,
        hasAgreedToToc: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error.code).to.equal('VALIDATION_ERROR');

      testDoneFn();
    })

  });

  it('api/user-register (Valid, Not Unique phone)', testDoneFn => {

    callApi('api/user-register', {
      json: {
        password,
        phone,
        fullName,
        hasAgreedToToc: true
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error.code).to.equal('PHONE_ALREADY_IN_USE');

      testDoneFn();
    })

  });

  it('api/user-register (Invalid Password)', testDoneFn => {

    callApi('api/user-register', {
      json: {
        password: 'short',
        phone,
        fullName,
        hasAgreedToToc: true
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error.code).to.equal('VALIDATION_ERROR');

      testDoneFn();
    })

  });

  // ================================================== Login

  it('api/user-login (Correct, Using Phone)', testDoneFn => {

    callApi('api/user-login', {
      json: {
        emailOrPhone: phone,
        password
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      expect(body).to.have.property('apiKey').that.is.a('string');
      expect(body).to.have.property('sessionId').that.is.a('number');
      expect(body).to.have.property('warning').that.is.an('array');
      // expect(body.warning).to.include('You have less than 24 hours to verify your email address.');
      expect(body.warning).to.include(`You have less than 1 hour to verify your phone number "${phone}".`);
      expect(body).to.have.property('user').that.is.an('object')

      apiKey = body.apiKey;
      testDoneFn();
    })

  });

  // ================================================== Change Password

  it('api/user-change-password (Correct)', testDoneFn => {

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

  it('api/user-logout (Correct)', testDoneFn => {

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

  it('api/user-login (Correct, Using Phone)', testDoneFn => {

    callApi('api/user-login', {
      json: {
        emailOrPhone: phone,
        password: changedPassword
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      expect(body).to.have.property('apiKey').that.is.a('string');
      expect(body).to.have.property('sessionId').that.is.a('number');
      expect(body).to.have.property('warning').that.is.an('array');
      // expect(body.warning).to.include('You have less than 24 hours to verify your email address.');
      expect(body.warning).to.include(`You have less than 1 hour to verify your phone number "${phone}".`);
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

  it('api/user-login (Correct, Using Changed Email and Changed Password)', testDoneFn => {

    callApi('api/user-login', {
      json: {
        emailOrPhone: changedEmail,
        password: changedPassword
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      expect(body).to.have.property('apiKey').that.is.a('string')
      expect(body).to.have.property('sessionId').that.is.a('number')
      expect(body).to.have.property('warning').that.is.an('array');
      // expect(body.warning).to.include('You have less than 24 hours to verify your email address.');
      // expect(body.warning).to.include(`You have less than 1 hour to verify your phone number "${phone}".`);
      expect(body).to.have.property('user').that.is.an('object')
      apiKey = body.apiKey;
      testDoneFn();
    })

  });

  // ================================================== Logout

  it('api/user-logout (Correct)', testDoneFn => {

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

  // ================================================== Password Reset-Request - Using Email

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

  // ================================================== Password Reset - Get Token Info - Using Email

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
  // ================================================== Password Reset - Confirm - Using Email

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

  it('api/user-login (Correct, Using Email and Changed Password)', testDoneFn => {

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
      // expect(body.warning).to.include('You have less than 24 hours to verify your email address.')
      // expect(body.warning).to.include('You have less than 24 hours to verify your phone number.');
      expect(body).to.have.property('user').that.is.an('object')
      apiKey = body.apiKey;
      testDoneFn();
    })

  });

  // ================================================== Logout

  it('api/user-logout (Correct)', testDoneFn => {

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

  // it('api/verify-email', testDoneFn => {

  //   getDatabase().find('email-verification-request', { forEmail: changedEmail }, (err, docList) => {
  //     if (err) throw err;
  //     if (docList.length < 1) throw new Error('Expected doc');
  //     let emailVerificationRequest = docList[0];

  //     require('./utils').callGetApi('verify-email/' + emailVerificationRequest.verificationToken, (err, response, body) => {
  //       expect(response.statusCode).to.equal(200);
  //       expect(body).to.contain('Email Verification Successful')
  //       testDoneFn();
  //     });

  //   });

  // });

  // ================================================== Login

  it('api/user-login (Correct, Using Email and Changed Password)', testDoneFn => {

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
      // expect(body).to.have.property('warning').that.is.an('array').that.deep.equals(["You have less than 24 hours to verify your phone number."]);
      expect(body).to.have.property('user').that.is.an('object')
      apiKey = body.apiKey;
      testDoneFn();
    })

  });

  // ================================================== Logout

  it('api/user-logout (Correct)', testDoneFn => {

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

  // ================================================== Password Reset - Request - Using Phone

  it('api/user-reset-password--request', testDoneFn => {

    callApi('api/user-reset-password--request', {
      json: {
        emailOrPhone: phone
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  // ================================================== Password Reset - Get Token Info - Using Phone

  it('api/user-reset-password--get-token-info', testDoneFn => {

    getDatabase().find('password-reset-request', { forPhone: phone }, (err, docList) => {
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
  // ================================================== Password Reset - Confirm - Using Phone

  it('api/user-reset-password--confirm', testDoneFn => {

    getDatabase().find('password-reset-request', { forPhone: phone }, (err, docList) => {
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

  it('api/user-login (Correct, Using Phone and Changed Password)', testDoneFn => {

    callApi('api/user-login', {
      json: {
        emailOrPhone: phone,
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

  it('api/user-logout (Correct)', testDoneFn => {

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

  it('api/verify-phone', testDoneFn => {

    getDatabase().find('phone-verification-request', { forPhone: phone }, (err, docList) => {
      if (err) throw err;
      if (docList.length < 1) throw new Error('Expected doc');
      let phoneVerificationRequest = docList[0];

      require('./utils').callGetApi('verify-phone/' + phoneVerificationRequest.verificationToken, (err, response, body) => {
        expect(response.statusCode).to.equal(200);
        expect(body).to.contain('Phone Verification Successful')
        testDoneFn();
      });

    });

  });

  // ================================================== Login

  it('api/user-login (Correct, Using Email and Changed Password)', testDoneFn => {

    callApi('api/user-login', {
      json: {
        emailOrPhone: phone,
        password: changedPassword3
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      expect(body).to.have.property('apiKey').that.is.a('string')
      expect(body).to.have.property('sessionId').that.is.a('number')
      expect(body).to.have.property('warning').that.is.an('array').that.deep.equals([]);
      expect(body).to.have.property('user').that.is.an('object')
      apiKey = body.apiKey;
      testDoneFn();
    })

  });

  // ================================================== Logout

  it('api/user-logout (Correct)', testDoneFn => {

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