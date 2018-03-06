let { Api } = require('./../api-base');
let Joi = require('joi');

exports.AdminGetOutgoingSmsListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      date: Joi.number().max(999999999999999).required()
    });
  }

  _getOutgoingSmsList({ date }, cbfn) {
    let fromDate = new Date(date).getTime();
    let toDate = new Date(date);
    toDate.setHours(toDate.getHours() + 24);
    toDate = toDate.getTime();
    this.database.outgoingSms.findByDateRange({ fromDate, toDate }, (err, outgoingSmsList) => {
      if (err) return this.fail(err);
      cbfn(outgoingSmsList);
    })
  }

  handle({ body }) {
    let { date } = body;
    this._getOutgoingSmsList({ date }, (outgoingSmsList) => {
      this.success({ outgoingSmsList });
    });
  }

}