
class ConsumerManager {

  constructor() {
    this.__consumerMap = {};
    this.__seed = 0;
  }

  addConsumer(ws) {
    ws.isConsumer = true;
    ws.consumerId = this.__seed;
    this.__seed += 1;
    this.__consumerMap[ws.consumerId] = ws;
  }

  removeConsumer(ws) {
    delete this.__consumerMap[ws.consumerId];
  }

  getConsumer(consumerId) {
    return this.__consumerMap[consumerId];
  }

}

exports.ConsumerManager = ConsumerManager;

