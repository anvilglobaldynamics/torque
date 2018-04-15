
class SmsService {

  constructor(config, database) {
    this.config = config;
    this.database = database;
    let { from, enabled } = config.sms;
    this.from = from;
    this.enabled = enabled;
  }

  async _loadAndPrepareTemplates() {
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
    return;
  }

  initialize(logger) {
    this.logger = logger;
    return this._loadAndPrepareTemplates();
  }

  async sendStoredSms(templateName, model, to) {
    let content = this.templates[templateName].templateFn(model);
    return this.sendSms({ to, content });
  }

  async sendSms({ to, content } = {}) {
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
    return await new Promise((accept, reject) => {
      // CONVERSION: Use Async Collection when implemented
      this.database.outgoingSms.create({
        from,
        to,
        content
      }, (err, smsDoc) => {
        if (err) this.logger.error(err);
        if (this.enabled) {
          let error = new Error("Sms sending failed. We are just using mock servers.");
          accept([error, false, null, data]);
        } else {
          let error = new Error("Sms sending disabled by developer.");
          accept([error, true, null, data]);
        }
      });
    });
  }

}

exports.SmsService = SmsService;