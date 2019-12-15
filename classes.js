//To make a player
class Player extends PIXI.Sprite{
    constructor(x=0, y=0){
        //placement
        super(PIXI.loader.resources["images/player.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(1);
        this.x = x;
        this.y = y;

        //Property
        this.health = 100;
    }
}

//To make a bullet
class Bullet extends PIXI.Graphics{
    //Placement
    constructor(color = 0xFFFFFF, x=0, y=0, side = 0){
        super();
        this.beginFill(color);
        this.drawRect(-2,-3,8,8);
        this.endFill();
        this.x = x;
        this.y =y;
        this.side = side;

        //Properties
        this.posX = 0;
        this.posY = 0;
        this.left = {x:-1,y:0};
        this.right = {x: 1, y:0};
        this.speed = 400;
        this.isAlive = true;
        this.bulletType = 0;
        Object.seal(this);
    }

    //Bullet Movement
    moveLeft(dt = 1/60){
        this.x += this.left.x * this.speed * dt;
        this.y += this.left.y * this.speed * dt;
    }
    moveRight(dt = 1/60){
        this.x += this.right.x * this.speed * dt;
        this.y += this.right.y * this.speed * dt;
    }
    moveUpLeft(dt = 1/60){
        this.x += -1 * this.speed * dt;
        this.y += -0.25 * this.speed * dt;
    }
    moveUpRight(dt = 1/60){
        this.x += this.speed * dt;
        this.y += -0.25 * this.speed * dt;
    }
    moveDownLeft(dt = 1/60){
        this.x += -1 * this.speed * dt;
        this.y += .25 * this.speed * dt;
    }
    moveDownRight(dt = 1/60){
        this.x += this.speed * dt;
        this.y += .25 * this.speed * dt;
    }
    moveOrbital(dt = 1/60){
        this.x += this.posX * this.speed * dt;
        this.y += this.posY * this.speed * dt;
    }
}

//To make a pirate
class Pirate extends PIXI.Sprite{
    constructor(x=0,y=0, speed=0){
        //Placement
        super(PIXI.loader.resources["images/enemy.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(1);
        this.x = x;
        this.y = y;
        this.speed = speed;

        //Properties
        this.delayLeft = 0;
        this.delayRight = 0;
        this.left = {x:-1,y:0};
        this.right = {x: 1, y:0};
        this.isAlive = true;

        //Additional Features
        this.extraCannon1 = false;
        this.extraCannon2 = false;
    }
}

//To make a boss
class Boss extends PIXI.Sprite{
    constructor(x=0,y=0){
        //Placement
        super(PIXI.loader.resources["images/enemy.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(1);
        this.x = x;
        this.y = y;
        this.speed = 2;

        //Properties
        this.delayLeft = 0;
        this.delayRight = 0;
        this.delayOrbit = 0;
        this.delayAt = 0;
        this.left = {x:-1,y:0};
        this.right = {x: 1, y:0};
        this.isAlive = true;
        this.health = 60;

        //Additional Features
        this.extraCannon1 = false;
        this.extraCannon2 = true;
        this.extraCannon3 = true;
        this.extraCannon4 = true;
    }
}