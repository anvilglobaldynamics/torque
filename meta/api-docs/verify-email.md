
This API handles verification of an email address.

url: `verify-email/${verificationToken}`

method: `GET`

### request: 
```
{}
```

### response (on error):
Shows an html page describing the error.

### response (on success):
Shows an html page thanking the user.

### notes:
updates the `user` and `email-verification-request` collections in db.

