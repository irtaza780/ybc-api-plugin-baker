
import {sendEmailOTP, generatePhoneOtp, verifyOTP } from "./otp.js";

export default async function genericOtpFunc(createdUser, ctx) {
  let data;
  if (createdUser.type == "phoneNo" && createdUser?.username) {
    data = await generatePhoneOtp(ctx, createdUser.username, userId);
  }
  if (createdUser.type == "email" && createdUser.emails.length) {
    data = await sendEmailOTP(ctx, createdUser.emails[0].address, "temp");
  }

  return data;
}
