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
        nature: 'asset',
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
      // expenses  
      {
        nature: 'expense',
        codeName: "COST_OF_GOODS_SOLD",
        displayName: "Cost of Goods Sold",
        isMonetaryAccount: false,
        note: "Cost of all the goods sold from Inventory"
      },
      // unsure
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
      },
    ];

    for (let i = 0; i < defaultAccountList.length; i++) {
      let account = { isDefaultAccount: true, organizationId, createdByUserId: userId };
      Object.assign(account, defaultAccountList[i]);
      let accountId = await this.database.account.create(account);
    }

  }

  async validateAccountIdList({ organizationId, accountIdList }) {
    let accountList = await this.database.account._find({ 
      organizationId ,
      id: {$in: accountIdList}
    });
    if (accountList.length !== accountIdList.length){
      throw new CodedError("ACCOUNT_ID_LIST_INVALID", "The accountIdList is invalid")
    }
  }

  async getAccountByCodeName({ organizationId, codeName }) {
    let account = await this.database.account._findOne({ codeName, organizationId });
    throwOnFalsy(account, "ACCOUNT_INVALID", "The account is invalid");
  }

}