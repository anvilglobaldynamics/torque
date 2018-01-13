
class SmsService {

  constructor(config) {
    this.config = config;

    let { from, enabled } = config.sms;
    this.from = from;
    this.enabled = enabled;
  }

  _loadAndPrepareTemplates(cbfn) {
    let branding = this.config.branding;
    let templateList = [
      {
        name: 'phone-verification',
        templateFn: ({ verificationLink }) => `Your ${branding.name} phone verification link is ${verificationLink}`,
      },
      {
        name: 'password-reset',
        templateFn: ({ confirmationLink }) => `Your password reset link for ${branding.name} is ${confirmationLink}`,
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
    this._loadAndPrepareTemplates(_ => {
      cbfn();
    })
  }

  sendStoredSms(templateName, model, to, cbfn) {
    let content = this.templates[templateName].templateFn(model);
    this.sendSms({ to, content }, cbfn);
  }

  sendSms({ to, content } = {}, cbfn) {
    let data = {
      from: this.from,
      // NOTE: Change to 'to' during production
      to: '01706466808',
      content
    };
    if (this.enabled) {
      let error = new Error("Sms sending failed. We are just using mock servers.");
      cbfn(error, false, null, data);
    } else {
      let error = new Error("Sms sending disabled by developer.");
      cbfn(error, true, null, data);
    }
  }

}

exports.SmsService = SmsService;