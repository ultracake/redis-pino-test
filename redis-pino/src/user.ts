
class user{

    name:string;

    constructor(name:string){

        this.name = name;
    }

    changeName(newName:string) {
        this.name = newName;
    }

    cal(n1:number, n2:number){
        return n1*n2;
    }

}

module.exports = user;