exports.verses = {
  UserLoginApi: {
    userNotFound: "No user matched the email and password combination.",
    userBanned: "You have been banned from our system. Contact our admin.",
    userRequiresPhoneVerification: "You need to verify your phone number.",
    userRequiresEmailVerification: "You need to verify your email.",
    phoneVerificationRequestNotFound: "Phone verification request not found.",
    emailVerificationRequestNotFound: "Email verification request not found."
  },
  collectionCommon: {
    genericUpdateFailureFn: (collectionName => `Unable to find ${collectionName} to update.`),
    genericDeleteFailureFn: (collectionName => `Unable to find ${collectionName} to delete.`),
    genericDiscardFailureFn: (collectionName => `Unable to find ${collectionName} to discard.`)
  }
}