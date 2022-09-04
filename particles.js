const MASSLESS_FRACTION = 1/3 
const MAX_MASS = 5
const G = 0.6
const G_FACTOR = 2
const E = -0.0001
const E_FACTOR = 0.9
const C = 5 // speed limit
const SPEED_LIMIT = C

const randomMass = () => {
  const relative_mass = Math.max(Math.random(), MASSLESS_FRACTION) - MASSLESS_FRACTION
  return relative_mass / (1 - MASSLESS_FRACTION) * MAX_MASS
}
// force: attraction of particles with unit mass (1) at unit distance (1);
// factor: factor of change in attraction relative to change in distance;
// const RULES = {
//   red: {
//     count: 200,
//     mass: randomMass(),
//     charge: 1,
//     interact: {
//       red: {factor: 2, force: Math.random() * 2 - 1},
//       blue: {factor: 2, force: Math.random() * 2 - 1},
//       white: {factor: 2, force: Math.random() * 2 - 1},
//       green: {factor: 2, force: Math.random() * 2 - 1},
//       yellow: {factor: 2, force: Math.random() * 2 - 1},
//     }
//   },
//   blue: {
//     count: 200,
//     mass: randomMass(),
//     charge: -1,
//     interact: {
//       red: {factor: 2, force: Math.random() * 2 - 1},
//       blue: {factor: 2, force: Math.random() * 2 - 1},
//       white: {factor: 2, force: Math.random() * 2 - 1},
//       green: {factor: 2, force: Math.random() * 2 - 1},
//       yellow: {factor: 2, force: Math.random() * 2 - 1},
//     }
//   },
//   white: {
//     count: 200,
//     mass: randomMass(),
//     charge: 0,
//     interact: {
//       red: {factor: 2, force: Math.random() * 2 - 1},
//       blue: {factor: 2, force: Math.random() * 2 - 1},
//       white: {factor: 2, force: Math.random() * 2 - 1},
//       green: {factor: 2, force: Math.random() * 2 - 1},
//       yellow: {factor: 2, force: Math.random() * 2 - 1},
//     }
//   },
//   green: {
//     count: 200,
//     mass: randomMass(),
//     charge: 0,
//     interact: {
//       red: {factor: 2, force: Math.random() * 2 - 1},
//       blue: {factor: 2, force: Math.random() * 2 - 1},
//       white: {factor: 2, force: Math.random() * 2 - 1},
//       green: {factor: 2, force: Math.random() * 2 - 1},
//       yellow: {factor: 2, force: Math.random() * 2 - 1},
//     }
//   },
//   yellow: {
//     count: 100,
//     mass: randomMass(),
//     charge: 0,
//     interact: {
//       red: {factor: 2, force: Math.random() * 2 - 1},
//       blue: {factor: 2, force: Math.random() * 2 - 1},
//       white: {factor: 2, force: Math.random() * 2 - 1},
//       green: {factor: 2, force: Math.random() * 2 - 1},
//       yellow: {factor: 2, force: Math.random() * 2 - 1},
//     }
//   },
// }

const RULES = {
  red: {
    count: 150,
    mass: Math.random() * 12,
    size: 5,
    charge: 1,
    interact: {
      red: {factor: 3, force: -200},
      blue: {factor: 2, force: 1},
      green: {factor: 3, force: -.001},
      yellow: {factor: 1.3, force: Math.random() * 2 - 1},
    }
  },
  blue: {
    count: 150,
    mass: Math.random() * 12,
    size: 5,
    charge: 1,
    interact: {
      blue: {factor: 3, force: -200},
      red: {factor: 2, force: 1},
      green: {factor: 3, force: .001},
      yellow: {factor: 1.3, force: Math.random() * 2 - 1},
    }
  },
  green: {
    count: 150,
    mass: Math.random() * 12,
    size: 5,
    charge: 1,
    interact: {
      red: {factor: 3, force: .001},
      green: {factor: 2, force: 1},
      blue: {factor: 3, force: -.001},
      yellow: {factor: 1.3, force: Math.random() * 2 - 1},
    }
  },
  yellow: {
    count: 0,
    mass: Math.random() * 12,
    size: 5,
    charge: 1,
    interact: {
      red: {factor: 1.3, force: Math.random() * 2 - 1},
      green: {factor: 1.3, force: Math.random() * 2 - 1},
      blue: {factor: 1.3, force: Math.random() * 2 - 1},
      yellow: {factor: 1.3, force: Math.random() * 2 - 1},
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

// Random locations on canvas
const randomX = () => Math.random() * canvas.width + .5
const randomY = () => Math.random() * canvas.height + .5

// Create particles
const particles = []
for (const [color, rules] of Object.entries(RULES)) {
  for (let i = 0; i < rules.count; i++) {
    particles.push({ x: randomX(), y: randomY(), vx: 0, vy: 0, 
                     color: color, mass: rules.mass, size: rules.size, 
                     speed_c: 0, direction: 0 })
  }
}

const draw_vector = (x, y, c, vx, vy) => {
  context.strokeStyle = c
  context.beginPath(); 
  context.moveTo(x, y);
  context.lineTo(x+vx, y+vy);
  context.stroke(); 
}

function accelerate(p, attr_x, attr_y) {
  y = 1 - Math.exp(-x) // map 0..infinity to 0..1
  p.vx += attr_x / p.mass
  p.vy += attr_y / p.mass
  p.speed_c = Math.sqrt(p.vx**2 + p.vy**2) / C
}

// Apply rules
const interact = () => {

  const apply_rules = (p1, p2, dx, dy, distance) => {
    const rule1 = RULES[p1.color]['interact'][p2.color]
    const rule2 = RULES[p2.color]['interact'][p1.color]
    const force1 = rule1.force / (distance ** rule1.factor)
    attr1_x = (force1) * dx
    attr1_y = (force1) * dy
    const force2 = rule2.force / (distance ** rule2.factor)
    attr2_x = force2 * dx
    attr2_y = force2 * dy
    accelerate(p1, -attr2_x, -attr2_y)
    accelerate(p2,  attr1_x,  attr1_y)
  }

  function apply_universals(distance, p1, p2, dx, dy) {
    const G_attr_x = (G / (distance ** G_FACTOR) * p1.mass * p2.mass) * dx
    const G_attr_y = (G / (distance ** G_FACTOR) * p1.mass * p2.mass) * dy
    const E_attr_x = (E / (distance ** E_FACTOR) * p1.mass * p2.mass) * dx
    const E_attr_y = (E / (distance ** E_FACTOR) * p1.mass * p2.mass) * dy

    accelerate(p1, -(G_attr_x + E_attr_x), -(G_attr_y + E_attr_y))
    accelerate(p2,  (G_attr_x + E_attr_x),  (G_attr_y + E_attr_y))
  }

  for (let ix1 = 0; ix1 < particles.length; ix1++) {
    const p1 = particles[ix1]
    // const e1 = p1.mass / (1 - speed1 / SPEED_LIMIT)
    for (let ix2 = ix1+1; ix2 < particles.length; ix2++) {
      if (ix2 === ix1) { continue } // particle doesnot interact with itself
      const p2 = particles[ix2]
      const dx = p1.x - p2.x
      const dy = p1.y - p2.y
      const distance = Math.sqrt(dx**2 + dy**2)
      if (distance === 0) { continue } // no interaction without distance

      
      // const speed2 = Math.sqrt(p2.vx ** 2 + p2.vy ** 2)
      // const e2 = p2.mass / (1 - speed2 / SPEED_LIMIT)
      
      const force = RULES[p1.color]['interact'][p2.color]['force']
      const factor = RULES[p1.color]['interact'][p2.color]['factor']
      if (p1.mass > 0 && p2.mass > 0) { // interactions involving inertia
        apply_universals(distance, p1, p2, dx, dy)
      }
      apply_rules(p1, p2, dx, dy, distance)
    }
  }

}

const movaverage = (key, value) => {
  const history = 10
  if (this[key] === undefined) {
    this[key] = value ? value : 0
  }
  if (value) {
    this[key] = (this[key] * history + value) / (history + 1)
  }
  return this[key]
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

// Update Frames
let prev_ms = new Date().valueOf() - 1000/60
update()

function update() {
  // Update Canvas Dimensions - if screen size changed
  updateCanvasDimensions()
  const now_ms = new Date().valueOf()
  const fps = 1000 / (now_ms - prev_ms)
  document.getElementById('FPS').innerText = Math.round(movaverage('fps', 1000 / (now_ms - prev_ms)))
  prev_ms = now_ms

  const draw = (x, y, c, sx) => {
    context.fillStyle = c
    // context.fillRect(x, y, sx, sy)
    context.beginPath()
    context.arc(x, y, sx/2, 0, 2 * Math.PI, false)
    context.fill()
  }
      
  interact()
  moveParticles()
  // m.clearRect(0, 0, canvas.width, canvas.height)
  // draw(0, 0, "black", canvas.width/3, canvas.height/2)
  for (i = 0; i < particles.length; i += 1) {
    const p = particles[i]
    draw(p.x, p.y, p.color, p.size)
    // draw_vector(p.x, p.y, p.color, p.vx*10, p.vy*10)
  }
  requestAnimationFrame(update)
}
