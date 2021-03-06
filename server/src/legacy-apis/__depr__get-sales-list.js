let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { outletCommonMixin } = require('./mixins/outlet-common');
let { customerCommonMixin } = require('./mixins/customer-common');
let { salesCommonMixin } = require('./mixins/sales-common');

exports.GetSalesListApi = class extends salesCommonMixin(outletCommonMixin(customerCommonMixin(collectionCommonMixin(LegacyApi)))) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['salesList']; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      organizationId: Joi.number().max(999999999999999).required(),
      outletId: Joi.number().max(999999999999999).allow(null).required(),
      customerId: Joi.number().max(999999999999999).allow(null).required(),

      shouldFilterByOutlet: Joi.boolean().required(),
      shouldFilterByCustomer: Joi.boolean().required(),

      fromDate: Joi.number().max(999999999999999).required(),
      toDate: Joi.number().max(999999999999999).required(),

      includeExtendedInformation: Joi.boolean().optional()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_VIEW_SALES"
      ]
    }];
  }

  _verifyOutletIfNeeded({ outletId, shouldFilterByOutlet }, cbfn) {
    if (!shouldFilterByOutlet) return cbfn();
    this._verifyOutletExist({ outletId }, cbfn);
  }

  _verifyCustomerIfNeeded({ customerId, shouldFilterByCustomer }, cbfn) {
    if (!shouldFilterByCustomer) return cbfn();
    this._verifyCustomerExist({ customerId }, cbfn);
  }

  _includeExtendedInformationIfNeeded(salesList, includeExtendedInformation, cbfn) {
    if (!includeExtendedInformation) return cbfn();
    Promise.all(salesList.map(sales => {
      let customerPromise = new Promise((accept, reject) => {
        if (!sales.customerId) {
          return accept();
        }
        this.legacyDatabase.customer.findById({ customerId: sales.customerId }, (err, customer) => {
          if (err) return reject(err);
          if (!this._ensureDoc(err, customer, "CUSTOMER_INVALID", "Customer not found.")) return;
          sales.customer = customer;
          return accept();
        });
      });
      let productBlueprintPromise = new Promise((accept, reject) => {
        let productIdList = sales.productList.map(product => product.productId);
        this.legacyDatabase.product.findByIdList({ idList: productIdList }, (err, productList) => {
          if (err) return reject(err);
          if (productList.length !== productList.length) {
            err = new Error("Unable to find all products in productList");
            err.code = "PRODUCT_INVALID";
            return reject(err);
          }
          let productBlueprintIdList = productList.map(product => product.productBlueprintId);
          this.legacyDatabase.productBlueprint.listByIdList({ idList: productBlueprintIdList }, (err, productBlueprintList) => {
            if (err) return reject(err);
            productBlueprintList.forEach(productBlueprint => {
              let _product = productList.find(product => product.productBlueprintId === productBlueprint.id);
              let product = sales.productList.find(product => product.productId === _product.id);
              product.productBlueprint = productBlueprint;
            })
            return accept();
          });
        });
      });
      return Promise.all([customerPromise, productBlueprintPromise]);
    }))
      .then(() => cbfn())
      .catch((ex) => this.fail(ex));
  }

  handle({ body }) {
    let { organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate, includeExtendedInformation } = body;

    toDate = new Date(toDate);
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate = toDate.getTime();

    this._verifyOutletIfNeeded({ outletId, shouldFilterByOutlet }, () => {
      this._verifyCustomerIfNeeded({ customerId, shouldFilterByCustomer }, () => {
        this._getSalesList({ organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }, (salesList) => {
          this._includeExtendedInformationIfNeeded(salesList, includeExtendedInformation, () => {
            this.success({ salesList });
          });
        });
      });
    });
  }

}