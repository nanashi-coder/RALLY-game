const WORLD_SIZE = 3000;
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const MAX_SPEED = 6;

const car = { x: 1500, y:1500, angle: 0, speed: 0 };
const keys = {};

window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

function update() {
    if (keys["ArrowUp"]) car.speed += 0.2;
    if (keys["ArrowDown"]) car.speed -= 0.2;
    car.speed *= 0.98; // friction

    if (Math.abs(car.speed) > 0.5) {   //can only turn while moving
        if (keys["ArrowLeft"]) car.angle -= 0.04;
        if (keys["ArrowRight"]) car.angle += 0.04;
    }

    car.x += Math.cos(car.angle) * car.speed;
    car.y += Math.sin(car.angle) * car.speed;
    if (car.speed > MAX_SPEED) car.speed = MAX_SPEED;
    if (car.speed < -MAX_SPEED / 2) car.speed = -MAX_SPEED / 2;

}

function drawGround() {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    for (let x = 0; x <= WORLD_SIZE; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, WORLD_SIZE);
        ctx.stroke();
    }
    for (let y = 0; y <= WORLD_SIZE; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WORLD_SIZE, y);
        ctx.stroke();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // camera: shift the world so the car sits in the middle of the screen
    ctx. translate(canvas.width / 2 - car.x, canvas.height / 2 -car.y);

    drawGround();

    // the car
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);
    ctx.fillStyle = "red";
    ctx.fillRect(-20, -10, 40, 20);
    ctx.restore();

    ctx.restore();

    ctx.fillStyle = "white";
    ctx.font = "20px sans-serif";
    ctx.fillText("Speed: " + Math.round(car.speed * 20) + " km/h", 20, 30);

}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();