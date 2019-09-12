

let path = './src/fixtures/privilege-list.json';

const Joi = require('joi');

exports.getPrivilegeListFromJson = () => {
  let jsonData = require('fs').readFileSync(path, 'utf8');
  let privilegeObjectList = JSON.parse(jsonData);
  
  return privilegeObjectList.map(privilegeObject => privilegeObject.code);
}

exports.getPrivilegesFromJson = () => {
  let jsonData = require('fs').readFileSync(path, 'utf8');
  let privilegeObjectList = JSON.parse(jsonData);

  let privileges = {};
  for (let privilegeObject of privilegeObjectList) {
    privileges[privilegeObject.code] = true;
  }

  return privileges;
}

exports.getPrivilegesSchemaFromJson = () => {
  let jsonData = require('fs').readFileSync(path, 'utf8');
  let privilegeObjectList = JSON.parse(jsonData);

  let privileges = {};
  for (let privilegeObject of privilegeObjectList) {
    privileges[privilegeObject.code] = Joi.boolean().required();
  }

  let schema = Joi.object().required().keys(privileges);
  return schema;
}