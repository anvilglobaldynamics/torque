let { LegacyApi } = require('../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.DeleteProductBlueprintApi = class extends collectionCommonMixin(LegacyApi) {

  get isEnabled() { return false; }

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      productBlueprintId: Joi.number().max(999999999999999).required(),
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "product-blueprint",
        query: ({ productBlueprintId }) => ({ id: productBlueprintId }),
        select: "organizationId",
        errorCode: "PRODUCT_BLUEPRINT_INVALID"
      },
      privilegeList: [
        "PRIV_MODIFY_ALL_PRODUCT_BLUEPRINTS"
      ],
      moduleList: [
        "MOD_PRODUCT",
      ]
    }];
  }

  _checkAndDeleteProductBlueprint({ productBlueprintId }, cbfn) {
    // FIXME: below method listChildren is not present anymore as product blueprints are flat
    this.legacyDatabase.productBlueprint.listChildren({ productBlueprintId }, (err, productBlueprintChildList) => {
      if (err) return this.fail(err);
      if (productBlueprintChildList.length > 0) {
        err = new Error("product blueprint is parent of atleast one blueprint");
        err.code = "PRODUCT_BLUEPRINT_NOT_CHILDLESS";
        return this.fail(err);
      }
      this._deleteProductBlueprint({ productBlueprintId }, cbfn);
    })
  }

  _deleteProductBlueprint({ productBlueprintId }, cbfn) {
    this._deleteDocById(this.legacyDatabase.productBlueprint, { productBlueprintId }, cbfn);
  }

  handle({ body, userId }) {
    let { productBlueprintId } = body;
    this._checkAndDeleteProductBlueprint({ productBlueprintId }, _ => {
      this.success({ status: "success" });
    });
  }

}