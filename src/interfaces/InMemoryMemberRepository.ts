import { Member } from '../entities/Member';
import { MemberRepository } from './MemberRepository';

export class InMemoryMemberRepository implements MemberRepository {
    private members: Member[] = [];

    async findById(id: string): Promise<Member | null> {
        return this.members.find(member => member.id === id) || null;
    }

    async save(member: Member): Promise<void> {
        const existingIndex = this.members.findIndex(m => m.id === member.id);
        if (existingIndex !== -1) {
            this.members[existingIndex] = member;
        } else {
            this.members.push(member);
        }
    }
    async update(member: Member): Promise<void> {
        const index = this.members.findIndex(m => m.id === member.id);
        if (index !== -1) {
            this.members[index] = member;
        } else {
            throw new Error("Member not found.");
        }
    }

    async delete(member: Member): Promise<void> {
        this.members = this.members.filter(m => m.id !== member.id);
    }

    async findByEmail(email: string): Promise<Member | null> {
        return this.members.find(member => member.email === email) || null;
    }
}