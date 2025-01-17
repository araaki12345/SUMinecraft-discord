import { Member } from "../entities/Member.js";

export interface MemberRepository {
  save(member: Member): Promise<void>;
  update(member: Member): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Member | null>;
  findByEmail(email: string): Promise<Member | null>;
  sendMessage(id: string, message: string): Promise<void>;
}
