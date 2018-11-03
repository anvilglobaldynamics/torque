exports.callbackify = (promise, cbfn) => {

  if (typeof (promise.then) !== 'function') {
    cbfn(new TypeError('Expected a promise'));
  }

  if (typeof (cbfn) !== 'function') {
    console.error(new TypeError('Expected a callback function'));
    return
  }

  let hasBeenCalled = false;

  promise.then(data => {
    if (!hasBeenCalled) {
      hasBeenCalled = true;
      setImmediate(cbfn, null, data);
    }
  }, err => {
    if (!hasBeenCalled) {
      hasBeenCalled = true;
      setImmediate(cbfn, err);
    }
  });

}