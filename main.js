"use strict";
//~~~~~~~~~Creating the Playzone~~~~~~~~~
const app = new PIXI.Application(
    {
        width: 800,
        height: 600,
        backgroundColor: 0xAAAAAA
    }
);

//~~~~~~~~~Keyboard Event Handlers~~~~~~~~~
window.addEventListener("keydown", keysDown);
window.addEventListener("keyup", keysUp);

//~~~~~~~~~Preload assets~~~~~~~~~
PIXI.loader.add(["images/player.png","images/enemy.png"]);
PIXI.loader.onProgress.add(showProgress);
PIXI.loader.onComplete.add(doneLoading);
PIXI.loader.onError.add(reportError);
PIXI.loader.load(setup);

//Global Variables
let player;
let pirates = [], bullets = [], enemyBullets = [];
let keys = {};
let titleScreen, gameScreen, endScreen, controlScreen;
let delayLeft = 0, delayRight = 0;
let tempSide;
let levelNum = 0, survivalTime = 0, score = 0, highScore = 0;
let textScore, textFinalScore, textHealth, textHighScore;
let shootSound, hitSound;

//To create the base game and instantiate the gamer
function setup(){
    //Load in the local storage
    let listID = "ldv9727";
    let items = localStorage.getItem(listID);
    highScore = items;

    document.querySelector("#gameZone").appendChild(app.view);

    app.ticker.add(gameLoop);

    //~~~~~~~~~Screen creation~~~~~~~~~
    titleScreen = new PIXI.Container();
    gameScreen = new PIXI.Container();
    endScreen = new PIXI.Container();
    controlScreen = new PIXI.Container();

    screenSetup();

    titleScreen.visible = true;
    gameScreen.visible = false;
    endScreen.visible = false;
    controlScreen.visible = false;

    app.stage.addChild(titleScreen);
    app.stage.addChild(controlScreen);
    app.stage.addChild(gameScreen);
    app.stage.addChild(endScreen);

    //Loading the player and placing it in the center of the map
    player = new Player(app.view.width/2,app.view.height/2);
    gameScreen.addChild(player);

    //Load Sounds
    shootSound = new Howl({
        src: ['sounds/shoot.wav']
    });
    
    hitSound = new Howl({
        src: ['sounds/hit.wav']
    });
}

//To create the screens
function screenSetup(){
    //~~~~~~~~~Screen Setup~~~~~~~~~
    //Generic Text Styles
    //Title/ important
    let styleBig = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 50,
        fontFamily: "Arial",
        fontStyle: "bold",
        stroke: 0xFFFFFF,
        strokeThickness: 3
    });
    let style = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 40,
        fontFamily: "Arial",
        fontStyle: "bold",
        stroke: 0xFFFFFF,
        strokeThickness: 3
    });
    //Simple Text
    let styleSmall = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 30,
        fontFamily: "Arial",
        fontStyle: "bold",
        stroke: 0xFFFFFF,
        strokeThickness: 2,
    });

    //Title screen
    let redRect = new PIXI.Graphics();
    redRect.beginFill(0xac7339);
    redRect.drawRect(0,0,app.view.width,app.view.height);
    titleScreen.addChild(redRect);

    //Title Text
    let text1 = new PIXI.Text("Colonies: Pirate's Water");
    text1.anchor.set(0.5);
    text1.x = app.view.width/2;
    text1.y = app.view.height * (1/5);
    text1.style = styleBig;
    titleScreen.addChild(text1);

    //Info Text
    let infoText = new PIXI.Text(
        "Can you captain your crew through\n" +
        "          pirate infested waters?");
    infoText.anchor.set(0.5);
    infoText.x = app.view.width/2;
    infoText.y = app.view.height * (2/5);
    infoText.style = styleSmall;
    titleScreen.addChild(infoText);

    //Play Button
    let text5 = new PIXI.Text("Play");
    text5.anchor.set(0.5);
    text5.x = app.view.width/2;
    text5.y = app.view.height * (3/5);
    text5.style = style;
    text5.interactive = true;
    text5.buttonMode = true;
    titleScreen.addChild(text5);
    text5.on("pointerup", startControls);
    text5.on("pointerover", e => e.target.alpha = 0.7);
    text5.on("pointerout", e => e.currentTarget.alpha = 1.0);

    //Control Screen
    let controlRect = new PIXI.Graphics();
    controlRect.beginFill(0xac7339);
    controlRect.drawRect(0,0,app.view.width,app.view.height);
    controlScreen.addChild(controlRect);

    //Control Title
    let controlTitle = new PIXI.Text("Controls");
    controlTitle.anchor.set(0.5);
    controlTitle.x = app.view.width/2;
    controlTitle.y = app.view.height * (1/10);
    controlTitle.style = style;
    controlScreen.addChild(controlTitle);

    //Controls
    let controlText = new PIXI.Text(
        "                W = Move Forward\n" + 
        "                A = Move Left\n" + 
        "                S = Move Down\n" + 
        "                D = Move Right\n" + 
        "                Q = Shoot Left\n" +
        "                E = Shoot Right\n \n" +
        "         Navigate through the open\n" +
        "      waters while avoiding pirates.\n" +
        "  Don't be afraid to defend yourself!");
    controlText.anchor.set(0.5);
    controlText.x = app.view.width/2;
    controlText.y = app.view.height * (1/2);
    controlText.style = styleSmall;
    controlScreen.addChild(controlText);

    //Ready
    let readyText = new PIXI.Text("Ready!");
    readyText.anchor.set(0.5);
    readyText.x = app.view.width/2;
    readyText.y = app.view.height * (9/10);
    readyText.style = style;
    readyText.interactive = true;
    readyText.buttonMode = true;
    controlScreen.addChild(readyText);
    readyText.on("pointerup", startGame);
    readyText.on("pointerover", e => e.target.alpha = 0.7);
    readyText.on("pointerout", e => e.currentTarget.alpha = 1.0);

    //Game screen
    let water = new PIXI.Graphics();
    water.beginFill(0x00ccff);
    water.drawRect(0,0,app.view.width,app.view.height);
    gameScreen.addChild(water);

    //To Display the Score
    textScore = new PIXI.Text("Score: " + score);
    textScore.anchor.set(0.5);
    textScore.x = app.view.width/3 - 25;
    textScore.y = 50;
    textScore.style = style;
    gameScreen.addChild(textScore);

    //To Display the Health
    textHealth = new PIXI.Text("Health: " + 100);
    textHealth.anchor.set(0.5);
    textHealth.x = app.view.width * (2/3) - 25;
    textHealth.y = 50;
    textHealth.style = style;
    gameScreen.addChild(textHealth);

    //End screen
    let blueRect = new PIXI.Graphics();
    blueRect.beginFill(0xac7339);
    blueRect.drawRect(0,0,app.view.width,app.view.height);
    endScreen.addChild(blueRect);

    //End screen Text
    let text3 = new PIXI.Text("You were sunk");
    text3.anchor.set(0.5);
    text3.x = app.view.width/2;
    text3.y = app.view.height/5;
    text3.style = style;
    endScreen.addChild(text3);

    //Your high score
    textHighScore = new PIXI.Text("High Score: " + highScore);
    textHighScore.anchor.set(0.5);
    textHighScore.x = app.view.width/2;
    textHighScore.y = app.view.height/5 + 50;
    textHighScore.style = style;
    endScreen.addChild(textHighScore);

    //Your final score
    textFinalScore = new PIXI.Text("Your Score: " + score);
    textFinalScore.anchor.set(0.5);
    textFinalScore.x = app.view.width/2;
    textFinalScore.y = app.view.height/5 + 100;
    textFinalScore.style = style;
    endScreen.addChild(textFinalScore);

    //The play again button
    let text4 = new PIXI.Text("Play Again?");
    text4.anchor.set(0.5);
    text4.x = app.view.width/2;
    text4.y = app.view.height/2;
    text4.style = style;
    text4.interactive = true;
    text4.buttonMode = true;
    endScreen.addChild(text4);
    text4.on("pointerup", startGame);
    text4.on("pointerover", e => e.target.alpha = 0.7);
    text4.on("pointerout", e => e.currentTarget.alpha = 1.0);
}

//~~~~~~~~~Loading functions~~~~~~~~~
function showProgress(e){
    console.log(e.progress);
}
function reportError(e){
    console.log("ERROR " + e.message);
}
function doneLoading(e){
    console.log("DONE LOADING!");
}

//~~~~~~~~~KeyBoard funtions~~~~~~~~~
function keysDown(e){
    keys[e.keyCode] = true;
}
function keysUp(e){
    keys[e.keyCode] = false;
}

//~~~~~~~~~Screen functions~~~~~~~~~
function startControls(){
    titleScreen.visible = false;
    gameScreen.visible = false;
    endScreen.visible = false;
    controlScreen.visible = true;
}

function startGame(){
    titleScreen.visible = false;
    gameScreen.visible = true;
    endScreen.visible = false;
    controlScreen.visible = false;
    levelNum = 0;
    player.health = 100;
    score = 0;
    player.x = app.view.width/2;
    player.y = app.view.height/2;
    textHealth.text = "Health: " + 100;
}

//~~~~~~~~~Game Functions~~~~~~~~~
function gameLoop(){
    if(gameScreen.visible){
        progress();
    }
    //~~~~~~~~~Generic~~~~~~~~~
    let dt = 1/app.ticker.FPS;
    delayLeft += dt;
    delayRight += dt;
    survivalTime += dt;
    textScore.text = "Score: " + score;
    textFinalScore.text = "Your Score: " + score;
    textHighScore.text = "High Score: " + highScore;

    for(let p of pirates){
        p.delayLeft += dt;
        p.delayRight += dt;
        p.delayOrbit += dt;
    }

    //~~~~~~~~~Controls~~~~~~~~~
    if(gameScreen.visible == true){
        //W-forward acceleration
        if(keys["87"] && player.y > 0){
            player.y -= 5;
        }
        //S-Reverse
        if(keys["83"] && player.y < app.view.height){
            player.y += 5;
        }
        //A-Go left
        if(keys["65"] && player.x > 0){
            player.x -= 5;
        }
        //D-Go right
        if(keys["68"] && player.x < app.view.width){
            player.x += 5;
        }

        //Q-Portside cannons
        if(keys["81"] && delayLeft > 1){
            shootSound.play();
            tempSide = 0;
            fire(0);
            delayLeft = 0;
        }
        //E-Starboard cannons
        if(keys["69"] && delayRight > 1){
            shootSound.play();
            tempSide = 1;
            fire();
            delayRight = 0;
        }
    }

    //~~~~~~~~~Movement~~~~~~~~~
    //Player Bullets
    for(let b of bullets){
        if(b.side == 0){
            b.moveLeft();
        }
        if(b.side == 1){
            b.moveRight();
        }
    }
    //Enemy Bullets
    for(let b of enemyBullets){
        if(b.side == 0 && b.bulletType == 0){
            b.moveLeft();
        }
        if(b.side == 1 && b.bulletType == 0){
            b.moveRight();
        }
        if(b.side == 0 && b.bulletType == 2){
            b.moveUpLeft();
        }
        if(b.side == 1 && b.bulletType == 2){
            b.moveUpRight();
        }
        if(b.side == 0 && b.bulletType == 1){
            b.moveDownLeft();
        }
        if(b.side == 1 && b.bulletType == 1){
            b.moveDownRight();
        }
        if(b.bulletType == 3){
            b.moveOrbital();
        }
    }

    //~~~~~~GamePlay function calls~~~~~~
    if(gameScreen.visible){
        collision();
        findPlayer();
    }
}

//To create a bullet
function fire(e){
    let ball;
    if(tempSide == 0){
        ball = new Bullet(0x000000, player.x - 16, player.y, tempSide);
    }
    if(tempSide == 1){
        ball = new Bullet(0x000000, player.x + 16, player.y, tempSide);
    }
    bullets.push(ball);
    gameScreen.addChild(ball);
}

//To have the enemy ships find the player
function findPlayer(){
    for(let i = 0; i < pirates.length; i++){
        //To find the height of the player
        if(pirates[i].y > player.y){
            pirates[i].y -= pirates[i].speed;
        }
        if(pirates[i].y < player.y){
            pirates[i].y += pirates[i].speed;
        }

        //Fire StarBoard side
        if(pirates[i].y - 10 <= player.y && pirates[i].y + 10 >= player.y && pirates[i].x < player.x && pirates[i].delayRight > 1){
            tempSide = 1;
            shootSound.play();
            //Normal Shot
            if(pirates[i].extraCannon1 == false){
                let ball = new Bullet(0x000000, pirates[i].x + 16, pirates[i].y, tempSide);
                pirates[i].delayRight = 0;
                enemyBullets.push(ball);
                gameScreen.addChild(ball);
            }
            //Double Shot
            if(pirates[i].extraCannon1 == true){
                let ball1 = new Bullet(0x000000, pirates[i].x + 16, pirates[i].y + 15, tempSide);
                let ball2 = new Bullet(0x000000, pirates[i].x + 16, pirates[i].y - 15, tempSide);
                pirates[i].delayRight = 0;
                enemyBullets.push(ball1);
                gameScreen.addChild(ball1);
                enemyBullets.push(ball2);
                gameScreen.addChild(ball2);
            }
            //Triple Shot
            if(pirates[i].extraCannon2 == true){
                let ball1 = new Bullet(0x000000, pirates[i].x + 16, pirates[i].y + 15, tempSide);
                ball1.bulletType = 1;
                let ball2 = new Bullet(0x000000, pirates[i].x + 16, pirates[i].y, tempSide);
                ball2.bulletType = 0;
                let ball3 = new Bullet(0x000000, pirates[i].x + 16, pirates[i].y - 15, tempSide);
                ball3.bulletType = 2;
                pirates[i].delayRight = 0;
                enemyBullets.push(ball1);
                gameScreen.addChild(ball1);
                enemyBullets.push(ball2);
                gameScreen.addChild(ball2);
                enemyBullets.push(ball3);
                gameScreen.addChild(ball3);
            }
        }
        //Fire Port Side
        if(pirates[i].y - 10 <= player.y && pirates[i].y + 10 >= player.y && pirates[i].x > player.x && pirates[i].delayLeft > 1){
            tempSide = 0;
            shootSound.play();
            //Normal Shot
            if(pirates[i].extraCannon1 == false){
                let ball = new Bullet(0x000000, pirates[i].x - 16, pirates[i].y, tempSide);
                pirates[i].delayLeft = 0;
                enemyBullets.push(ball);
                gameScreen.addChild(ball);
            }
            //Double Shot
            if(pirates[i].extraCannon1 == true){
                let ball1 = new Bullet(0x000000, pirates[i].x - 16, pirates[i].y + 15, tempSide);
                let ball2 = new Bullet(0x000000, pirates[i].x - 16, pirates[i].y - 15, tempSide);
                pirates[i].delayLeft = 0;
                enemyBullets.push(ball1);
                gameScreen.addChild(ball1);
                enemyBullets.push(ball2);
                gameScreen.addChild(ball2);
            }
            //Triple Shot
            if(pirates[i].extraCannon2 == true){
                let ball1 = new Bullet(0x000000, pirates[i].x - 16, pirates[i].y + 15, tempSide);
                ball1.bulletType = 1;
                let ball2 = new Bullet(0x000000, pirates[i].x - 16, pirates[i].y, tempSide);
                ball2.bulletType = 0;
                let ball3 = new Bullet(0x000000, pirates[i].x - 16, pirates[i].y - 15, tempSide);
                ball3.bulletType = 2;
                pirates[i].delayLeft = 0;
                enemyBullets.push(ball1);
                gameScreen.addChild(ball1);
                enemyBullets.push(ball2);
                gameScreen.addChild(ball2);
                enemyBullets.push(ball3);
                gameScreen.addChild(ball3);
            }
        }
        //Boss Attacks
        if(pirates[i].delayOrbit > 3){
            shootSound.play();
            for(let i = 0; i < 12; i++){
                let ball = new Bullet(0x000000, pirates[0].x, pirates[0].y, tempSide);
                ball.bulletType = 3;
                if(i==0){ball.posX = 0.5; ball.posY = 0.5;}
                if(i==1){ball.posX = .25; ball.posY = .75;}
                if(i==2){ball.posX = .75; ball.posY = .25;}
                if(i==3){ball.posX = 0.5; ball.posY = -0.5;}
                if(i==4){ball.posX = .75; ball.posY = -.25;}
                if(i==5){ball.posX = .25; ball.posY = -.75;}
                if(i==6){ball.posX = -0.5; ball.posY = -0.5;}
                if(i==7){ball.posX = -.25; ball.posY = -.75;}
                if(i==8){ball.posX = -.75; ball.posY = -.25;}
                if(i==9){ball.posX = -0.5; ball.posY = 0.5;}
                if(i==10){ball.posX = -.75; ball.posY = .25;}
                if(i==11){ball.posX = -.25; ball.posY = .75;} 
                enemyBullets.push(ball);
                gameScreen.addChild(ball);
            }
            pirates[i].delayOrbit = 0;
        }
    }
}

//To deal with collisions
function collision(){
    //Checks to see if a pirate ship is hit
    for(let p of pirates){
        for(let b of bullets){
            //To see if a normal ship was hit
            if(rectsIntersect(p,b) && !Number.isInteger(levelNum / 5)){
                gameScreen.removeChild(p);
                p.isAlive = false;
                gameScreen.removeChild(b);
                b.isAlive = false;
                score += 100;
                hitSound.play();
            }
            //To check the boss health
            if(rectsIntersect(p,b) && Number.isInteger(levelNum / 5)){
                if(p.health > 0){
                    gameScreen.removeChild(b);
                    b.isAlive = false;
                    p.health -= 20;
                }
                if(p.health == 0){
                    gameScreen.removeChild(p);
                    p.isAlive = false;
                    gameScreen.removeChild(b);
                    b.isAlive = false;
                    score += 500;
                    hitSound.play();
                }
            }
        }
    }
    
    //To see if the player is hit
    for(let b of enemyBullets){
        if(rectsIntersect(player,b)){
            gameScreen.removeChild(b);
            b.isAlive = false;
            loseHealth();
        }
    }

    //To check if any bullets missed and are now off screen
    for(let i = 0; i < bullets.length; i++){
        if(bullets[i].x < 0 || bullets[i].y < 0 || bullets[i].x > app.view.width || bullets[i].y > app.view.height){
            bullets[i].isAlive = false;
            gameScreen.removeChild(bullets[i]);
        }
    }
    for(let i = 0; i < enemyBullets.length; i++){
        if(enemyBullets[i].x < 0 || enemyBullets[i].y < 0 || enemyBullets[i].x > app.view.width || enemyBullets[i].y > app.view.height){
            enemyBullets[i].isAlive = false;
            gameScreen.removeChild(enemyBullets[i]);
        }
    }

    //To clean up the arrays
    bullets = bullets.filter(b=>b.isAlive);
    enemyBullets = enemyBullets.filter(b=>b.isAlive);
    pirates = pirates.filter(p=>p.isAlive);
}

//For when the player is hit
function loseHealth(){
    if(player.health > 0){
        player.health -= 20;
        textHealth.text = "Health: " + player.health;
    }
    if(player.health <= 0){  
        titleScreen.visible = false;
        gameScreen.visible = false;
        endScreen.visible = true;

        //If you scored higher update the high score
        if(score > highScore){
            highScore = score;
            //Saving the data
            let listID = "ldv9727";
            let items = highScore;
            localStorage.setItem(listID,items);
        }

        pirates.forEach(b=>gameScreen.removeChild(b));
        pirates = [];
        bullets.forEach(b=>gameScreen.removeChild(b));
        bullets = [];
        enemyBullets.forEach(b=>gameScreen.removeChild(b));
        enemyBullets = [];
    }
}

//To create the enemies
function spawning(){
    let control = levelNum;
    if(levelNum >= 5){
        control = 4;
    }

    if(Number.isInteger(levelNum / 5) && levelNum != 0){
        let p = new Boss(app.view.width/2, app.view.height + 150);
        pirates.push(p);
        gameScreen.addChild(p);
    }
    else{
        for(let i = 0; i < control; i++){
            let p = new Pirate(Math.random() * app.view.width, app.view.height + Math.random() * 300, 1.5 + Math.random() * 2);
            pirates.push(p);
            gameScreen.addChild(p);
        }
    }
}

//To progress the level and add challenges
function progress(){
    if(pirates.length == 0){
        levelNum ++;
        spawning();
        //To see what features the ships get
        if(levelNum < 5 && levelNum >= 3){
            for(let p of pirates){
                let num = Math.random() * 100;
                //A 33% chance of two horizontal cannons
                if(num < 33){
                    p.extraCannon1 = true;
                }
            }
        }
        if(levelNum > 5){
            for(let p of pirates){
                let num = Math.random() * 100;

                //A 25% of three cannons and diagnol projections
                if(num > 75 && num < 100){
                    p.extraCannon2 = true;
                }

                //A 33% chance of two horizontal cannons
                if(num < 33){
                    p.extraCannon1 = true;
                }
            }
        }
    }
}