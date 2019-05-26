
const toEscapeList = [
  // order matters for these
  "-"
  , "["
  , "]"
  // order doesn't matter for any of these
  , "/"
  , "{"
  , "}"
  , "("
  , ")"
  , "*"
  , "+"
  , "?"
  , "."
  , "\\"
  , "^"
  , "$"
  , "|"
];

// NOTE: old approaches
// kept for reference
// return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
// return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

exports.escapeRegExp = (str) => {

  return str
    .split('')
    .map(char => {
      if (toEscapeList.indexOf(char) > -1) {
        return "\\" + char;
      } else {
        return char;
      }
    })
    .join('');

}
