export class Member {
  private id: string;
  private email: string;
  private authorised: boolean;

  constructor(id: string, email: string, authorised: boolean = false) {
    this.id = id;
    this.email = email;
    this.authorised = authorised;
  }

  public authorise() {
    this.authorised = true;
  }

  public setEmail(email: string) {
    this.email = email;
  }

  public getId() {
    return this.id;
  }

  public getEmail() {
    return this.email;
  }

  public isAuthorised(): boolean {
    return this.authorised;
  }
}
