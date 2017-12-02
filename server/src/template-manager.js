
let fslib = require('fs');
let Handlebars = require('handlebars');
let { AsyncCollector } = require('baselib');
let pathlib = require('path')

class TemplateManager {

  constructor(config) {
    this.config = config;
  }

  _loadAndPrepareTemplates(cbfn) {
    let templateList = [
      {
        name: 'generic-message',
        path: './src/templates/public/generic-message.html'
      }
    ]
    let collector = new AsyncCollector(templateList.length);
    for (let template of templateList) {
      let html = fslib.readFileSync(template.path, { encoding: 'utf8' });
      let compiledTemplate = Handlebars.compile(html);
      collector.collect(template.name, { compiledTemplate: compiledTemplate });
    }
    collector.finally((collection) => {
      this.templates = collection;
      cbfn();
    })
  }

  generateHtml(templateName, model) {
    Object.assign(model, this.config.branding);
    return this.templates[templateName].compiledTemplate(model);
  }

  initialize(cbfn) {
    this._loadAndPrepareTemplates(_ => {
      cbfn();
    })
  }
}

exports.TemplateManager = TemplateManager;