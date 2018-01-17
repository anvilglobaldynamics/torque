module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "semi": [
            "error",
            "always"
        ],
        "getter-return": [
            "error"
        ],
        curly: ["error", "multi-line", "consistent"],
        eqeqeq: ["error", "always"],
        "no-floating-decimal": "error",
        "no-implicit-coercion": "error",
        "no-implicit-globals": "error",
        "no-loop-func": "error",
        "no-multi-spaces": "error",
        "key-spacing": ["error", { "mode": "strict" }],
        "no-multi-str": "error",
        "no-new-wrappers": "error",
        "no-redeclare": "error",
        "no-return-assign": "error",
        "no-return-await": "error",
        "no-self-compare": "error",
        "no-sequences": "error",
        "no-throw-literal": "error",
        "no-unused-expressions": "error",
        "no-useless-concat": "error",
        "no-useless-escape": "error",
        "no-warning-comments": ["warn", { "terms": ["todo", "fixme"], "location": "start" }],
        "yoda": ["error", "never", { "exceptRange": true }],
        "wrap-iife": ["error", "outside"],
        "vars-on-top": "error",
        "radix": ["error", "as-needed"],
        "prefer-promise-reject-errors": ["error", { "allowEmptyReject": true }],
        "no-delete-var": "error",
        "no-undef": ["error", { "typeof": true }],
        "no-undef-init": "error",
        "no-use-before-define": "error",
        "callback-return": ["error", ["done", "callback", "cbfn", "cb"]],
        "global-require": "error",
        "handle-callback-err": ["error", "error"],
        "no-new-require": "error",
        "no-path-concat": "error",
        "array-bracket-newline": ["error", "consistent"],
        "array-bracket-spacing": ["error", "never"],
        "block-spacing": "error",
        "brace-style": "error",
        "camelcase": "error",
        "no-unused-vars": ["error", { "vars": "all", "args": "none" }],
        "linebreak-style": [0, "windows"]
    }
};