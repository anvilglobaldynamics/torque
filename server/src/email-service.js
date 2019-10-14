
let createMailgunInstance = require('mailgun-js');
let fslib = require('fs-extra');
let Handlebars = require('handlebars');
let inlineCss = require('inline-css');
let pathlib = require('path');

class EmailService {

  constructor(config, mode, database) {
    this.config = config;
    this.mode = mode;
    let { privateKey, domain, from, enabled } = config.email;
    this.privateKey = privateKey;
    this.domain = domain;
    this.from = from;
    this.database = database;
    this.enabled = enabled;
  }

  async _loadAndPrepareTemplates() {
    let branding = this.config.branding;
    let cssFilePath = './src/templates/email/common.css';
    let css = fslib.readFileSync(cssFilePath, { encoding: 'utf8' });
    let templateList = [
      {
        name: 'en-us--email-verification',
        path: './src/templates/email/en-us--email-verification.html',
        subject: `Verify your email for ${branding.shortName}`
      },
      {
        name: 'en-us--password-reset',
        path: './src/templates/email/en-us--password-reset.html',
        subject: `Your password reset code for ${branding.shortName}`
      },
      {
        name: 'en-us--generic-message',
        path: './src/templates/email/en-us--generic-message.html',
        subject: `Message from ${branding.shortName}`
      },
      {
        name: 'bn-bd--email-verification',
        path: './src/templates/email/bn-bd--email-verification.html',
        subject: `Verify your email for ${branding.shortName}`
      },
      {
        name: 'bn-bd--password-reset',
        path: './src/templates/email/bn-bd--password-reset.html',
        subject: `Your password reset code for ${branding.shortName}`
      },
      {
        name: 'bn-bd--generic-message',
        path: './src/templates/email/bn-bd--generic-message.html',
        subject: `Message from ${branding.shortName}`
      },
      // Receipt
      {
        name: 'en-us--receipt',
        path: './src/templates/email/receipt.html',
        subject: `Receipt - Lipi for Business`
      },
      {
        name: 'bn-bd--receipt',
        path: './src/templates/email/receipt.html',
        subject: `Receipt - Lipi for Business`
      }
    ];

    this.templates = {};
    await Promise.all(templateList.map(template => new Promise((accept, reject) => {
      let html = fslib.readFileSync(template.path, { encoding: 'utf8' });
      let url = 'file://' + pathlib.join(__dirname, '../', template.path);
      inlineCss(html, {
        url: url,
        extraCss: css
      }).then((html) => {
        let compiledTemplate = Handlebars.compile(html);
        this.templates[template.name] = { compiledTemplate: compiledTemplate, subject: template.subject };
        accept();
      });
    })));
  }

  generateHtml(templateName, model) {
    Object.assign(model, this.config.branding);
    return this.templates[templateName].compiledTemplate(model);
  }

  async initialize(logger) {
    if (!this.privateKey) {
      let error = new Error("No privateKey found in mailgun. Sending mail will not work.");
      logger.error(error);
    } else {
      this.mailgun = createMailgunInstance({ apiKey: this.privateKey, domain: this.domain });
    }
    return await this._loadAndPrepareTemplates();
  }

  async sendStoredMail(clientLanguage, templateName, model, to) {
    templateName = clientLanguage + '--' + templateName;
    let html = this.generateHtml(templateName, model);
    let subject = this.templates[templateName].subject;
    return await this.sendMail({ to, subject, html });
  }

  async sendMail({ to, subject, html } = {}) {
    let actualTo = to;
    // NOTE: Uncomment in case making sensitive changes to email service.
    // if (this.mode !== 'production') {
    //   actualTo = 'ignore@anvil.live';
    // }
    let data = {
      from: this.from,
      to: actualTo,
      subject,
      html
    };
    let results = await new Promise((accept, reject) => {
      if (this.enabled) {
        this.mailgun.messages().send(data, function (error, body) {
          return accept([error, false, body, data]);
        });
      } else {
        let error = new Error("Email Sending Disabled By Developer");
        return accept([error, true, null, data]);
      }
    });

    { // handle logging of email in a new scope
      let status = 'pending';

      let [err, isDeveloperError, response, finalBody] = results;
      if (!err && !isDeveloperError && response.message === 'Queued. Thank you.') {
        status = 'sent';
      }

      let newData = { status };
      Object.assign(newData, data);
      await this.database.outgoingEmail.create(newData);
    }

    return results;
  }

}

exports.EmailService = EmailService;