
class ProducerManager {

  constructor() {
    this.__producerList = [];
    this.__index = 0;
  }

  addProducer(ws) {
    ws.__isContentProducer = true;
    this.__producerList.push(ws);
  }

  removeProducer(ws) {
    let index = this.__producerList.indexOf(ws);
    if (index > -1) {
      this.__producerList.splice(index, 1);
    }
    return (index > -1);
  }

  getNextProducer() {
    if (this.__index >= this.__producerList.length) this.__index = 0;
    let producer = this.__producerList[this.__index];
    this.__index += 1;
    return producer;
  }

}

exports.ProducerManager = ProducerManager;

