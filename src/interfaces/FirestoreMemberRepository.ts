import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig.js";
import { MemberRepository } from "./MemberRepository.js";
import { Member } from "../entities/Member.js";
import { Client } from "discord.js";

export class FirestoreMemberRepository implements MemberRepository {
  private collectionRef = collection(db, "members");
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async findById(id: string): Promise<Member | null> {
    const memberDoc = await getDoc(doc(this.collectionRef, id));
    if (memberDoc.exists()) {
      const data = memberDoc.data();
      return new Member(data.id, data.email, data.isAuthorised); // Remove data.name argument
    }
    return null;
  }
  async findByEmail(email: string): Promise<Member | null> {
    const q = query(this.collectionRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return new Member(data.id, data.email, data.isAuthorised);
    }
    return null;
  }

  async save(member: Member): Promise<void> {
    await setDoc(doc(this.collectionRef, member.getId()), {
      id: member.getId(),
      email: member.getEmail(),
      isAuthorised: member.isAuthorised(),
    });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.collectionRef, id));
  }

  async sendMessage(memberId: string, message: string): Promise<void> {
    try {
      const user = await this.client.users.fetch(memberId);
      await user.send(message);
      console.log(`Message successfully sent to ${memberId}: ${message}`);
    } catch (error) {
      console.error(`Failed to send message to ${memberId}: ${error}`);
    }
  }

  async update(member: Member): Promise<void> {
    await updateDoc(doc(this.collectionRef, member.getId()), {
      email: member.getEmail(),
      isAuthorised: member.isAuthorised(),
    });
  }
}
