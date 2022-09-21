const C = 299792458 // speed limit in m/s
const P2M = 1 // how many meters per point
const P_SIZE = 0
const NUM_ANTENNAS = 2
const FREQUENCY = 142800000
const WAVELENGTH = C / FREQUENCY
const WAVELENGTH_PT = WAVELENGTH / P2M


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


const TARGET = {x:1200, y:100, r:20}
const antenna_array = {
  x: 400,
  y: 500,
  r: WAVELENGTH_PT * 0.25,
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
             shift = 0, // (Math.hypot(TARGET.x-x, TARGET.y-y) % WAVELENGTH_PT) / WAVELENGTH_PT + 1/4, 
             amplitude = 255,
             { R:Math.random()*255,
               G:Math.random()*255,
               B:Math.random()*255 } ) )
}
console.log(antenna_array)

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
update(1)

function update(antenna_to_tune) {

  const draw_target = (x=TARGET.x, y=TARGET.y, r=TARGET.r, c="white") => {
    context.strokeStyle = c
    // context.fillRect(x, y, sx, sy)
    context.beginPath()
    context.arc(x, y, r, 0, 2 * Math.PI, false)
    context.stroke()
  }

  const draw = (x, y, intensity) => {
    context.fillStyle = "rgb("+255*Math.abs(intensity.R)+","+255*Math.abs(intensity.G)+","+255*Math.abs(intensity.B)+")"
    // console.log('fs', context.fillStyle)
    context.fillRect( x, y, P_SIZE, P_SIZE )
  }

  // I'm looking for highest intensity at immediate surroundings of TARGET
  const tune = (the_antenna) => {
    // console.log('tuning', JSON.stringify(the_antenna))
    the_antenna.shift = 0 // reset the antenna
    const target_distance_steps = TARGET.r
    const target_angle_steps = 10
    const phase_steps = 360
    const best_tuning = {phase: 0, value: 0}
    for (let p = 0; p < phase_steps; p++) {
      the_antenna.shift = p / phase_steps
      let sum_intensity = sumIntensity(target_distance_steps, target_angle_steps)
      // console.log('sum of intensity', sum_intensity)
      sum_intensity = sum_intensity / target_distance_steps / target_angle_steps
      if (sum_intensity > best_tuning.value) {
        best_tuning.phase = the_antenna.shift
        best_tuning.value = sum_intensity
        // console.log('Found better tuning', JSON.stringify(best_tuning))
      }
    }
    the_antenna.shift = best_tuning.phase
    console.log('post tuning', JSON.stringify(best_tuning))
  }

  const tune2 = () => {
    const target_angle_steps = 10
    const current_tuning = antenna_array.antennas.map(a => a.shift)
    let best_tuning = {phase_conf: antenna_array.antennas.map(a => a.shift), value: sumIntensity(TARGET.r, target_angle_steps)}
    let found_better = false
    console.log('previous best', JSON.stringify(best_tuning))
    for (let i = 0; i < 1000; i++) {
      for (let aix = 0; aix < antenna_array.antennas.length; aix++) {
        antenna_array.antennas[aix].shift = Math.random()
      }
      const sum_intensity = sumIntensity(TARGET.r, target_angle_steps)
      if (sum_intensity > best_tuning.value) {
        found_better = true
        best_tuning = {phase_conf: antenna_array.antennas.map(a => a.shift), value: sum_intensity}
      }
    }
    if (found_better === true) {
      for (let i = 0; i < best_tuning.phase_conf.length; i++) {
        antenna_array.antennas[i].shift = best_tuning.phase_conf[i]
      }
      console.log('new best', JSON.stringify(best_tuning))
    } else {
      for (let i = 0; i < best_tuning.phase_conf.length; i++) {
        antenna_array.antennas[i].shift = current_tuning[i]
      }
      tune2()
    }
  }

  // Update Canvas Dimensions - if screen size changed
  updateCanvasDimensions()
  const now_ms = new Date().valueOf()
  // const fps = 1000 / (now_ms - prev_ms)
  document.getElementById('FPS').innerText = Math.round(movaverage('fps', 1000 / (now_ms - prev_ms)))
  prev_ms = now_ms

  // tune(antenna_array.antennas[antenna_to_tune])
  tune2()

  // m.clearRect(0, 0, canvas.width, canvas.height)
  // draw(0, 0, "black", canvas.width/3, canvas.height/2)
  for (let cx = 0; cx < canvas.width; cx += P_SIZE) {
    for (let cy = 0; cy < canvas.height; cy += P_SIZE) {
      // let field = 0
      let field = {R:0, G:0, B:0}
      // for (let a = 0; a < antenna_array.antennas.length; a++) {
      //   const antenna = antenna_array.antennas[a]
      //   const distance_pt = Math.hypot(antenna.x-cx, antenna.y-cy)
      //   // const distance_pt = Math.sqrt((antenna.x-cx)**2 + (antenna.y-cy)**2)
      //   // const distance_pt = Math.abs(antenna.x-cx) + Math.abs(antenna.y-cy)
      //   // const distance_m = distance_pt * P2M
      //   const intensity = getIntensity0(distance_pt, antenna)
      //   field.R += intensity * antenna.color.R
      //   field.G += intensity * antenna.color.G
      //   field.B += intensity * antenna.color.B
      //   // field += intensity
      // }
      // // const intensity = Math.round(Math.abs(field * 100))
      // console.log(field)
      // draw(cx, cy, field)
      const intensity = getIntensity(cx, cy) * 255
      field.R += intensity
      field.G += intensity
      field.B += intensity
    draw(cx, cy, field)
    }
  }
  draw_target(TARGET.x, TARGET.y, TARGET.r, "red")
  for (let a = 0; a < antenna_array.antennas.length; a++) {
    const antenna = antenna_array.antennas[a]
    draw_target(antenna.x, antenna.y, 5, "black")
  }
  console.log(antenna_array.antennas.map(a => a.shift))
  // antenna_array.antennas[0].shift += Math.random()/2000
  // antennas[1].shift += 0.15
  requestAnimationFrame(() => update((antenna_to_tune + 1) % antenna_array.antennas.length))

  function sumIntensity(target_distance_steps, target_angle_steps) {
    let sum_intensity = 0
    for (let r = 0; r < target_distance_steps; r++) { // scan around the TARGET
      for (let i = 0; i < target_angle_steps; i++) {
        const theta = 2 * Math.PI / target_angle_steps * i
        const poi = {
          x: TARGET.x + Math.sin(theta) * r,
          y: TARGET.y + Math.cos(theta) * r
        }
        sum_intensity += getIntensity(poi.x, poi.y)
      }
    }
    return sum_intensity
  }
}

function getIntensity(x, y) {
  const phase_steps = 360
  const distance_pt = antenna_array.antennas.map(a => Math.hypot(x-a.x, y-a.y))
  let intensity = 0
  for (let pix = 0; pix < phase_steps; pix++) {
    const phase_incr = pix / phase_steps
    let p_intensity = 0
    for (let aix = 0; aix < antenna_array.antennas.length; aix++) {
      const antenna = antenna_array.antennas[aix]
      const phase_reminder_pt = (distance_pt[aix] + (antenna.shift + phase_incr) * antenna.wavelength_pt) % antenna.wavelength_pt
      const sin_t = Math.sin(phase_reminder_pt / antenna.wavelength_pt * 2 * Math.PI)
      p_intensity += antenna.amplitude * sin_t / distance_pt[aix] ** 2
    }
    intensity += Math.abs(p_intensity)
  }
  return intensity / phase_steps
}

function getIntensity0(distance_pt, antenna) {
  const phase_reminder_pt = (distance_pt + antenna.shift * antenna.wavelength_pt) % antenna.wavelength_pt
  // const sin_t = sinArray[Math.round(phase_reminder_pt / antenna.wavelength_pt * 360)]
  const sin_t = Math.sin(phase_reminder_pt / antenna.wavelength_pt * 2 * Math.PI)
  const intensity = antenna.amplitude * sin_t / distance_pt ** 2
  return Math.abs(intensity)
}

