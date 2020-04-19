const { Api } = require('./../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

/** @param {typeof Api} SuperApiClass */
exports.AccountingMixin = (SuperApiClass) => class extends SuperApiClass {

  // nature: Joi.string().valid('asset', 'liability', 'equity', 'revenue', 'expense').required(),

  async createDefaultAccounts({ organizationId, userId }) {

    const defaultAccountList = [

      // Assets (Monetary)
      {
        nature: 'asset',
        codeName: "CASH",
        displayName: "Cash",
        isMonetaryAccount: true,
        note: "Default Cash Account for all purposes"
      },
      {
        nature: 'asset',
        codeName: "BANK",
        displayName: "Bank",
        isMonetaryAccount: true,
        note: "Default Bank Account"
      },

      // Assets (Non-Monetary)
      {
        nature: 'asset',
        codeName: "INVENTORY",
        displayName: "Inventory",
        isMonetaryAccount: false,
        note: "Sum of purchase price of all products in inventory"
      },
      {
        nature: 'asset',
        codeName: "ACCOUNTS_RECEIVABLE",
        displayName: "Accounts Receivable",
        isMonetaryAccount: false,
        note: "Money someone owes the business"
      },

      // Equities
      {
        nature: 'equity',
        codeName: "EQUITY_CAPITAL",
        displayName: "Equity Capital",
        isMonetaryAccount: false,
        note: "Default Equity Account (Shareholder's/Owner's Equity Capital)"
      },

      // Liabilities
      {
        nature: 'liability',
        codeName: "ACCOUNTS_PAYABLE",
        displayName: "Accounts Payable",
        isMonetaryAccount: false,
        note: "Money the business owes"
      },

      // Revenues
      {
        nature: 'revenue',
        codeName: "PRODUCT_SALES_REVENUE",
        displayName: "Product Sales Revenue",
        isMonetaryAccount: false,
        note: "All revenue generated from Product Sales"
      },
      {
        nature: 'revenue',
        codeName: "SERVICE_SALES_REVENUE",
        displayName: "Service Sales Revenue",
        isMonetaryAccount: false,
        note: "All revenue generated from Product Sales"
      },
      {
        nature: 'revenue',
        codeName: "SERVICE_CHARGE_REVENUE",
        displayName: "Service Charge Revenue",
        isMonetaryAccount: false,
        note: "All revenue generated from service charges"
      },

      // Expenses
      {
        nature: 'expense',
        codeName: "COST_OF_GOODS_SOLD",
        displayName: "Cost of Goods Sold",
        isMonetaryAccount: false,
        note: "Cost of all the goods sold from Inventory"
      },
      {
        nature: 'expense',
        codeName: "SALES_DISCOUNT_EXPENSE",
        displayName: "Sales Discount Expense",
        isMonetaryAccount: false,
        note: "Discount given during sales"
      },
      {
        nature: 'expense',
        codeName: "PRODUCT_SALES_RETURN",
        displayName: "Product Sales Return",
        isMonetaryAccount: false,
        note: "Revenue Lost due to Product Sales Return"
      },
      {
        nature: 'expense',
        codeName: "SERVICE_SALES_RETURN",
        displayName: "Service Sales Return",
        isMonetaryAccount: false,
        note: "Revenue Lost due to Service Sales Return"
      }
    ];

    for (let i = 0; i < defaultAccountList.length; i++) {
      let account = { isDefaultAccount: true, organizationId, createdByUserId: userId };
      Object.assign(account, defaultAccountList[i]);
      let accountId = await this.database.account.create(account);
    }

  }

  async validateAccountIdList({ organizationId, accountIdList }) {
    let accountList = await this.database.account._find({
      organizationId,
      id: { $in: accountIdList }
    });
    if (accountList.length !== accountIdList.length) {
      throw new CodedError("ACCOUNT_ID_LIST_INVALID", "The accountIdList is invalid")
    }
  }

  async getAccountByCodeName({ organizationId, codeName }) {
    let account = await this.database.account._findOne({ codeName, organizationId });
    throwOnFalsy(account, "ACCOUNT_INVALID", `The account ${codeName} is invalid`);
    return account;
  }

  async balanceTransactionAndGetAmount({ debitList, creditList }) {
    if (debitList.length === 1 && creditList.length === 1) {
      throwOnTruthy(debitList[0].accountId === creditList[0].accountId, "TRANSACTION_INVALID", "Cannot do a transaction between same account");
    }

    let creditSum = 0;
    let debitSum = 0;
    debitList.forEach(({ amount }) => debitSum += amount);
    creditList.forEach(({ amount }) => creditSum += amount);

    throwOnTruthy(debitList.length === 0, "TRANSACTION_NOT_BALANCED", "Debit List is empty");
    throwOnTruthy(creditList.length === 0, "TRANSACTION_NOT_BALANCED", "Credit List is empty");

    throwOnTruthy(debitList[0].accountId === creditList[0].accountId, "TRANSACTION_NOT_BALANCED", "Debit and credit does not match.");
    return debitSum;
  }

  async addSystemTransaction({ createdByUserId, organizationId, transactionDatetimeStamp, debitList, creditList, note, party, action }) {
    let amount = await this.balanceTransactionAndGetAmount({ debitList, creditList });
    let transactionOrigin = 'system';
    let transactionId = await this.database.transaction.create({
      createdByUserId, organizationId, note, amount, transactionDatetimeStamp, transactionOrigin, debitList, creditList, party, action
    });
    return transactionId;
  }

  async reverseTransaction({ transaction, action, note }) {
    transaction = JSON.parse(JSON.stringify(transaction)); // create referenceless clone

    // swap debit and credit
    let t = transaction.creditList;
    transaction.creditList = transaction.debitList;
    transaction.debitList = t;

    // override 
    transaction.action = action;
    transaction.transactionDatetimeStamp = Date.now();
    transaction.note = note;

    await this.addSystemTransaction(transaction);
  }

  async addSalesRevenueTransaction({
    transactionData = { createdByUserId, organizationId },
    operationData = { productList, serviceList, payment, salesId, salesNumber, customer }
  }) {

    let { createdByUserId, organizationId } = transactionData;
    let { productList, serviceList, payment, salesId, salesNumber, customer } = operationData;

    let accounting = {
      // debit
      debitAccountsReceivable: payment.totalBilled - payment.totalPaidAmount,
      debitMonetary: payment.totalPaidAmount,
      debitSalesDiscountExpense: payment.discountedAmount + payment.roundedByAmount,
      // credit
      creditSalesRevenue: payment.totalAmount + payment.vatAmount,
      creditServiceChargeRevenue: payment.serviceChargeAmount
    }

    // debit
    let debitList = [];

    if (accounting.debitMonetary) {
      if (payment.paymentList[0].paymentMethod === 'cash') {
        debitList.push({
          accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'CASH' })).id,
          amount: accounting.debitMonetary
        });
      } else {
        debitList.push({
          accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'BANK' })).id,
          amount: accounting.debitMonetary
        });
      }
    }

    if (accounting.debitAccountsReceivable) {
      debitList.push({
        accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'ACCOUNTS_RECEIVABLE' })).id,
        amount: accounting.debitAccountsReceivable
      });
    }

    if (accounting.debitSalesDiscountExpense) {
      debitList.push({
        accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'SALES_DISCOUNT_EXPENSE' })).id,
        amount: accounting.debitSalesDiscountExpense
      });
    }

    // credit
    let creditList = [];

    if (accounting.creditServiceChargeRevenue) {
      creditList.push({
        accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'SERVICE_CHARGE_REVENUE' })).id,
        amount: accounting.creditServiceChargeRevenue
      });
    }

    if (accounting.creditSalesRevenue) {
      if (productList.length > 0) {
        creditList.push({
          accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'PRODUCT_SALES_REVENUE' })).id,
          amount: accounting.creditSalesRevenue
        });
      } else if (serviceList.length > 0) {
        creditList.push({
          accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'SERVICE_SALES_REVENUE' })).id,
          amount: accounting.creditSalesRevenue
        });
      }
    }

    let party = null;
    if (customer) {
      party = {
        collectionName: 'customer',
        documentId: customer.id
      }
    }

    let transaction = {
      createdByUserId,
      organizationId,
      transactionDatetimeStamp: Date.now(),
      debitList,
      creditList,
      note: `Transaction recorded from Sales #${salesNumber}`,
      party,
      action: {
        name: 'add-sales',
        collectionName: 'sales',
        documentId: salesId
      }
    };

    return await this.addSystemTransaction(transaction);
  }

  async addSalesInventoryTransaction({
    transactionData = { createdByUserId, organizationId },
    operationData = { productList, salesId, salesNumber, customer }
  }) {

    let { createdByUserId, organizationId } = transactionData;
    let { productList, salesId, salesNumber, customer } = operationData;

    let purchasePriceSum = 0;
    productList.forEach(product => {
      purchasePriceSum += product.purchasePrice * product.count;
    });

    let accounting = {
      // debit
      debitCostOfGoodsSold: purchasePriceSum,
      // credit
      creditInventory: purchasePriceSum
    }

    // debit
    let debitList = [];

    debitList.push({
      accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'COST_OF_GOODS_SOLD' })).id,
      amount: accounting.debitCostOfGoodsSold
    });

    // credit
    let creditList = [];

    creditList.push({
      accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'INVENTORY' })).id,
      amount: accounting.creditInventory
    });

    let party = null;
    if (customer) {
      party = {
        collectionName: 'customer',
        documentId: customer.id
      }
    }

    let transaction = {
      createdByUserId,
      organizationId,
      transactionDatetimeStamp: Date.now(),
      debitList,
      creditList,
      note: `Transaction recorded from Sales #${salesNumber}`,
      party,
      action: {
        name: 'add-sales',
        collectionName: 'sales',
        documentId: salesId
      }
    };

    return await this.addSystemTransaction(transaction);
  }

  async addAddtionalPaymentTransaction({
    transactionData = { createdByUserId, organizationId },
    operationData = { payment, salesId, salesNumber, customer }
  }) {

    let { createdByUserId, organizationId } = transactionData;
    let { payment, salesId, salesNumber, customer } = operationData;

    let accounting = {
      // debit
      debitMonetary: payment.paidAmount - payment.changeAmount,
      // credit
      creditAccountsReceivable: payment.paidAmount - payment.changeAmount,
    }

    // debit
    let debitList = [];

    if (payment.paymentMethod === 'cash') {
      debitList.push({
        accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'CASH' })).id,
        amount: accounting.debitMonetary
      });
    } else {
      debitList.push({
        accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'BANK' })).id,
        amount: accounting.debitMonetary
      });
    }

    // credit
    let creditList = [];

    creditList.push({
      accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'ACCOUNTS_RECEIVABLE' })).id,
      amount: accounting.creditAccountsReceivable
    });

    let party = null;
    if (customer) {
      party = {
        collectionName: 'customer',
        documentId: customer.id
      }
    }

    let transaction = {
      createdByUserId,
      organizationId,
      transactionDatetimeStamp: Date.now(),
      debitList,
      creditList,
      note: `Additional payments for Sales #${salesNumber}`,
      party,
      action: {
        name: 'add-additional-payment',
        collectionName: 'sales',
        documentId: salesId
      }
    };

    return await this.addSystemTransaction(transaction);
  }

  async addSalesReturnExpenseTransaction({
    transactionData = { createdByUserId, organizationId },
    operationData = { refundedAmount, salesReturnId, salesNumber, customer }
  }) {

    let { createdByUserId, organizationId } = transactionData;
    let { refundedAmount, salesReturnId, salesNumber, customer } = operationData;

    let accounting = {
      // debit
      debitSalesReturnExpense: refundedAmount,
      // credit
      creditMonetary: refundedAmount
    }

    // debit
    let debitList = [];

    debitList.push({
      accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'PRODUCT_SALES_RETURN' })).id,
      amount: accounting.debitSalesReturnExpense
    });

    // credit
    let creditList = [];

    creditList.push({
      accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'CASH' })).id,
      amount: accounting.creditMonetary
    });

    let party = null;
    if (customer) {
      party = {
        collectionName: 'customer',
        documentId: customer.id
      }
    }

    let transaction = {
      createdByUserId,
      organizationId,
      transactionDatetimeStamp: Date.now(),
      debitList,
      creditList,
      note: `Product return for Sales #${salesNumber}`,
      party,
      action: {
        name: 'add-sales-return',
        collectionName: 'sales-return',
        documentId: salesReturnId
      }
    };

    return await this.addSystemTransaction(transaction);
  }

  async addSalesReturnInventoryTransaction({
    transactionData = { createdByUserId, organizationId },
    operationData = { returnedProductList, salesReturnId, salesNumber, customer }
  }) {

    let { createdByUserId, organizationId } = transactionData;
    let { returnedProductList, salesReturnId, salesNumber, customer } = operationData;

    let purchasePriceSum = 0;
    returnedProductList.forEach(product => {
      purchasePriceSum += product.purchasePrice * product.count;
    });

    let accounting = {
      // debit
      debitInventory: purchasePriceSum,
      // credit
      creditCostOfGoodsSold: purchasePriceSum
    }

    // debit
    let debitList = [];

    debitList.push({
      accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'INVENTORY' })).id,
      amount: accounting.debitInventory
    });

    // credit
    let creditList = [];

    creditList.push({
      accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'COST_OF_GOODS_SOLD' })).id,
      amount: accounting.creditCostOfGoodsSold
    });

    let party = null;
    if (customer) {
      party = {
        collectionName: 'customer',
        documentId: customer.id
      }
    }

    let transaction = {
      createdByUserId,
      organizationId,
      transactionDatetimeStamp: Date.now(),
      debitList,
      creditList,
      note: `Product return for Sales #${salesNumber}`,
      party,
      action: {
        name: 'add-sales-return',
        collectionName: 'sales-return',
        documentId: salesReturnId
      }
    };

    return await this.addSystemTransaction(transaction);
  }

  async addProductAcquisitionInventoryTransaction({
    transactionData = { createdByUserId, organizationId },
    operationData = { productList, productAcquisitionId, productAcquisitionNumber, vendorId }
  }) {

    let { createdByUserId, organizationId } = transactionData;
    let { productList, productAcquisitionId, productAcquisitionNumber, vendorId } = operationData;

    let purchasePriceSum = 0;
    productList.forEach(product => {
      purchasePriceSum += product.purchasePrice * product.count;
    });

    let accounting = {
      // debit
      debitInventory: purchasePriceSum,
      // credit
      creditAccountsPayable: purchasePriceSum
    }

    // debit
    let debitList = [];

    debitList.push({
      accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'INVENTORY' })).id,
      amount: accounting.debitInventory
    });

    // credit
    let creditList = [];

    creditList.push({
      accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'ACCOUNTS_PAYABLE' })).id,
      amount: accounting.creditAccountsPayable
    });

    let party = null;
    if (vendorId) {
      party = {
        collectionName: 'vendor',
        documentId: vendorId
      }
    }

    let transaction = {
      createdByUserId,
      organizationId,
      transactionDatetimeStamp: Date.now(),
      debitList,
      creditList,
      note: `Product Acquisition #${productAcquisitionNumber}`,
      party,
      action: {
        name: 'add-product-to-inventory',
        collectionName: 'product-acquisition',
        documentId: productAcquisitionId
      }
    };

    return await this.addSystemTransaction(transaction);
  }

}