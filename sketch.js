// --- Cat Bed Visualizer ---
// Connects to ESP32 via Web Serial and displays cat presence + duration

let serial
let occupied = false
let duration = 0
let connectButton = null
const stayLogs = []
const totalNapDuration = 0
let catBounce = 0
let catEyeBlink = 0

function setup() {
  createCanvas(600, 500)
  textAlign(CENTER, CENTER)
  textSize(18)
  rectMode(CENTER)
  connectButton = createButton("Connect to Cat Bed")

  connectButton.style("background-color", "#8b6f47")
  connectButton.style("color", "#fff")
  connectButton.style("border", "none")
  connectButton.style("padding", "12px 24px")
  connectButton.style("border-radius", "25px")
  connectButton.style("font-family", "Poppins, sans-serif")
  connectButton.style("font-weight", "600")
  connectButton.style("cursor", "pointer")
  connectButton.style("margin", "0 auto")
  connectButton.style("box-shadow", "0 4px 12px rgba(101, 67, 33, 0.3)")
  connectButton.mousePressed(initSerial);
}
async function initSerial() {
  // This now happens because of a user click
  port = await navigator.serial.requestPort();
  await port.open({ baudRate: 115200 });

  reader = port.readable.getReader();
  readSerial();
}
async function readSerial() {
  console.log("in read serial");
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
      let text = new TextDecoder().decode(value);
    const trimmed = text.trim();
    if (!trimmed) return
    console.log("RAW line:", JSON.stringify(trimmed))

  // Parse "occupied:1,duration:12"
  const parts = trimmed.split(",")
  let data = {}
  for (let p of parts) {
    const [key, val] = p.split(":")
    if (!key || !val) continue
    data[key.trim()] = val.trim()
  }

  // Update state
  if (data.occupied !== undefined) occupied = data.occupied === "1"
  if (data.duration !== undefined) duration = parseInt(data.duration, 10) || 0

  console.log("Parsed data:", { occupied, duration })
    }
  }
}

// Main draw loop
function draw() {
  drawBackground()
  drawHeader()
  drawCatBed()

  if (occupied) {
    drawCat()
  } else {
    drawEmptyBed()
  }

  drawStats()
  drawFooter()
}

function drawBackground() {
  // Gradient background
  for (let y = 0; y < height; y++) {
    const inter = map(y, 0, height, 0, 1)
    const c = lerpColor(color(245, 230, 211), color(232, 213, 196), inter)
    stroke(c)
    line(0, y, width, y)
  }

  // Decorative corner elements
  noStroke()
  fill(139, 111, 71, 30)
  circle(50, 50, 100)
  circle(width - 50, 50, 80)
  circle(50, height - 50, 90)
  circle(width - 50, height - 50, 70)
}

function drawHeader() {
  // Title banner
  fill(139, 111, 71)
  noStroke()
  rect(width / 2, 60, width - 80, 80, 15)

  fill(245, 230, 211)
  textFont("Playfair Display")
  textSize(32)
  textStyle(BOLD)
  text("The Purrfect Nook", width / 2, 50)

  textFont("Poppins")
  textSize(14)
  textStyle(NORMAL)
  text("Cat Bed Monitoring Cafe", width / 2, 75)
}

function drawCatBed() {
  push()
  translate(width / 2, height / 2 + 20)

  // Bed frame - darker wood tone
  fill(101, 67, 33)
  stroke(70, 45, 20)
  strokeWeight(3)
  rect(0, 30, 320, 140, 20)

  // Inner cushion - warm cream color
  noStroke()
  fill(255, 248, 235)
  rect(0, 20, 280, 110, 15)

  // Cushion details - stitching pattern
  stroke(220, 200, 180)
  strokeWeight(2)
  for (let i = -120; i < 120; i += 30) {
    line(i, -20, i, 60)
  }

  pop()
}

function drawCat() {
  push()
  translate(width / 2, height / 2 + 20 + catBounce)

  // Cat body - curled up sleeping position
  fill(255, 140, 100)
  noStroke()
  ellipse(0, 0, 160, 120)

  // Cat head
  ellipse(-30, -30, 80, 75)

  // Ears
  triangle(-50, -60, -40, -35, -25, -50)
  triangle(-35, -60, -25, -35, -10, -50)

  // Inner ears
  fill(255, 180, 150)
  triangle(-47, -55, -40, -40, -30, -48)
  triangle(-32, -55, -25, -40, -15, -48)

  // Tail curled around
  fill(255, 140, 100)
  arc(60, 20, 100, 60, PI, TWO_PI)

  // Eyes (closed/blinking)
  fill(70, 45, 20)
  if (catEyeBlink === 0) {
    ellipse(-40, -25, 3, 8)
    ellipse(-20, -25, 3, 8)
  } else {
    line(-42, -25, -38, -25)
    line(-22, -25, -18, -25)
  }

  // Nose
  fill(255, 100, 80)
  triangle(-32, -18, -28, -18, -30, -15)

  // Whiskers
  stroke(70, 45, 20)
  strokeWeight(1)
  line(-45, -20, -65, -22)
  line(-45, -15, -65, -15)
  line(-15, -20, 5, -22)
  line(-15, -15, 5, -15)

  // Sleeping Z's
  noStroke()
  fill(139, 111, 71, 150)
  textSize(20)
  text("z", 70, -40 + sin(frameCount * 0.1) * 5)
  textSize(16)
  text("z", 85, -55 + sin(frameCount * 0.1 + 1) * 5)
  textSize(12)
  text("z", 95, -70 + sin(frameCount * 0.1 + 2) * 5)

  pop()

  // Status message
  fill(139, 111, 71)
  textFont("Poppins")
  textSize(18)
  textStyle(NORMAL)

  const msg =
    duration <= 10
      ? "Just settled in..."
      : duration <= 20
        ? "Cat nap in progress"
        : duration <= 30
          ? "Deep in dreamland"
          : "Long cozy nap"

  text(msg, width / 2, height/3 + 10)

}

function drawEmptyBed() {
  push()
  translate(width / 2, height / 2 + 20)

  // Empty pillow with indent
  fill(240, 235, 220)
  noStroke()
  ellipse(0, 0, 180, 100)

  // Pillow indent/depression
  fill(220, 210, 195)
  ellipse(0, -5, 140, 70)

  // Decorative pattern on pillow
  stroke(200, 190, 175)
  strokeWeight(1)
  noFill()
  for (let i = 0; i < 3; i++) {
    ellipse(0, -5, 140 - i * 20, 70 - i * 12)
  }

  pop()

  // Status message
  fill(139, 111, 71)
  textFont("Poppins")
  textSize(18)
  text("Awaiting feline guest...", width / 2, height / 2 - 60)
}

function drawStats() {
  // Stats panel background
  fill(255, 248, 235)
  stroke(139, 111, 71)
  strokeWeight(2)
  rect(width / 2, height - 80, width - 100, 80, 15)

  // Total nap duration
  noStroke()
  fill(101, 67, 33)
  textFont("Poppins")
  textSize(16)
  textStyle(BOLD)
  text("Total Nap Duration", width / 2, height - 95)

  textSize(28)
  fill(139, 111, 71)
  const hours = floor(duration / 3600)
  const minutes = floor((duration % 3600) / 60)
  const seconds = duration % 60
  text(`${hours}h ${minutes}m ${seconds}s`, width / 2, height - 65)
}

function drawFooter() {
  fill(101, 67, 33, 150)
  textFont("Poppins")
  textSize(12)
  textStyle(NORMAL)
}


const PI = Math.PI
const TWO_PI = Math.PI * 2
