const C = 299792458 // speed limit in m/s
const P2M = 1 // how many meters per point
const P_SIZE = 1
const NUM_ANTENNAS = 5
const FREQUENCY = 142800000
const BRIGHTNESS = 1e8
const WAVELENGTH = C / FREQUENCY
const WAVELENGTH_PT = WAVELENGTH / P2M
const PI = Math.PI

const TESTS_PER_WAVE = 10
const TEST_RADIANS = new Array(TESTS_PER_WAVE).fill(0).map((v, ix) => ix / TESTS_PER_WAVE * 2 * Math.PI)

let sinArray = new Array(360)
for (var i = 0; i < 360; i++) {
    sinArray[i] = Math.sin(i * Math.PI / 180)
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

// Canvas
const canvas = document.getElementById('canvas')
const updateCanvasDimensions = () => {
    canvas.width = window.innerWidth - 30
    canvas.height = window.innerHeight - 30
}
updateCanvasDimensions()
const context = canvas.getContext("2d")


const TARGET = { x: 1200, y: 100, r: 20 }

const antenna_array = {
    x: 150,
    y: 150,
    r: WAVELENGTH_PT * 0.5,
    antennas: []
}

// frequency in Hz
const antenna = (frequency, x, y, shift = 0, amplitude = 100, color = 'yellow') => {
    return {
        x: x, y: y,
        amplitude: amplitude,
        frequency: frequency,
        wavelength_m: C / frequency,
        wavelength_pt: C / frequency / P2M,
        phase_shift: shift, // in radians [-Pi..Pi]
        color: color
    }
}

// antenna_array.antennas.push(antenna(FREQUENCY, antenna_array.x+800, antenna_array.y, 0, BRIGHTNESS * 2 * NUM_ANTENNAS))

for (let i = 0; i < NUM_ANTENNAS; i++) {
    const x = antenna_array.x
    const y = antenna_array.y + i * antenna_array.r
    antenna_array.antennas.push(
        antenna(FREQUENCY,
            x,
            y,
            phase_shift = 0, 
            amplitude = BRIGHTNESS
    ))
    antenna_array.antennas.push(
        antenna(FREQUENCY,
            x + WAVELENGTH_PT * 0.25,
            y,
            phase_shift = PI/2, 
            amplitude = BRIGHTNESS
    ))
}
console.log(antenna_array)


// Update Frames
let prev_ms = new Date().valueOf() - 1000 / 60
update()

function update() {

    const draw = (x, y, color) => {
        context.fillStyle = "rgb(" + color.R + "," + color.G + "," + color.B + ")"
        // console.log(color, context.fillStyle)
        context.fillRect(x, y, P_SIZE, P_SIZE)
    }

    const draw_target = (x=TARGET.x, y=TARGET.y, r=TARGET.r, c="white") => {
        context.strokeStyle = c
        // context.fillRect(x, y, sx, sy)
        context.beginPath()
        context.arc(x, y, r, 0, 2 * Math.PI, false)
        context.stroke()
      }
    
    // Update Canvas Dimensions - if screen size changed
    updateCanvasDimensions()
    const now_ms = new Date().valueOf()
    document.getElementById('FPS').innerText = Math.round(movaverage('fps', 1000 / (now_ms - prev_ms)))
    prev_ms = now_ms

    for (let cx = 0; cx < canvas.width; cx += P_SIZE) {
        for (let cy = 0; cy < canvas.height; cy += P_SIZE) {
            // Calculate phase of wave for each antenna
            const phases = antenna_array.antennas.map(a => {
                const phase_incr_pt = a.wavelength_pt * a.phase_shift / 2 / PI
                const distance_pt = Math.hypot(a.x-cx, a.y-cy)
                const phase_dist_pt = (phase_incr_pt + distance_pt) % WAVELENGTH_PT
                const phase_rad = phase_dist_pt / WAVELENGTH_PT * 2 * PI
                return {phase_rad, distance_pt, 'amplitude': a.amplitude}
            })
            // Sum up the phases from all antennas
            const intensity = getIntensity(phases)
            // console.log(intensity)
            draw(cx, cy, {R: intensity, G: intensity, B: intensity})
        }
    }
    draw_target(TARGET.x, TARGET.y, TARGET.r, "red")
    for (let a = 0; a < antenna_array.antennas.length; a++) {
        const antenna = antenna_array.antennas[a]
        draw_target(antenna.x, antenna.y, 5, "black")
    }
    // requestAnimationFrame(() => update((antenna_to_tune + 1) % antenna_array.antennas.length))

}

function getIntensity(phases) {
    let intensity = 0
    for (let i = 0; i < TEST_RADIANS.length; i++) {
        intensity += Math.abs(phases.reduce((accumulator, value) => {
            return accumulator + 
                value['amplitude'] *
                Math.sin(value['phase_rad'] + TEST_RADIANS[i]) / 
                value['distance_pt'] ** 2
        }, 0))
    }
    // console.log(intensity)
    return intensity / TEST_RADIANS.length / phases.length
}
