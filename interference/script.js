const MASSLESS_FRACTION = 1/3 
const MAX_MASS = 5
const G = 0.6
const G_FACTOR = 2
const E = -0.0001
const E_FACTOR = 0.9
const C = 299792458 // speed limit in m/s
const SPEED_LIMIT = C
const P2M = 0.1 // how many meters per point

const randomMass = () => {
  const relative_mass = Math.max(Math.random(), MASSLESS_FRACTION) - MASSLESS_FRACTION
  return relative_mass / (1 - MASSLESS_FRACTION) * MAX_MASS
}



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


// frequency in Hz
// 
const antenna = (frequency, x, y, shift = 0, amplitude = 100, color = 'yellow') => {
  return {
    x: x,
    y: y,
    amplitude: amplitude,
    frequency: frequency,
    wavelength_m: C / frequency,
    wavelength_pt: C / frequency / P2M,
    shift: shift,
    color: color
  }
}

// Create antennas
const antennas = []

antennas.push(antenna(142500000, -50, 200, 0, 255, {R:255,G:0,B:0}))
antennas.push(antenna(142500000, -52, 207, 0, 255, {R:0,G:255,B:0}))
antennas.push(antenna(142500000, -54, 214, 0, 255, {R:0,G:0,B:255}))


console.log(antennas)

// const draw_vector = (x, y, c, vx, vy) => {
//   context.strokeStyle = c
//   context.beginPath(); 
//   context.moveTo(x, y);
//   context.lineTo(x+vx, y+vy);
//   context.stroke(); 
// }


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

// const moveParticles = () => {
//   for (let i = 0; i < particles.length; i++) {
//     const a = particles[i]
//     a.x += a.vx
//     a.y += a.vy
    
//     if (a.x <= 0) {
//       a.vx *= -1
//       a.x = -a.x
//     }
//     if (a.x >= canvas.width) {
//       a.vx *= -1
//       a.x = 2 * canvas.width - a.x
//     }

//     if (a.y <= 0) {
//       a.vy *= -1
//       a.y = -a.y
//     }
//     if (a.y >= canvas.height) {
//       a.vy *= -1
//       a.y = 2 * canvas.height - a.y
//     }
//   }
// }

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

  const draw = (x, y, intensity) => {
    context.fillStyle = "rgba("+255*Math.abs(intensity.R)+","+255*Math.abs(intensity.G)+","+255*Math.abs(intensity.B)+","+1+")"
    // console.log(intensity)
    context.fillRect( x, y, 1, 1 )
  }
      
  // m.clearRect(0, 0, canvas.width, canvas.height)
  // draw(0, 0, "black", canvas.width/3, canvas.height/2)
  for (let cx = 0; cx < canvas.width; cx += 1) {
    for (let cy = 0; cy < canvas.height; cy += 1) {
      let field = {R:0, G:0, B:0}
      for (let a = 0; a < antennas.length; a++) {
        const antenna = antennas[a]
        const distance_pt = Math.sqrt((antenna.x-cx)**2 + (antenna.y-cy)**2)
        // const distance_m = distance_pt * P2M
        const intensity = antenna.amplitude * Math.sin(distance_pt / antenna.wavelength_pt * 2 * Math.PI + antenna.shift) / distance_pt**2
        field.R += intensity * antenna.color.R
        field.G += intensity * antenna.color.G
        field.B += intensity * antenna.color.B
      }
      draw(cx, cy, field)
    }
  }
  antennas[0].shift += 0.1
  antennas[1].shift += 0.15
  requestAnimationFrame(update)
}
