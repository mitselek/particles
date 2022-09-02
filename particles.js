const MASSLESS_FRACTION = 1/3 
const MAX_MASS = 5
const G = 10
const G_FACTOR = 1/2
const E = -5
const E_FACTOR = 1.01
const C = 10 // speed limit
const SPEED_LIMIT = C

const randomMass = () => {
  const relative_mass = Math.max(Math.random(), MASSLESS_FRACTION) - MASSLESS_FRACTION
  return relative_mass / (1 - MASSLESS_FRACTION) * MAX_MASS
}
// force: attraction of particles with unit mass (1) at unit distance (1);
// factor: factor of change in attraction relative to change in distance;
const RULES = {
  red: {
    count: 200,
    mass: randomMass(),
    charge: 1,
    interact: {
      red: {factor: 2, force: Math.random() * 2 - 1},
      blue: {factor: 2, force: Math.random() * 2 - 1},
      white: {factor: 2, force: Math.random() * 2 - 1},
    }
  },
  blue: {
    count: 200,
    mass: randomMass(),
    charge: -1,
    interact: {
      red: {factor: 2, force: Math.random() * 2 - 1},
      blue: {factor: 2, force: Math.random() * 2 - 1},
      white: {factor: 2, force: Math.random() * 2 - 1},
    }
  },
  white: {
    count: 200,
    mass: randomMass(),
    charge: 0,
    interact: {
      red: {factor: 2, force: Math.random() * 2 - 1},
      blue: {factor: 2, force: Math.random() * 2 - 1},
      white: {factor: 2, force: Math.random() * 2 - 1},
    }
  },
}
console.log(JSON.stringify(RULES))

// Canvas
const canvas = document.getElementById('canvas')
const updateCanvasDimensions = () => {
  canvas.width = window.innerWidth - 30
  canvas.height = window.innerHeight - 30
}
updateCanvasDimensions()

const context = canvas.getContext("2d")
const draw = (x, y, c, sx) => {
  context.fillStyle = c
  // context.fillRect(x, y, sx, sy)
  context.beginPath()
  context.arc(x, y, sx/2, 0, 2 * Math.PI, false)
  context.fill()
}

// Particles
const particles = []
const particle = (x, y, c, m) => {
  return { x: x, y: y, vx: 0, vy: 0, color: c, mass: m }
}

// Random locations on canvas
const randomX = () => Math.random() * canvas.width + .5
const randomY = () => Math.random() * canvas.height + .5

// Create particles
for (const [color, rules] of Object.entries(RULES)) {
  for (let i = 0; i < rules.count; i++) {
    particles.push(particle(randomX(), randomY(), color, rules.mass))
  }
}

// Apply rules
const interact = () => {
  for (let ix1 = 0; ix1 < particles.length; ix1++) {
    let fx = 0
    let fy = 0
    const p1 = particles[ix1]
    for (let ix2 = ix1 + 1; ix2 < particles.length; ix2++) {
      // if (ix2 === ix1) { continue } // particle doesnot interact with itself
      const p2 = particles[ix2]
      const dx = p1.x - p2.x
      const dy = p1.y - p2.y
      const distance = Math.sqrt(dx**2 + dy**2)
      if (distance === 0) { continue } // no interaction without distance
      
      const speed1 = Math.sqrt(p1.vx ** 2 + p1.vy ** 2)
      const speed2 = Math.sqrt(p2.vx ** 2 + p2.vy ** 2)
      const e1 = p1.mass / (1 - speed1 / SPEED_LIMIT)
      const e2 = p2.mass / (1 - speed2 / SPEED_LIMIT)
      const energy = {x: Math.cos(e1)}
      
      const force = RULES[p1.color]['interact'][p2.color]['force']
      const factor = RULES[p1.color]['interact'][p2.color]['factor']
      if (p1.mass > 0) { // interactions involving inertia
        const gravitational_attraction = G*(distance**G_FACTOR) * p1.mass * p2.mass
      }
      if (force !== undefined) {
        if (dx !== 0 || dy !== 0) {
          const d = dx * dx + dy * dy
            const F = force / Math.sqrt(d)
            fx += F * dx
            fy += F * dy
        }
      }
      p1.vx = (p1.vx + fx) * 0.5
      p1.vy = (p1.vy + fy) * 0.5
      p2.vx = (p2.vx - fx) * 0.5
      p2.vy = (p2.vy - fy) * 0.5
    }

  }
}

const moveParticles = () => {
  for (let i = 0; i < particles.length; i++) {
    const a = particles[i]
    a.x += a.vx
    a.y += a.vy
    
    if (a.x <= 0) {
      a.vx *= -1
      a.x = -a.x
    }
    if (a.x >= canvas.width) {
      a.vx *= -1
      a.x = 2 * canvas.width - a.x
    }

    if (a.y <= 0) {
      a.vy *= -1
      a.y = -a.y
    }
    if (a.y >= canvas.height) {
      a.vy *= -1
      a.y = 2 * canvas.height - a.y
    }
  }  
}

// Create Atoms

// Update Frames
update()
function update() {
  // Update Canvas Dimensions - if screen size changed
  updateCanvasDimensions()

  interact()
  moveParticles()
  // m.clearRect(0, 0, canvas.width, canvas.height)
  // draw(0, 0, "black", canvas.width/3, canvas.height/2)
  for (i = 0; i < particles.length; i += 1) {
    const p = particles[i]
    draw(p.x, p.y, p.color, Math.max(1, p.mass))
  }
  requestAnimationFrame(update)
}
