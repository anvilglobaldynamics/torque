
let fslib = require('fs');
let Handlebars = require('handlebars');
let { AsyncCollector } = require('baselib');
let pathlib = require('path')

class TemplateManager {

  constructor(config) {
    this.config = config;
  }

  _loadAndPrepareTemplates() {
    let templateList = [
      {
        name: 'generic-message',
        path: './src/templates/public/generic-message.html'
      }
    ]
    this.templates = {};
    for (let template of templateList) {
      let html = fslib.readFileSync(template.path, { encoding: 'utf8' });
      let compiledTemplate = Handlebars.compile(html);
      this.templates[template.name] = { compiledTemplate: compiledTemplate };
    }
  }

  generateHtml(templateName, model) {
    Object.assign(model, this.config.branding);
    return this.templates[templateName].compiledTemplate(model);
  }

  initialize(cbfn) {
    this._loadAndPrepareTemplates();
  }
}

exports.TemplateManager = TemplateManager;