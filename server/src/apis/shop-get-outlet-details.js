
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { arrayUnique } = require('./../utils/array');
const { InventoryMixin } = require('./mixins/inventory-mixin');
const { ServiceMixin } = require('./mixins/service-mixin');

exports.ShopGetOutletDetailsApi = class extends Api.mixin(InventoryMixin, ServiceMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get isEnabled() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      outletId: Joi.number().max(999999999999999).required()
    });
  }

  async handle({ body }) {
    let { outletId } = body;

    let outletDeatils = await this.database.outlet.findById({ id: outletId });
    throwOnFalsy(outletDeatils, 'OUTLET_INVALID', 'Could not find outlet');

    let organizationDetails = await this.database.organization.findById({ id: outletDeatils.organizationId });

    let otherOutletList = (await this.database.outlet.listByOrganizationId({ organizationId: organizationDetails.id }))
      .filter(outlet => outlet.id !== outletDeatils.id);

    let inventory = await this.__getOutletDefaultInventory({ outletId });
    let outletProductList = inventory.productList
    await this.__getAggregatedProductListWithoutAcquisitionDetails({ productList: outletProductList });
    outletProductList.forEach(outletProduct => outletProduct.productBlueprintName = outletProduct.product.productBlueprint.name);
    outletProductList.forEach(outletProduct => outletProduct.salePrice = outletProduct.product.salePrice);

    let outletServiceList = (await this.database.service.listAvailableByOutletId({ outletId }))
      .map(service => ({ serviceId: service.id }));
    await this.__getAggregatedServiceList({ serviceList: outletServiceList });
    outletServiceList.forEach(outletService => outletService.serviceBlueprintName = outletService.service.serviceBlueprint.name);
    outletServiceList.forEach(outletService => outletService.salePrice = outletService.service.salePrice);
    
    return {
      outletDeatils: extract(outletDeatils, ['name', 'physicalAddress', 'contactPersonName', 'phone', 'categoryCode']),
      organizationDetails: extract(organizationDetails, ['name', 'primaryBusinessAddress', 'phone', 'email']),
      otherOutletList: otherOutletList.map(outlet => extract(outlet, ['id', 'name', 'categoryCode'])),
      outletProductList: outletProductList.map(outletProduct => extract(outletProduct, ['productBlueprintName', 'salePrice'])),
      outletServiceList: outletServiceList.map(outletService => extract(outletService, ['serviceBlueprintName', 'salePrice'])),
    }
  }

}