
let createMailgunInstance = require('mailgun-js');
let fslib = require('fs');
let Handlebars = require('handlebars');
let inlineCss = require('inline-css');
let { AsyncCollector } = require('baselib');
let pathlib = require('path');

class EmailService {

  constructor(config) {
    this.config = config;

    let { privateKey, domain, from, enabled } = config.email;
    this.privateKey = privateKey;
    this.domain = domain;
    this.from = from;
    this.enabled = enabled;
  }

  _loadAndPrepareTemplates(cbfn) {
    let branding = this.config.branding;
    let cssFilePath = './src/templates/email/common.css';
    let css = fslib.readFileSync(cssFilePath, { encoding: 'utf8' });
    let templateList = [
      {
        name: 'email-verification',
        path: './src/templates/email/email-verification.html',
        subject: `Your email verification code for ${branding.name}`
      },
      {
        name: 'password-reset',
        path: './src/templates/email/password-reset.html',
        subject: `Your password reset code for ${branding.name}`
      },
      {
        name: 'generic-message',
        path: './src/templates/email/generic-message.html',
        subject: `Message from ${branding.name}`
      }
    ];
    let collector = new AsyncCollector(templateList.length);
    for (let template of templateList) {
      let html = fslib.readFileSync(template.path, { encoding: 'utf8' });
      let url = 'file://' + pathlib.join(__dirname, '../', template.path);
      inlineCss(html, {
        url: url,
        extraCss: css
      }).then((html) => {
        let compiledTemplate = Handlebars.compile(html);
        collector.collect(template.name, { compiledTemplate: compiledTemplate, subject: template.subject });
      });
    }
    collector.finally((collection) => {
      this.templates = collection;
      cbfn();
    });
  }

  generateHtml(templateName, model) {
    Object.assign(model, this.config.branding);
    return this.templates[templateName].compiledTemplate(model);
  }

  initialize(logger, cbfn) {
    if (!this.privateKey) {
      let error = new Error("No privateKey found in mailgun. Sending mail will not work.");
      logger.error(error);
    } else {
      this.mailgun = createMailgunInstance({ apiKey: this.privateKey, domain: this.domain });
    }
    this._loadAndPrepareTemplates(_ => {
      cbfn();
    });
  }

  sendStoredMail(templateName, model, to, cbfn) {
    let html = this.generateHtml(templateName, model);
    let subject = this.templates[templateName].subject;
    this.sendMail({ to, subject, html }, cbfn);
  }

  sendMail({ to, subject, html } = {}, cbfn) {
    let data = {
      from: this.from,
      // NOTE: Change to 'to' during production
      to: 'shafayet.sayem@gmail.com',
      subject,
      html
    };
    if (this.enabled) {
      this.mailgun.messages().send(data, function (error, body) {
        return cbfn(error, body);
      });
    } else {
      let error = new Error("Email Sending Disabled By Developer");
      return cbfn(error);
    }

  }

}

exports.EmailService = EmailService;