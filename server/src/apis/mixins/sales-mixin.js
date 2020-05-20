const { Api } = require('./../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

const moment = require('moment');

const { generateRandomStringCaseInsensitive } = require('./../../utils/random-string');

/** @param {typeof Api} SuperApiClass */
exports.SalesMixin = (SuperApiClass) => class extends SuperApiClass {

  async _getSales({ salesId }) {
    let sales = await this.database.sales.findById({ id: salesId });
    throwOnFalsy(sales, "SALES_INVALID", "Sales not found");
    return sales;
  }

  async _getSalesList({ organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }) {
    let outletList = await this.database.outlet.listByOrganizationId({ organizationId });
    let outletIdList = outletList.map(outlet => outlet.id);
    let salesList = await this.database.sales.listByFilters({ outletIdList, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate });
    return salesList;
  }

  async _processASinglePayment({ userId, payment, customer, paymentListEntry }) {
    // NOTE: At this point, all of above fields are validated and completely trustworthy.

    // NOTE: since paidAmount includes changeAmount, we confirmed after discussion.
    let paidAmountWithoutChange = (paymentListEntry.paidAmount - paymentListEntry.changeAmount);

    payment.totalPaidAmount += paidAmountWithoutChange;
    let wasChangeSavedInChangeWallet = false;
    if (paymentListEntry.changeAmount && paymentListEntry.shouldSaveChangeInAccount) {
      if (!customer) {
        throw new CodedError("CUSTOMER_REQUIRED_TO_SAVE_CHANGE", "Customer is required to save change in change wallet.");
      }

      wasChangeSavedInChangeWallet = true;
      await this._addChangeToChangeWallet({ customer, amount: paymentListEntry.changeAmount });
    }

    let {
      paymentMethodId, paidAmount, changeAmount
    } = paymentListEntry;

    payment.paymentList.push({
      createdDatetimeStamp: Date.now(),
      acceptedByUserId: userId,
      paymentMethodId, paidAmount, changeAmount,
      wasChangeSavedInChangeWallet
    });

    return payment;
  }

  async _addReturnedProductCountToSales({ sales }) {
    let salesReturnList = await this.database.salesReturn.listBySalesId({ salesId: sales.id });
    if (salesReturnList.length === 0) {
      sales.productList.forEach(product => {
        product.returnedProductCount = 0;
      });
      return;
    }

    salesReturnList.forEach(salesReturn => {
      salesReturn.returnedProductList.forEach(returnedProduct => {
        let matchingProduct = sales.productList.find(product => {
          return product.productId === returnedProduct.productId;
        });
        if (!('returnedProductCount' in matchingProduct)) {
          matchingProduct.returnedProductCount = 0;
        }
        matchingProduct.returnedProductCount += returnedProduct.count;
      });
    });
  }

  // Add Sales - Start

  async _validateBillingAndPayment({ productList, payment, paymentListEntry, customer, organizationId }) {
    // TODO: should check if adding product(s) salePrice and modifiers (discountedAmount, serviceChargeAmount) equals totalBilled
    // throw new CodedError("BILL_INACCURATE", "Bill is mathematically inaccurate");
    // Also should validate the new payment portion. i.e. paidAmount > changeAmount etc
    // Also, if paymentMethodId is 'change-wallet' then customer must exist

    if (paymentListEntry.shouldSaveChangeInAccount) {
      await this.ensureModule('MOD_CUSTOMER_ACCOUNT_BALANCE');
    }

    if (payment.discountPresetId !== null) {
      let discountPreset = await this.database.discountPreset.findByIdAndOrganizationId({ id: payment.discountPresetId, organizationId });
      throwOnFalsy(discountPreset, "DISCOUNT_PRESET_INVALID", "The discount preset is invalid");
      if (payment.discountType !== discountPreset.discountType || payment.discountValue !== discountPreset.discountValue) {
        throw new CodedError("DISCOUNT_CALCULATION_INVALID", "Discount calculation is not valid");
      }
    }

    if (payment.totalBilled > (payment.totalPaidAmount + paymentListEntry.paidAmount)) {
      throwOnFalsy(customer, "CREDIT_SALE_NOT_ALLOWED_WITHOUT_CUSTOMER", "Credit sale is not allowed without a registered cutomer.");
    }

  }

  _reduceProductCountFromInventoryContainerDefaultInventory({ inventoryContainerDefaultInventory, productList }) {
    for (let product of productList) {
      let foundProduct = inventoryContainerDefaultInventory.productList.find(_product => _product.productId === product.productId);
      if (!foundProduct) {
        throw new CodedError("PRODUCT_INVALID", "product could not be found in source inventory");
      }
      if (foundProduct.count < product.count) {
        throw new CodedError("INSUFFICIENT_PRODUCT", "not enough product(s) in source inventory");
      }
      foundProduct.count -= product.count;
    }
  }

  /**
    @method _standardizePayment
    Splits an original payment received from POS into two separate objects.
      - First one is 'payment' containing the standardized form of payment that can be
        inserted into database.
      - Second one is 'paymentListEntry' containing the only the details of current "payment" provided
        by customer.
      see the signature of the objects returned for more clarification.
  */
  _standardizePayment({ originalPayment }) {
    let {
      totalAmount, vatAmount, discountPresetId, discountType, discountValue, discountedAmount, serviceChargeAmount,
      totalBilled, totalBillBeforeRounding, roundedByAmount,
      paymentMethodId, paidAmount, changeAmount, shouldSaveChangeInAccount
    } = originalPayment;

    let payment = {
      totalAmount, vatAmount, discountPresetId, discountType, discountValue, discountedAmount, serviceChargeAmount,
      totalBilled, totalBillBeforeRounding, roundedByAmount,
      paymentList: [], totalPaidAmount: 0
    }

    let paymentListEntry = {
      paymentMethodId, paidAmount, changeAmount, shouldSaveChangeInAccount
    }

    return { payment, paymentListEntry };
  }

  async _findCustomerIfSelected({ customerId }) {
    let customer = null;
    if (customerId) {
      customer = await this.database.customer.findById({ id: customerId });
      if (!customer) {
        throw new CodedError("CUSTOMER_INVALID", "Customer not found.");
      }
    }
    return customer;
  }

  async _validateServiceAndCheckRequirements({ serviceListObj, customer }) {
    let service = await this.database.service.findById({ id: serviceListObj.serviceId });
    throwOnFalsy(service, "SERVICE_INVALID", "Service could not be found.");
    let serviceBlueprint = await this.database.serviceBlueprint.findById({ id: service.serviceBlueprintId });
    throwOnFalsy(serviceBlueprint, "SERVICE_INVALID", "Service could not be found.");

    if ((serviceBlueprint.isLongstanding || serviceBlueprint.isCustomerRequired) && !customer) {
      throw new CodedError("SERVICE_REQUIRES_CUSTOMER", "Service requires a customer.");
    }

    if (!serviceBlueprint.isEmployeeAssignable && serviceListObj.assignedEmploymentId) {
      throw new CodedError("CANT_ASSIGN_EMPLOYEE_TO_SERVICE", "Cant assign employee to this service.");
    }

    if (serviceListObj.assignedEmploymentId) {
      let employee = await this.database.employment.findById({ id: serviceListObj.assignedEmploymentId });
      throwOnFalsy(employee, "ASSIGNED_EMPLOYEE_INVALID", "Employee could not be found.");
    }
  }

  async _createServiceMembership({ createdByUserId, serviceListObj, customerId, salesId }) {
    let service = await this.database.service.findById({ id: serviceListObj.serviceId });
    let serviceBlueprint = await this.database.serviceBlueprint.findById({ id: service.serviceBlueprintId });

    if (serviceBlueprint.isLongstanding) {
      let date = new Date;
      date.setMonth(date.getMonth() + serviceBlueprint.serviceDuration.months);
      date.setDate(date.getDate() + serviceBlueprint.serviceDuration.days);
      let expiringDatetimeStamp = date.getTime();
      let res = await this.database.serviceMembership.create({ createdByUserId, customerId, salesId, serviceId: service.id, assignedEmploymentId: serviceListObj.assignedEmploymentId, expiringDatetimeStamp });
    }
  }

  async _appendSalePriceWithoutModification({ productList }) {
    (await this.crossmap({
      source: productList,
      sourceKey: 'productId',
      target: 'product',
      onError: (product) => { throw new CodedError("PRODUCT_INVALID", "Invalid Product"); }
    })).forEach((product, soldProduct) => {
      soldProduct.salePriceBeforeModification = product.salePrice;
    });
  }

  async __addSales({ userId, organizationId, outletId, customerId, productList, serviceList, assistedByEmployeeId, payment: originalPayment, productsSelectedFromWarehouseId, wasOfflineSale, isLiteSales }) {

    if (!productList.length && !serviceList.length) {
      throw new CodedError("NO_PRODUCT_OR_SERVICE_SELECTED", "Both productList and serviceList can not be empty.");
    }

    let customer = await this._findCustomerIfSelected({ customerId });

    let { payment, paymentListEntry } = this._standardizePayment({ originalPayment });
    await this._validateBillingAndPayment({ productList, payment, paymentListEntry, customer, organizationId });

    if (productList.length) {
      await this._appendSalePriceWithoutModification({ productList });

      let inventoryContainerDefaultInventory;
      if (productsSelectedFromWarehouseId) {
        await this.ensureModule('MOD_SELL_WAREHOUSE_PRODUCTS');
        inventoryContainerDefaultInventory = await this.__getWarehouseDefaultInventory({ warehouseId: productsSelectedFromWarehouseId });
      } else {
        inventoryContainerDefaultInventory = await this.__getOutletDefaultInventory({ outletId });
      }

      // NOTE: Restaurants do not have inventory management
      // So we do NOT decrease product count on sales
      if (!await this.hasModule('MOD_RESTAURANT')) {
        this._reduceProductCountFromInventoryContainerDefaultInventory({ inventoryContainerDefaultInventory, productList });
      }

      await this.database.inventory.setProductList({ id: inventoryContainerDefaultInventory.id }, { productList: inventoryContainerDefaultInventory.productList });
    }

    if (serviceList.length) {
      for (let i = 0; i < serviceList.length; i++) {
        await this._validateServiceAndCheckRequirements({ serviceListObj: serviceList[i], customer });
      }
    }

    payment = await this._processASinglePayment({ userId, customer, payment, paymentListEntry });

    // get purchase price of products
    productList = await this.__getAggregatedProductList({ productList });
    productList.forEach(product => {
      product.purchasePrice = product.product.purchasePrice
      delete product.product;
    });

    let salesId = await this.database.sales.create({ originApp: this.clientApplication, organizationId, outletId, customerId, productList, serviceList, assistedByEmployeeId, payment, productsSelectedFromWarehouseId, wasOfflineSale });
    let sales = await this.database.sales.findById({ id: salesId });

    if (!isLiteSales) {
      if (await this.hasModule('MOD_ACCOUNTING')) {
        await this.addSalesRevenueTransaction({
          transactionData: {
            createdByUserId: userId,
            organizationId
          },
          operationData: { productList, serviceList, payment, salesId, salesNumber: sales.salesNumber, customer }
        });

        if (productList.length > 0) {
          await this.addSalesInventoryTransaction({
            transactionData: {
              createdByUserId: userId,
              organizationId
            },
            operationData: { productList, salesId, salesNumber: sales.salesNumber, customer }
          });
        }
      }
    }

    if (serviceList.length) {
      for (let i = 0; i < serviceList.length; i++) {
        await this._createServiceMembership({ createdByUserId: userId, serviceListObj: serviceList[i], customerId, salesId });
      }
    }

    return { status: "success", salesId };

  }

  // Add Sales - End

  // Get Sales - Start

  async _addProductBlueprintData({ sales }) {
    let { productList } = sales;
    await this.__getAggregatedProductListWithoutAcquisitionDetails({ productList });
    productList.forEach(product => {
      let { productBlueprint } = product.product;
      product.productBlueprintId = productBlueprint.id;
      product.productBlueprintName = productBlueprint.name;
      product.productBlueprintUnit = productBlueprint.unit;
      product.productBlueprintIsReturnable = productBlueprint.isReturnable;
      delete product.product;
    });
  }

  async _addServiceBlueprintData({ sales }) {
    let { serviceList } = sales;
    await this.__getAggregatedServiceList({ serviceList });
    serviceList.forEach(service => {
      let { serviceBlueprint } = service.service;
      service.serviceBlueprintId = serviceBlueprint.id;
      service.serviceBlueprintName = serviceBlueprint.name;
      service.serviceBlueprintIsLongstanding = serviceBlueprint.isLongstanding;
      service.serviceBlueprintServiceDuration = serviceBlueprint.serviceDuration;
      service.serviceBlueprintIsRefundable = serviceBlueprint.isRefundable;
      delete service.service;
    });
  }

  async __addDiscountPresetName({ sales }) {
    sales.payment.discountPresetName = '';
    if (sales.payment.discountPresetId === null) return;
    let discountPreset = await this.database.discountPreset.findById({ id: sales.payment.discountPresetId });
    sales.payment.discountPresetName = discountPreset.name;
  }

  // Get Sales - End

  // Sales Receipt - Start

  async  _getReceiptData({ receiptId }) {

    let receipt = await this.database.receipt.findById({ id: receiptId });

    let sales = await this._getSales({ salesId: receipt.salesId });

    let outlet = await this.database.outlet.findById({ id: sales.outletId });

    let organization = await this.database.organization.findById({ id: outlet.organizationId });

    let customer = null;
    if (sales.customerId !== null) {
      customer = await this.database.customer.findById({ id: sales.customerId });
    }

    let userId = sales.payment.paymentList[0].acceptedByUserId;
    let user = await this.database.user.findById({ id: userId });
    let soldByUser = {
      fullName: user.fullName
    }

    let organizationSettings = await this.database.organizationSettings.findByOrganizationId({
      organizationId: organization.id
    });

    await this._addReturnedProductCountToSales({ sales });
    await this._addProductBlueprintData({ sales });

    await this._addServiceBlueprintData({ sales });

    await this.__addDiscountPresetName({ sales });

    await this._appendPaymentMethodDetails({ organizationId: organization.id, sales });

    return {
      sales,
      outlet,
      organization,
      soldByUser,
      customer,
      organizationSettings
    };

  }

  async _createReceipt({ salesId, sentVia }) {
    do {
      var receiptToken = generateRandomStringCaseInsensitive(6).toLowerCase();
      var isUnique = !(await this.database.receipt.findByReceiptToken({ receiptToken }));
    } while (!isUnique);
    let sentHistory = [];
    if (sentVia !== 'none') {
      sentHistory.push({
        sentVia,
        sentDatetimeStamp: Date.now(),
      })
    }
    let receiptId = await this.database.receipt.create({ originApp: this.clientApplication, receiptToken, salesId, sentHistory });

    let receiptData = await this._getReceiptData({ receiptId });

    await this.database.receipt.setReceiptData({ id: receiptId }, { receiptData });

    return receiptToken;
  }

  async _sendReceiptMail(model) {
    function unescapeHtmlEntities(str) {
      var map = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": "\"",
        "&#39;": "'",
        "&apos;": "'"
      };
      return str.replace(/(&amp;|&lt;|&gt;|&quot;|&#39;|&apos;)/g, function (m) { return map[m]; });
    }

    model.organizationName = unescapeHtmlEntities(model.organizationName);

    let clientLanguage = (this.clientLanguage || 'en-us');
    let [err, isDeveloperError, response, finalBody] = await this.server.emailService.sendStoredMail(clientLanguage, 'receipt', model, model.email);

    if ((err) || response.message !== 'Queued. Thank you.') {
      if (err) {
        if (!isDeveloperError) this.logger.error(err);
      } else {
        this.logger.log("Unexpected emailService response:", response);
      }
      let message = 'Failed to send receipt email. Please handle the case manually.';
      this.logger.important(message, {
        type: 'email-receipt',
        model
      });
    }
  }

  async _sendReceiptByEmail({ payment, organization, customer, receiptToken, outletId }) {
    let organizationName = organization.name;
    let organizationPhone = organization.phone;

    let dateObject = (new Date())
    dateObject.setHours(dateObject.getHours() + 6); // GMT + 6
    let date = moment(dateObject).format('dddd, MMMM Do YYYY, h:mm a');

    let { totalBilled, changeAmount, totalPaidAmount } = payment;
    totalBilled = Math.round(totalBilled * 100) / 100;
    changeAmount = Math.round(changeAmount * 100) / 100;
    changeAmount = changeAmount || 0;

    let email = customer.email;
    let customerName = customer.fullName;

    let outlet = await this.database.outlet.findById({ id: outletId });
    let outletPhone = outlet.phone;
    let outletName = outlet.name;
    let outletPhysicalAddress = outlet.physicalAddress

    await this._sendReceiptMail({
      email,
      totalBilled,
      changeAmount,
      organizationName,
      organizationPhone,
      outletPhone,
      outletName,
      outletPhysicalAddress,
      receiptToken,
      customerName,
      date
    });
  }

  // Sales Receipt - End

  async _appendPaymentMethodDetails({ organizationId, sales }) {
    let paymentMethodList = await this.database.paymentMethod.listByOrganizationId({ organizationId });
    for (let payment of sales.payment.paymentList) {
      payment.paymentMethodDetails = paymentMethodList.find(pm => pm.id === payment.paymentMethodId);
    }
  }

}