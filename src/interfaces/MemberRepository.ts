import { Member } from "../entities/Member";

export interface MemberRepository {
    save(member: Member): Promise<void>;
    update(member: Member): Promise<void>;
    findById(id: string): Promise<Member | null>;
}