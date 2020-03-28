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
      // Unsure because of contra revenue
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
    throwOnTruthy(debitList[0].accountId === creditList[0].accountId, "TRANSACTION_NOT_BALANCED", "Debit and credit does not match.");
    return debitSum;
  }

  async addSystemTransaction({ createdByUserId, organizationId, transactionDatetimeStamp, debitList, creditList, note, action }) {
    let amount = await this.balanceTransactionAndGetAmount({ debitList, creditList });
    let transactionOrigin = 'system';
    let transactionId = await this.database.transaction.create({
      createdByUserId, organizationId, note, amount, transactionDatetimeStamp, transactionOrigin, debitList, creditList, action
    });
    return transactionId;
  }

  async addSalesRevenueTransaction({
    transactionData = { createdByUserId, organizationId },
    salesData = { productList, serviceList, payment, salesId, salesNumber }
  }) {

    let { createdByUserId, organizationId } = transactionData;
    let { productList, serviceList, payment, salesId, salesNumber } = salesData;

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

    let transaction = {
      createdByUserId,
      organizationId,
      transactionDatetimeStamp: Date.now(),
      debitList,
      creditList,
      note: `Transaction recorded from Sales #${salesNumber}`,
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
    salesData = { productList, salesId, salesNumber }
  }) {

    let { createdByUserId, organizationId } = transactionData;
    let { productList, salesId, salesNumber } = salesData;

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

    if (accounting.debitCostOfGoodsSold) {
      debitList.push({
        accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'COST_OF_GOODS_SOLD' })).id,
        amount: accounting.debitCostOfGoodsSold
      });
    }

    // credit
    let creditList = [];

    if (accounting.creditInventory) {
      creditList.push({
        accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'INVENTORY' })).id,
        amount: accounting.creditInventory
      });
    }

    let transaction = {
      createdByUserId,
      organizationId,
      transactionDatetimeStamp: Date.now(),
      debitList,
      creditList,
      note: `Transaction recorded from Sales #${salesNumber}`,
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
    salesData = { payment, salesId, salesNumber }
  }) {

    let { createdByUserId, organizationId } = transactionData;
    let { payment, salesId, salesNumber } = salesData;

    let accounting = {
      // debit
      debitMonetary: payment.paidAmount - payment.changeAmount,
      // credit
      creditAccountsReceivable: payment.paidAmount - payment.changeAmount,
    }

    // debit
    let debitList = [];

    if (accounting.debitMonetary) {
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
    }

    // credit
    let creditList = [];

    if (accounting.creditAccountsReceivable) {
      creditList.push({
        accountId: (await this.getAccountByCodeName({ organizationId, codeName: 'ACCOUNTS_RECEIVABLE' })).id,
        amount: accounting.creditAccountsReceivable
      });
    }

    let transaction = {
      createdByUserId,
      organizationId,
      transactionDatetimeStamp: Date.now(),
      debitList,
      creditList,
      note: `Additional payments for Sales #${salesNumber}`,
      action: {
        name: 'add-additional-payment',
        collectionName: 'sales',
        documentId: salesId
      }
    };

    return await this.addSystemTransaction(transaction);
  }

}