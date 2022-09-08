const C = 299792458 // speed limit in m/s
const P2M = 0.1 // how many meters per point
const P_SIZE = 1
const NUM_ANTENNAS = 15
const FREQUENCY = 142800000
const WAVELENGTH = C / FREQUENCY


let sinArray = new Array(360)
for (var i = 0; i < 360; i++) {
  sinArray[i] = Math.sin(i * Math.PI / 180)
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

const TARGET = {x:800, y:400}
const antenna_array = {
  x: 300,
  y: 300,
  r: WAVELENGTH * 50,
  antennas: []
}

// frequency in Hz
// 
const antenna = (frequency, x, y, shift = 0, amplitude = 100, color = 'yellow') => {
  return { x: x, y: y,
    amplitude: amplitude,
    frequency: frequency,
    wavelength_m: C / frequency,
    wavelength_pt: C / frequency / P2M,
    shift: shift,
    color: color
  }
}

for (let i = 0; i < NUM_ANTENNAS; i++) {
  const x = antenna_array.x + Math.sin(2 * Math.PI / NUM_ANTENNAS * i) * antenna_array.r
  const y = antenna_array.y + Math.cos(2 * Math.PI / NUM_ANTENNAS * i) * antenna_array.r
  antenna_array.antennas.push(
    antenna( FREQUENCY, 
             x, 
             y, 
             shift = (Math.hypot(TARGET.x-x, TARGET.y-y) % WAVELENGTH) / WAVELENGTH, 
             amplitude = 255,
             { R:Math.random()*255,
               G:Math.random()*255,
               B:Math.random()*255 } ) )
}


// Create antennas
const fq = 142800000


console.log(antenna_array)

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

// Update Frames
let prev_ms = new Date().valueOf() - 1000/60
update(0)

function update(skip) {

  const draw_target = () => {
    context.strokeStyle = "white"
    // context.fillRect(x, y, sx, sy)
    context.beginPath()
    context.arc(TARGET.x, TARGET.y, 10, 0, 2 * Math.PI, false)
    context.stroke()
  }

  const draw = (x, y, intensity) => {
    // context.fillStyle = "hsl(120, 100%, " + intensity + "%)"
    // console.log('fs', context.fillStyle)
    context.fillStyle = "rgb("+255*Math.abs(intensity.R)+","+255*Math.abs(intensity.G)+","+255*Math.abs(intensity.B)+")"
    context.fillRect( x, y, P_SIZE, P_SIZE )
  }
  // Update Canvas Dimensions - if screen size changed
  updateCanvasDimensions()
  const now_ms = new Date().valueOf()
  // const fps = 1000 / (now_ms - prev_ms)
  document.getElementById('FPS').innerText = Math.round(movaverage('fps', 1000 / (now_ms - prev_ms)))
  prev_ms = now_ms

  // m.clearRect(0, 0, canvas.width, canvas.height)
  // draw(0, 0, "black", canvas.width/3, canvas.height/2)
  for (let cx = 0; cx < canvas.width; cx += P_SIZE) {
    for (let cy = 0; cy < canvas.height; cy += P_SIZE) {
      // let field = 0
      let field = {R:0, G:0, B:0}
      if (skip === 1) {
        // draw(cx, cy, field)
        // continue
      }
      for (let a = 0; a < antenna_array.antennas.length; a++) {
        const antenna = antenna_array.antennas[a]
        const distance_pt = Math.hypot(antenna.x-cx, antenna.y-cy)
        // const distance_pt = Math.sqrt((antenna.x-cx)**2 + (antenna.y-cy)**2)
        // const distance_pt = Math.abs(antenna.x-cx) + Math.abs(antenna.y-cy)
        // const distance_m = distance_pt * P2M
        const phase_reminder_pt = (distance_pt + antenna.shift*antenna.wavelength_pt) % antenna.wavelength_pt
        // const sin_t = sinArray[Math.round(phase_reminder_pt / antenna.wavelength_pt * 360)]
        const sin_t = Math.sin(phase_reminder_pt / antenna.wavelength_pt * 2 * Math.PI)
        const intensity = antenna.amplitude * sin_t / distance_pt**2
        field.R += intensity * antenna.color.R
        field.G += intensity * antenna.color.G
        field.B += intensity * antenna.color.B
        // field += intensity
      }
      // const intensity = Math.round(Math.abs(field * 100))
      // console.log(field)
      draw(cx, cy, field)
    }
  }
  draw_target()
  console.log(antenna_array.antennas.map(a => a.shift))
  antenna_array.antennas[0].shift += Math.random()/20
  // antennas[1].shift += 0.15
  requestAnimationFrame(() => update(1))
}
