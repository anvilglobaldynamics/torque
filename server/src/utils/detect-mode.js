
exports.detectMode = _ => {
  let mode = process.env.NODE_ENV;
  if (['production', 'development'].indexOf(mode) === -1) {
    mode = 'development';
  }
  return mode;
}