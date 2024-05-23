import admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";
import serviceAccount from "../../suminecraft-a8147.json" assert { type: "json" };
import dotenv from "dotenv";

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

export { admin };
