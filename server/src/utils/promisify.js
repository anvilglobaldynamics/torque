
exports.promisify = (context, method, ...args)=> {
  return new Promise((success, fail)=> {
    args.push((err, ...res)=> {
      if (err) {
        fail(err);
        return 
      } else {
        success.apply(null, res);
      }
    })
    method.apply(context, args);
  });
}
