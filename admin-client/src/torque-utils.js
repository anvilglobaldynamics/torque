
(_ => {
  if (window.TorqueUtils) return;
  window.TorqueUtils = {
    escapeHtmlEntities(str) {
      var map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;" // ' -> &apos; for XML only
      };
      return str.replace(/[&<>"']/g, function (m) { return map[m]; });
    },
    unescapeHtmlEntities(str) {
      var map = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": "\"",
        "&#39;": "'",
        "&apos;": "'"
      };
      return str.replace(/(&amp;|&lt;|&gt;|&quot;|&#39;|&apos;)/g, function (m) { return map[m]; });
    },
    desanitize(object) {
      if (typeof (object) === 'string') return TorqueUtils.unescapeHtmlEntities(object);
      if (typeof (object) === 'object' && object !== null) {
        if (Array.isArray(object)) {
          for (let i = 0; i < object.length; i++) {
            object[i] = TorqueUtils.desanitize(object[i]);
          }
        } else {
          let keys = Object.keys(object);
          for (let i = 0; i < keys.length; i++) {
            object[keys[i]] = TorqueUtils.desanitize(object[keys[i]]);
          }
        }
      }
      return object;
    }
  }
})();
