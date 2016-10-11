class Monkey{
    constructor(){
        this.children = [];
    }

    bootRoot(depth){
        let maxChildren = 5;

        for(let i = 0; i < maxChildren; i++)
        {
            if(Math.random() < .5 && depth < 3)
            {
                let newMonkey = new Monkey();
                this.children.push(newMonkey);
                newMonkey.bootRoot(depth + 1);
            }
        }
    }
}

