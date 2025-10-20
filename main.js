// Palette https://lospec.com/palette-list/retrotronic
// -- SET UP --
// Load game window
const gamewin = document.getElementById("game");
const ctx = gamewin.getContext("2d");

// Load keys
let keys = {};
window.addEventListener("keydown", e => keys[e.code] = true);
window.addEventListener("keyup", e => keys[e.code] = false);

// -- GLOBAL VARIABLES --
let game_state = "menu";
let current_scene = null;

// -- MAIN GAME LOOP --
let last_time = 0;
function game_loop(current_time) {
    const dt = (current_time - last_time) / 1000;
    update(dt);
    draw();
    last_time = current_time;

    requestAnimationFrame(game_loop);
}

function update(dt) {
    if (game_state=="menu") {
        update_menu();
    }
    else if (game_state=="game") {
        update_game(dt);
    }
}

function draw() {
    if (game_state=="menu") {
        draw_menu();
    }
    else if (game_state=="game") {
        draw_game();
    }
}

// -- MENU FUNCTIONS --
function update_menu() {
    if (keys["Enter"]) {
        current_scene = load_game();
        game_state = "game";
    }
}

function draw_menu() {
    let black = "#392b35";
    let white = "#d1bfb0";
    let blue  = "#486b7f"; 
    let red   = "#bb474f";

    let title = "Breakout-JS";
    let start = "Press Enter";

    ctx.fillStyle = black;
    ctx.fillRect(0,0,600,600);

    ctx.fillStyle = red;
    ctx.fillRect(20,100,560,150);

    ctx.font = "bold 80px Courier New";
    let title_x = (600 - ctx.measureText(title).width) / 2;
    ctx.fillStyle = black;
    ctx.fillText(title, title_x, 200);


    ctx.font = "50px Courier New";
    ctx.fillStyle = white;
    let start_x = (600 - ctx.measureText(start).width) / 2;
    ctx.fillText(start, start_x, 400);
}

// -- GAME FUNCTIONS --
function load_game() {
    const game = {
        player: null,
        ball: null,
        bricks: [],
    };

    game.player = {
        x: 250,
        y: 500,
        h: 25,
        w: 100,
        spd:300,
        color:"#bb474f",
    };

    game.ball = {
        x: 290,
        y: 400,
        w: 20,
        h: 20,
        vel_x: 200,
        vel_y: 300,
        color: "#d1bfb0",
    };

    let colors = ["#486b7f", "#7a9c96"]
    let brickWidth = 50;
    let brickHeight = 20;
    let gap = 7;
    let curr_color=0;

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 10; j++) {
            let brick = {
                x: 18 + j * (brickWidth + gap),
                y: 18 + i * (brickHeight + gap),
                w: brickWidth,
                h: brickHeight,
                color: colors[curr_color],
            };
            game.bricks.push(brick);
            curr_color = 1 - curr_color;
        }
    }

    return game;
}


function update_game(dt) {
    const {player, ball, bricks} = current_scene;

    // controller
    if (keys["KeyD"]) {
        player.x+=player.spd * dt;
    }
    if (keys["KeyA"]) {
      player.x-=player.spd * dt;  
    }

    if (player.x<=0) player.x=0;
    if (player.x>=500) player.x=500;

    ball.y+=ball.vel_y * dt;
    ball.x+=ball.vel_x * dt;

    if (ball.x<=0 || ball.x>=580) ball.vel_x*=-1;
    if (ball.y<=0) ball.vel_y*=-1;

    if (collision(player, ball)) {
        ball.vel_y *= -1;
        const hit_pos = (ball.x + ball.w / 2) - (player.x + player.w / 2);
        const normalized = hit_pos / (player.w / 2);

        ball.vel_x = normalized * 300;
        ball.y = player.y - ball.h - 1;
    }
    
    bricks.forEach((brick, i) => {
        if (collision(ball,brick)) {
            ball.vel_y*=-1;

           bricks.splice(i,1); 
        }
    });

    if (ball.y>600) {
        game_state = "menu";
        current_scene = null;
    }
}

function draw_game() {
    ctx.fillStyle = "#392b35";
    ctx.fillRect(0,0,600,600);

    render_obj(current_scene.ball);
    render_obj(current_scene.player);

    current_scene.bricks.forEach((brick, i) => {
        render_obj(brick);
    });
}


// -- HELPER FUNCTIONS --
function render_obj(obj) {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x,obj.y,obj.w,obj.h);
}

function collision(a, b) {
    if (a.x<b.x+b.w && 
        a.x+a.w>b.x &&
        a.y<b.y+b.h &&
        a.y+a.h>b.y) 
    {
        return true;
    }
    else return false;
}


// -- RUN GAME --
requestAnimationFrame(game_loop);
