
exports.detectMode = _ => {
  let mode = process.env.TORQUE_MODE;
  if (['production', 'development'].indexOf(mode) === -1) {
    mode = 'development';
  }
  return mode;
}