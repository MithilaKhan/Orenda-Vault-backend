import generateOTP from "../../../util/generateOTP";
import { User } from "../user/user.model";
import { emailTemplate } from "../../../shared/emailTemplate";
import { emailHelper } from "../../../helpers/emailHelper";

const unverifiedAccountHandle = async (email: string): Promise<number> => {
  const otp = generateOTP();
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  const user = await User.findOne({ email });
  await User.findOneAndUpdate({ email }, { $set: { authentication } });
  const values = {
    otp: otp,
    email: email,
    name: user?.name!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  await emailHelper.sendEmail(createAccountTemplate);
  return otp;
};

export const AuthHelper = {
  unverifiedAccountHandle,
};