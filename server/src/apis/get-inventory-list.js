
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { generateRandomString } = require('./../utils/random-string');

exports.GetInventoryListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privileges: [
        "PRIV_VIEW_ALL_INVENTORIES"
      ]
    }];
  }

  // async __getUser({ emailOrPhone, password }) {
  //   let passwordHash = this._makeHash(password);
  //   let user = await this.database.user.findByEmailOrPhoneAndPasswordHash({ emailOrPhone, passwordHash });
  //   throwOnFalsy(user, "USER_NOT_FOUND", this.verses.userLoginApi.userNotFound);
  //   throwOnTruthy(user.isBanner, "USER_BANNED", this.verses.userLoginApi.userBanned);

  //   let warning = [];
  //   if (emailOrPhone === user.phone && !user.isPhoneVerified) {
  //     let phoneVerificationRequest = this.database.phoneVerificationRequest.findByForPhone({ forPhone: user.phone });
  //     throwOnFalsy(phoneVerificationRequest, "PHONE_VERIFICATION_REQUEST_NOT_FOUND", this.verses.userLoginApi.phoneVerificationRequestNotFound);
  //     let { createdDatetimeStamp, isVerificationComplete } = phoneVerificationRequest;
  //     if (!isVerificationComplete) {
  //       let diff = Date.now() - createdDatetimeStamp;
  //       throwOnTruthy(diff > PHONE_VERIFICATION_WINDOW, "USER_REQUIRES_PHONE_VERIFICATION", this.verses.userLoginApi.userRequiresPhoneVerification);
  //       diff = Math.round(diff / (1000 * 60))
  //       warning.push(`You have less than 1 hour to verify your phone number "${user.phone}".`);
  //     }
  //   } else if (emailOrPhone === user.email && !user.isEmailVerified) {
  //     let emailVerificationRequest = this.database.emailVerificationRequest.findByForEmail({ forEmail: user.email });
  //     throwOnFalsy(emailVerificationRequest, "EMAIL_VERIFICATION_REQUEST_NOT_FOUND", this.verses.userLoginApi.emailVerificationRequestNotFound)
  //     throwOnFalsy(emailVerificationRequest.isVerificationComplete, "USER_REQUIRES_EMAIL_VERIFICATION", this.verses.userLoginApi.userRequiresEmailVerification)
  //   } else {
  //     'pass'
  //   }
  //   return ({ user, warning });
  // }

  // async __createSession(userId) {
  //   let apiKey = generateRandomString(64);
  //   do {
  //     var isUnique = await this.database.sesssion.isApiKeyUnique({ apiKey });
  //   } while (!isUnique);
  //   let sessionId = await this.database.sesssion.create({ userId, apiKey });
  //   return { apiKey, sessionId };
  // }

  // async handle({ body }) {
  //   let { emailOrPhone, password } = body;
  //   let { user, warning } = await this.__getUser({ emailOrPhone, password });
  //   let { apiKey, sessionId } = await this.__createSession(user.id);
  //   return {
  //     status: "success",
  //     apiKey,
  //     warning,
  //     sessionId,
  //     user: extract(user, [
  //       'id',
  //       'fullName',
  //       'email',
  //       'phone',
  //       'nid',
  //       'physicalAddress',
  //       'emergencyContact',
  //       'bloodGroup',
  //       'isEmailVerified',
  //       'isPhoneVerified'
  //     ])
  //   }
  // }

  async __getInventoryList({ organizationId }) {
    let combinedInventoryList = await this.database.inventory.listByOrganizationId(organizationId);
    {
      let inventoryList = combinedInventoryList.filter(inventory => inventory.inventoryContainerType === 'outlet');
      let map = await this.crossmap({
        source: inventoryList,
        sourceKey: 'inventoryContainerId',
        target: 'outlet',
        onError: (inventory) => { throw new CodedError("INVENTORY_CONTAINER_NOT_FOUND", "Could not find Inventory Container"); }
      });




    }
  }

  async handle({ body }) {
    let { organizationId } = body;
    let inventoryList = await this.__getInventoryList({ organizationId });
    return { inventoryList };
  }

}