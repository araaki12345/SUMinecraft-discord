import { MemberRepository } from "../interfaces/MemberRepository.js";
import { Member } from "../entities/Member.js";

export class AuthService {
  private memberRepository: MemberRepository;

  constructor(memberRepository: MemberRepository) {
    this.memberRepository = memberRepository;
  }

  async authenticateMember(id: string): Promise<string> {
    const member = await this.memberRepository.findById(id);
    if (!member) {
      // メンバーが見つからない場合は新規作成と認証
      const newMember = new Member(id, "Unknown");
      newMember.authorise();
      await this.memberRepository.save(newMember);
      return "Member was not found, created and authorised.";
    } else if (!member.isAuthorised) {
      // 既存のメンバーが未認証の場合は認証
      member.authorise();
      await this.memberRepository.update(member);
      return "Member was authorised.";
    } else {
      // 既に認証されている場合はその旨を返す
      return "Member is already authorised.";
    }
  }
}
