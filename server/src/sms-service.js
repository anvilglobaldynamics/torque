
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
        templateFn: ({ verificationCode }) => `Your ${branding.name} verification code is ${verificationCode}.`,
      },
      {
        name: 'password-reset',
        templateFn: () => `Your ${branding.name} password was recently changed.`,
      },
      {
        name: 'generic-message',
        templateFn: ({ content }) => content,
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
    let html = this.templates[templateName].templateFn(model);
    let subject = this.templates[templateName].subject;
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
      cbfn(error);
    } else {
      let error = new Error("Sms sending disabled by developer.");
      cbfn(error);
    }
  }

}

exports.SmsService = SmsService;