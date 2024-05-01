export class Member{
    id:string;
    name:string;
    email:string;
    isAuthorised:boolean;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.email = "";
        this.isAuthorised = false;
    }

    authorise(){
        this.isAuthorised = true;
    }
    setEmail(newEmail: string){
        this.email = newEmail;
    }
}