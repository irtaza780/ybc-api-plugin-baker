import genericOtpFunc from "../../util/genericOtpFunc.js";
import password_1 from "@accounts/password";
import server_1 from "@accounts/server";
import ReactionError from "@reactioncommerce/reaction-error";

export default async function bakerRegistration(_, args, context, info) {
  const { injector, infos, collections } = context;

  const { user, profile } = args;

  const accountsServer = injector.get(server_1.AccountsServer);
  const accountsPassword = injector.get(password_1.AccountsPassword);
  const { Accounts, users, Groups } = collections;
  let userId;
  user["email"] = user.email.toLowerCase();

  const bakerGroup = await Groups.findOne({ slug: "system-manager" });
  if (!bakerGroup)
    throw new ReactionError(
      ("access-denied", "Baker Group Not found, invalid permission")
    );

  const bakerGroupId = bakerGroup._id;

  if (!(user?.email || user.username)) {
    throw new ReactionError(
      "invalid-parameter",
      "Please provide either an email address or a phone number to proceed."
    );
  }
  //pending payment verification when allowing baker registration
  console.log("subscribed as baker");

  //we will check whether the registration is for an already existing user/customer
  const existingUser = await Accounts.findOne({
    "emails.0.address": user.email,
  });

  console.log("existing user is ", existingUser);

  // if the user already exist as a baker
  if (existingUser?.isBaker) {
    throw new ReactionError(
      "access-denied",
      "You are already registered as a baker"
    );
  }

  //if the user is already registered as a customer
  if (existingUser) {
    console.log("coming to existing user condition");

    await Accounts.updateOne(
      {
        "emails.0.address": user.email,
      },
      {
        $set: {
          isBaker: true,
          isActiveBaker: true,
        },
        $push: { groups: bakerGroupId },
      }
    );
    const loginResult = await accountsServer.loginWithUser(createdUser, infos);
    return { userId: existingUser.userId, loginResult };
  }

  if (user.username) {
    user.username = "p" + user.username;
    console.log("new user name is ", user.username);
  }

  try {
    console.log("coming to non existing user condition");
    userId = await accountsPassword.createUser(user);
  } catch (error) {
    // If ambiguousErrorMessages is true we obfuscate the email or username already exist error
    // to prevent user enumeration during user creation
    if (
      accountsServer.options.ambiguousErrorMessages &&
      error instanceof server_1.AccountsJsError &&
      (error.code === password_1.CreateUserErrors.EmailAlreadyExists ||
        error.code === password_1.CreateUserErrors.UsernameAlreadyExists)
    ) {
      return {};
    }
    throw error;
  }
  if (!accountsServer.options.enableAutologin) {
    return {
      userId: accountsServer.options.ambiguousErrorMessages ? null : userId,
    };
  }

  const adminCount = await Accounts.findOne({
    _id: userId,
  });
  console.log("adminCount", adminCount);
  if (userId) {
    const account = {
      _id: userId,
      acceptsMarketing: false,
      emails: [
        {
          address: user.email,
          verified: false,
          provides: "default",
        },
      ],
      groups: [bakerGroupId],
      name: null,
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        state: profile.state,
        city: profile.city,
        phone: profile.phone,
      },
      shopId: null,
      state: "new",
      userId: userId,
      isDeleted: false,
      type: user.type,
      isBaker: true,
      isActiveBaker: true,
    };
    await Accounts.insertOne(account);
  }
  // When initializing AccountsServer we check that enableAutologin and ambiguousErrorMessages options
  // are not enabled at the same time
  const createdUser = await accountsServer.findUserById(userId);
  // If we are here - user must be created successfully
  // Explicitly saying this to Typescript compiler
  // const loginResult = await accountsServer.loginWithUser(createdUser, infos);
  //console.log("Login Result ", loginResult);

  let genericOtpResponse = await genericOtpFunc(createdUser, context);

  const loginResult = await accountsServer.loginWithUser(createdUser, infos);
  return {
    userId,
    loginResult,
    createdUser,
  };
}
