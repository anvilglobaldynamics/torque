exports.verses = {
  genericServerError: "সার্ভার এর ত্রুটি। পরিচালককে অবগত করা হয়েছে।",
  userLoginApi: {
    userNotFound: "এই ইমেল/ফোন আর পাসওয়ার্ড দিয়ে কোনো একাউন্ট খুঁজে পাওয়া যায় নি।",
    userBanned: "আপনার লিপি একাউন্ট সাময়িক ভাবে বন্ধ করা হয়েছে। অনুগ্রহ করে যোগাযোগ করুন; 01770947908 অথবা care@anvil.live",
    userRequiresPhoneVerification: "আপনাকে আপনার ফোন নম্বরটি যাচাই করতে হবে।",
    userRequiresEmailVerification: "আপনাকে আপনার ইমেলটি যাচাই করতে হবে। আপনার ফোন নম্বর দিয়ে লগ ইন করার চেষ্টা করুন এবং তারপরে আপনার ইমেল যাচাই করুন।",
    phoneVerificationRequestNotFound: "ফোন যাচাইকরণ অনুরোধ পাওয়া যায়নি।",
    emailVerificationRequestNotFound: "ইমেল যাচাইকরণ অনুরোধ পাওয়া যায় নি।"
  },
  duplicationCommon: {
    emailAlreadyInUse: "প্রদত্ত ইমেল ব্যবহৃত।",
    phoneAlreadyInUse: "প্রদত্ত ফোন নম্বরটি ব্যবহৃত।",
    emailOrPhoneAlreadyInUse: "প্রদত্ত ইমেল/ফোন নম্বরটি ব্যবহৃত।"
  },
  collectionCommon: {
    genericUpdateFailureFn: (collectionName => `পরিবর্তন এর জন্য পাওয়া যায়নি ${collectionName}.`),
    genericDeleteFailureFn: (collectionName => `অপসারণ এর জন্য পাওয়া যায়নি ${collectionName}.`),
    genericDiscardFailureFn: (collectionName => `বাতিল এর জন্য পাওয়া যায়নি ${collectionName}.`)
  },
  sessionCommon: {
    sessionNotFound: "Session পাওয়া যায় নি।"
  },
  userCommon: {
    userDoesNotExist: "এই ইমেইল/ফোন এর সাথে সম্পৃক্ত ব্যাবহারকারী খুঁজে পাওয়া যায় নি।",
    userInvalid: "অবৈধ ব্যবহারকারী পাওয়া যায়নি।"
  },
  adminCommon: {
    packageInvalid: "প্যাকেজ পাওয়া যায়নি।",
    moduleInvalid: "মডিউল খুঁজে পাওয়া যায়নি।"
  },
  organizationCommon: {
    organizationInvalid: "প্রবেশাধিকার নিয়ন্ত্রণকালে প্রতিষ্ঠান খুঁজে পাওয়া যায়নি।",
    organizationDoesNotExist: "সংস্থার অস্তিত্ব নেই",
    userNotEmployedByOrganization: "ব্যবহারকারী প্রতিঠানের অন্তর্গত নয়।"
  },
  accessControlCommon: {
    accessControlUnmetPrivileges: "যথেষ্ট বিশেষাধিকার নেই। এই কর্ম নিম্নলিখিত বিশেষাধিকার প্রয়োজন - "
  },
  apiCommon: {
    apiNotHandled: "API ব্যবহার করা হয়নি।",
    apiKeyMissing: "Developer Error: apiKey is missing from body.",
    apikeyInvalid: "অবৈধ apiKey প্রদান!",
    apikeyExpired: "মেয়াদউত্তীর্ণ apiKey প্রদান!"
  },
  userNotificationCommon: {
    yourPasswordHasChanged: "আপনার পাসওয়ার্ড পরিবর্তন হয়েছে। আপনি লগইন সংক্রান্ত কোনো সমস্যার সম্মুখীন হলে আমাদের হটলাইনে যোগাযোগ করুন।"
  },
  packageLimitCommon: {
    activePackageLimitReached: "সংস্থার সক্রিয় প্যাকেজে এই কাজটি করা যাবে না।"
  }
}