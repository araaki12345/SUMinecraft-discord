import { Client } from "discord.js";
import { Member } from "../entities/Member";
import { MemberRepository } from "./MemberRepository.js";

export class InMemoryMemberRepository implements MemberRepository {
  private static instance: InMemoryMemberRepository | null = null;
  private client: Client;
  private members: Member[] = [];

  private constructor(client: Client) {
    this.client = client;
  }

  public static getInstance(client: Client): InMemoryMemberRepository {
    if (!InMemoryMemberRepository.instance) {
      InMemoryMemberRepository.instance = new InMemoryMemberRepository(client);
    }
    return InMemoryMemberRepository.instance;
  }

  async findById(id: string): Promise<Member | null> {
    console.log(`Searching for member with ID: ${id}`);
    const member = this.members.find((member) => member.getId() === id);
    if (!member) {
      console.log("Member not found.");
    } else {
      console.log(`Member found: ${member.getId()}`);
    }
    return member || null;
  }

  async save(member: Member): Promise<void> {
    const existingIndex = this.members.findIndex(
      (m) => m.getId() === member.getId()
    );
    if (existingIndex !== -1) {
      this.members[existingIndex] = member;
    } else {
      this.members.push(member);
    }
  }

  async update(member: Member): Promise<void> {
    const index = this.members.findIndex((m) => m.getId() === member.getId());
    if (index !== -1) {
      this.members[index] = member;
    } else {
      throw new Error("Member not found.");
    }
  }

  async delete(id: string): Promise<void> {
    this.members = this.members.filter((m) => m.getId() !== id);
  }

  async findByEmail(email: string): Promise<Member | null> {
    return this.members.find((member) => member.getEmail() === email) || null;
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
}
