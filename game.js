const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const car = { x: 400, y:300, angle: 0, speed: 0 };
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
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);
    ctx.fillStyle = "red";
    ctx.fillRect(-20, -10, 40, 20);
    ctx.restore();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();