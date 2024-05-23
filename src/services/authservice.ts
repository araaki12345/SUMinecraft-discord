import { auth } from "../config/firebaseConfig.js";
import {
  ActionCodeSettings,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

// 関数の引数に適切な型を指定
export const sendAuthenticationLink = async (email: string) => {
  const actionCodeSettings: ActionCodeSettings = {
    url: "https://discord.com",
    handleCodeInApp: true,
  };

  try {
    const user = await createUserWithEmailAndPassword(auth, email, "password");
    await sendEmailVerification(user.user, actionCodeSettings);
  } catch (error) {
    console.error("Failed to send authentication link:", error);
  }
};
