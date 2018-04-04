exports.verses = {
  UserLoginApi: {
    userNotFound: "এই ইমেল/ফোন আর পাসওয়ার্ড দিয়ে কোনো একাউন্ট খুঁজে পাওয়া যায় নি।",
    userBanned: "আপনাকে আমাদের সিস্টেম থেকে বহিঃস্ক্রিত করা হয়েছে। পরিচালক এর সাথে যোগাযোগ করুন।",
    userRequiresPhoneVerification: "আপনাকে আপনার ফোন নম্বরটি যাচাই করতে হবে।",
    userRequiresEmailVerification: "আপনাকে আপনার ফইমেলটি যাচাই করতে হবে।",
    phoneVerificationRequestNotFound: "ফোন যাচাইকরণ অনুরোধ পাওয়া যায়নি।",
    emailVerificationRequestNotFound: "ইমেল যাচাইকরণ অনুরোধ পাওয়া যায় নি।"
  },
  collectionCommon: {
    genericUpdateFailureFn: (collectionName => `পরিবর্তন এর জন্য পাওয়া যায়নি ${collectionName}.`),
    genericDeleteFailureFn: (collectionName => `অপসারণ এর জন্য পাওয়া যায়নি ${collectionName}.`),
    genericDiscardFailureFn: (collectionName => `বাতিল এর জন্য পাওয়া যায়নি ${collectionName}.`)
  },
  session: {
    sessionNotFound: "Session পাওয়া যায় নি।"
  },
  userCommon: {
    userDoesNotExist: "এই ইমেইল/ফোন এর সাথে সম্পৃক্ত ব্যাবহারকারী খুঁজে পাওয়া যায় নি।",
    userInvalid: "অবৈধ ব্যবহারকারী পাওয়া যায়নি।"
  },
  userNotificationCommon: {
    yourPasswordHasChanged: "Your password has changed."
  }
}