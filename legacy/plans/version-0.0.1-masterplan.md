# version 0.0.1 Masterplan

Target is to reach a fully functional state with minimal features that closed beta testers can use.

**Expected Release Date**: May 2018

**Beta Testers**: Couple of actual shopkeepers

**Platforms**: 
1. Latest Google Chrome on Desktop.
2. Latest Google Chrome on Android (with "Add to Homescreen")

## Development Goals
1. Features (Detailed below)
2. Admin panel
3. Email support through mailgun
4. Access control
5. Full support for both Bengali and English

## Design Goals
1. Consistent internals (Reuse same styles)
2. Consistent style accross all pages on similar controls.
3. Pixel perfectness (Just the necessary amount of margins).
4. Icons that convey correct message.
5. Color coded buttons.
6. Decent keyboard support.
7. Consistent navigation using back button.
8. No horizontal scrolling anywhere.

## Legal Goals
1. Privacy Policy
2. Terms of Service

## Feature table

| Type | Particulars                  | Dev     | Design | Desktop  | Mobile  | Bengali  | English  | Live |
| ---- | ---------------------------- |:-------:|:------:|:--------:|:-------:|:--------:|:--------:|:----:|
| PAGE | PageError404                 | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageRegister                 | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageLogin                    | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageVerify                   | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageConfirmPasswordReset     | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageHome                     | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageAbout                    | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageSettings                 | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| ---- | ---------------------------- | ------- | ------ | -------- | ------- | -------- | -------- | ---- |
| PAGE | PageManageCustomers          | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageManageEmployees          | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageManageOutlets            | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageManageSalesReturn        | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageManageSales              | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageManageWarehouses         | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageSelectOrganization       | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| ---- | ---------------------------- | ------- | ------ | -------- | ------- | -------- | -------- | ---- |
| PAGE | PageAddEmployee              | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageAddOrganization          | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageAddProducts              | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageAdjustCustoemrBalance    | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageHireEmployee             | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageEditCustomer             | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageEditEmployee             | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageEditOutlet               | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageEditProductCategory      | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageEditProfile              | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageEditWarehouse            | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageEditSalesReturn          | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| ---- | ---------------------------- | ------- | ------ | -------- | ------- | -------- | -------- | ---- |
| PAGE | PageViewCustomer             | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageViewEmployee             | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageViewInventory            | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageViewOutlet               | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageViewSalesReturn          | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageViewSales                | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PageViewWarehouse            | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| ---- | ---------------------------- | ------- | ------ | -------- | ------- | -------- | -------- | ---- |
| PAGE | PageReportSales                  | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PagePosSelectProducts        | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| PAGE | PagePos                      | NO      | NO     | NO       | NO      | NO       | NO       | NO   |
| ---- | ---------------------------- | ------- | ------ | -------- | ------- | -------- | -------- | ---- |
| SYST | TorqueApp                    | NO      | NO     | NO       | NO      | NO       | NO       | NO   |

**NOTES**
1. Mentioning a page includes all the custom elements used in that element.
2. For the "Dev" column, also remove unnecessary imports.
3. For the "Dev" column, also prettify the file.
