exports.verses = {
  genericServerError: "Server error occurred. Admin has been notified.",
  userLoginApi: {
    userNotFound: "No user matched the email and password combination.",
    userBanned: "You have been banned from our system. Contact our admin.",
    userRequiresPhoneVerification: "You need to verify your phone number.",
    userRequiresEmailVerification: "You need to verify your email.",
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
  organizationCommon: {
    organizationInvalid: "Organization could not be found during access control.",
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
    yourPasswordHasChanged: "Your password has changed."
  }
}