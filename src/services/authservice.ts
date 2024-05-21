import { auth } from "../config/firebaseConfig.js";
import { sendSignInLinkToEmail } from "firebase/auth";

// 関数の引数に適切な型を指定
export const sendAuthenticationLink = (email: string) => {
  const actionCodeSettings = {
    url: "https://discord.com",
    handleCodeInApp: true,
  };

  sendSignInLinkToEmail(auth, email, actionCodeSettings)
    .then(() => {
      console.log("Authentication link sent successfully.");
    })
    .catch((error) => {
      console.error("Failed to send authentication link:", error);
    });
};
