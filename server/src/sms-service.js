
class SmsService {

  constructor(config, database) {
    this.config = config;
    this.database = database;
    let { from, enabled } = config.sms;
    this.from = from;
    this.enabled = enabled;
  }

  _loadAndPrepareTemplates(cbfn) {
    let branding = this.config.branding;
    let templateList = [
      {
        name: 'phone-verification',
        templateFn: ({ verificationLink }) => `Your ${branding.shortName} phone verification link is ${verificationLink}`,
      },
      {
        name: 'password-reset',
        templateFn: ({ confirmationLink }) => `Your password reset link for ${branding.shortName} is ${confirmationLink}`,
      },
      {
        name: 'generic-message',
        templateFn: ({ textContent }) => textContent,
      }
    ]
    this.templates = {};
    templateList.forEach(template => {
      this.templates[template.name] = {
        templateFn: template.templateFn
      };
    });
    cbfn();
  }

  initialize(logger, cbfn) {
    this.logger = logger;
    this._loadAndPrepareTemplates(_ => {
      cbfn();
    })
  }

  sendStoredSms(templateName, model, to, cbfn) {
    let content = this.templates[templateName].templateFn(model);
    this.sendSms({ to, content }, cbfn);
  }

  sendSms({ to, content } = {}, cbfn) {
    let actualTo = to;
    if (this.mode !== 'production') {
      actualTo = '01706466808';
    }
    let from = this.from;
    let data = {
      from,
      to: actualTo,
      content
    };
    this.database.outgoingSms.create({
      from,
      to,
      content
    }, (err, smsDoc) => {
      if (err) this.logger.error(err);
      if (this.enabled) {
        let error = new Error("Sms sending failed. We are just using mock servers.");
        cbfn(error, false, null, data);
      } else {
        let error = new Error("Sms sending disabled by developer.");
        cbfn(error, true, null, data);
      }
    });
  }

}

exports.SmsService = SmsService;