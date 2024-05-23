import { auth, db } from "../config/firebaseConfig.js";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { admin } from "../config/firebaseAdminConfig.js";

export const finishSignUp = async (email: string, link: string) => {
  if (isSignInWithEmailLink(auth, link)) {
    try {
      const result = await signInWithEmailLink(auth, email, link);
      console.log(`Successfully signed in as ${result.user.email}`);

      // Firestoreにユーザー情報を保存し、isAuthorisedフィールドを更新
      const userRef = doc(db, "members", result.user.uid);
      await setDoc(
        userRef,
        {
          email: result.user.email,
          isAuthorised: true,
        },
        { merge: true }
      );

      // Firebase Authenticationにユーザーを追加する
      if (result.user.email) {
        const additionalUserInfo = {
          email: result.user.email,
          emailVerified: true,
          displayName: result.user.displayName || undefined,
          uid: result.user.uid,
        };
        await admin.auth().createUser(additionalUserInfo);
      }
    } catch (error) {
      console.error("Error during sign in with email link:", error);
    }
  } else {
    console.error("The email link is not valid.");
  }
};
