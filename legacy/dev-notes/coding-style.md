
# eslint
Many style checks are automatically inforced by elsint. 

To install it - 

```sh
npm install -g eslint
```

To use it with vscode
install the `ESlint` module

# class and id naming
Contrary to popular usage, the hyphenated naming scheme is discouraged. Instead, use camelcasing. For example, use `loginForm` instead of `login-form` and so on.

However, where it is important to indiciate a parent-child relationship (i.e. for clarity), use double hyphens in between qualified names. ie. `loginForm--fullName` etc.

