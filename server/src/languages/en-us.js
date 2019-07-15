exports.verses = {
  genericServerError: "Server error occurred. Admin has been notified.",
  userLoginApi: {
    userNotFound: "No user matched the email/phone and password combination.",
    userBanned: "Your Lipi account has been temporarily blocked. Please contact 01770947908 or care@anvil.live",
    userRequiresPhoneVerification: "You need to verify your phone number.",
    userRequiresEmailVerification: "You need to verify your email. Try logging in with your phone number and then verify your email.",
    phoneVerificationRequestNotFound: "Phone verification request not found.",
    emailVerificationRequestNotFound: "Email verification request not found."
  },
  duplicationCommon: {
    emailAlreadyInUse: "Provided email address is already in use",
    phoneAlreadyInUse: "Provided phone number is already in use"
  },
  collectionCommon: {
    genericUpdateFailureFn: (collectionName => `Unable to find ${collectionName} to update.`),
    genericDeleteFailureFn: (collectionName => `Unable to find ${collectionName} to delete.`),
    genericDiscardFailureFn: (collectionName => `Unable to find ${collectionName} to discard.`)
  },
  sessionCommon: {
    sessionNotFound: "Session Not Found."
  },
  userCommon: {
    userDoesNotExist: "User with this phone/email does not exist.",
    userInvalid: "Invalid User could not be found."
  },
  adminCommon: {
    packageInvalid: "Invalid Package. Package could not be found.",
    moduleInvalid: "Invalid Module. Module could not be found."
  },
  organizationCommon: {
    organizationInvalid: "Organization could not be found during access control.",
    organizationDoesNotExist: "Organization does not exist",
    userNotEmployedByOrganization: "User does not belong to organization."
  },
  accessControlCommon: {
    accessControlUnmetPrivileges: "Unmet privileges. This action requires the following privileges - "
  },
  apiCommon: {
    apiNotHandled: "Api Not Handled.",
    apiKeyMissing: "Developer Error: apiKey is missing from body.",
    apikeyInvalid: "Invalid apiKey Provided!",
    apikeyExpired: "Expired apiKey Provided!"
  },
  userNotificationCommon: {
    yourPasswordHasChanged: "Your password has changed. If you did not make this change, please contact our hotline below to recover your account."
  },
  packageLimitCommon: {
    activePackageLimitReached: "This action is not allowed in the organization's currently activated package."
  }
}