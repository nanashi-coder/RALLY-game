const WORLD_SIZE = 3000;
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const MAX_SPEED = 6;
const A = 15;                       // distance from car center to front axle
const B = 15;                       // distance from car center to rear axle
const INERTIA = 225;                // how hard the car is to rotate
const CORNERING = 0.25;             // how quickly tires build up sideways force
const MAX_TIRE = 0.3;               // the grip limit of one tire
let surfaceGRIP = 0.7;                // 1 = tarmac, 0.7 = gravel, 0.5 = mud, 0.3 = ice

const car = { x: 1500, y:1500, angle: 0, vx: 0, vy: 0, omega: 0, steerAngle: 0 };
const keys = {};
let state = "menu";
const maps = ["Gravel Valley", "Forest Run", "Desert Dash"];
let selectedMap = 0;


window.addEventListener("keydown", (e) => {{
    if (e.key === " ") e.preventDefault();  // prevent page scrolling when pressing space
    keys[e.key] = true;
}});
window.addEventListener("keyup", (e) => keys[e.key] = false);

function updateRace() {
    const fx = Math.cos(car.angle);
    const fy = Math.sin(car.angle);
    const rx = -fy;
    const ry = fx;

    const vf = car.vx * fx + car.vy * fy; // forward velocity
    const vr = car.vx * rx + car.vy * ry; // rightward velocity
    
    const maxSteer = 0.6 / (1 + Math.abs(vf) * 0.3);
    let target = 0;
    if (keys["ArrowLeft"]) target = -maxSteer;
    if (keys["ArrowRight"]) target = maxSteer;
    car.steerAngle += (target - car.steerAngle) * 0.2;


    const slideFront = vr + car.omega * A;
    const slideRear = vr - car.omega * B;

    const handbreak = keys[" "];
    const maxFront = MAX_TIRE * surfaceGRIP;
    let maxRear = MAX_TIRE * surfaceGRIP;
    if (handbreak) maxRear *= 0.3;
    else if (keys["ArrowUp"]) maxRear *= 0.85;  // power takes rear grip away

    //tire forces: push against sliding, but never more than the limit
    let forceFront = -CORNERING * (slideFront - vf * car.steerAngle);
    let forceRear = -CORNERING * slideRear;
    forceFront = Math.max(-maxFront, Math.min(maxFront, forceFront));
    forceRear = Math.max(-maxRear, Math.min(maxRear, forceRear));

    // the forces push the car sideways AND spin it
    car.vx += rx * (forceFront + forceRear);
    car.vy += ry * (forceFront + forceRear);
    car.omega += (A * forceFront - B * forceRear) / INERTIA;
    car.omega *= 0.98; 
    car.angle += car.omega;

    // engine brake and drag along the forward direction
    let accel = 0;
    if (keys["ArrowUp"]) accel += 0.2;
    if (keys["ArrowDown"]) accel -= vf > 0.2 ? 0.25 : 0.08;
    accel -= vf * 0.02; 
    if (handbreak) accel -= vf * 0.03;
    car.vx += fx * accel;
    car.vy += fy * accel;

    //top speed
    const speed = Math.hypot(car.vx, car.vy);
    if (speed > MAX_SPEED) {
        car.vx *= MAX_SPEED / speed;
        car.vy *= MAX_SPEED / speed;
    }

    car.x += car.vx;
    car.y += car.vy;

    //walls
    if (car.x < 0) { car.x = 0; car.vx = 0; }
    if (car.x > WORLD_SIZE) { car.x = WORLD_SIZE; car.vx = 0; }
    if (car.y < 0) { car.y = 0; car.vy = 0; }
    if (car.y > WORLD_SIZE) { car.y = WORLD_SIZE; car.vy = 0; } 
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

function drawRace() {
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
    ctx.fillText("Speed: " + Math.round(Math.hypot(car.vx, car.vy) * 20) + " km/h", 20, 30);

}

function resetCar() {
    car.x = 1500;
    car.y = 1500;
    car.angle = 0;
    car.vx = 0;
    car.vy = 0;
    car.omega = 0;
    car.steerAngle = 0;
}

window.addEventListener("keydown", (e) => {
    if (state === "menu") {
        if (e.key === "Enter") state = "mapSelect";
    }   else if (state === "mapSelect") {
        if (e.key === "ArrowLeft") selectedMap = (selectedMap - 1 + maps.length) % maps.length;   
        if (e.key === "ArrowRight") selectedMap = (selectedMap + 1) % maps.length;
        if (e.key === "Enter") { resetCar(); state = "race"; }
        if (e.key === "Escape") state = "menu";
    } else if (state === "race") {
        if (e.key === "Escape") state = "menu";
    }
});

function drawMenu() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "22px sans-serif";
    ctx.fillText("Press ENTER to Start", canvas.width / 2, 330);
}

function drawMapSelect() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "28px sans-serif";
    ctx.fillText("SELECT STAGE", canvas.width / 2, 120);
    ctx.font = "bold 48px sans-serif";
    ctx.fillText(maps[selectedMap], canvas.width / 2, 300);
    ctx.font = "20px sans-serif";
    ctx.fillText("< LEFT / RIGHT >      ENTER to drive      ESC to go back", canvas.width / 2, 400);
    ctx.textAlign = "left";
}


function loop() {
    if (state === "race") {
        updateRace();
        drawRace();
    } else if (state === "menu") {
        drawMenu();
    } else if (state === "mapSelect") {
        drawMapSelect();
    }
    requestAnimationFrame(loop);
}
loop();