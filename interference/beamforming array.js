const C = 299792458 // speed limit in m/s
const P2M = 1 // how many meters per point
const P_SIZE = 2
const ARRAY_SIZE = 12
const FREQUENCY = 142800000
const BRIGHTNESS = 1e7
const WAVELENGTH = C / FREQUENCY
const WAVELENGTH_PT = WAVELENGTH / P2M
const PI = Math.PI


const TESTS_PER_WAVE = 10
const TEST_RADIANS = new Array(TESTS_PER_WAVE).fill(0).map((v, ix) => ix / TESTS_PER_WAVE * 2 * Math.PI)

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
    y: 200,
    r: WAVELENGTH_PT * 0.25,
    direction: -0.10*PI,//-PI/2, // in radians [-Pi..Pi]
    antennas: []
}

// frequency in Hz
const antenna = (frequency, x, y, amplitude = 100, color = 'yellow') => {
    // distance to shift = distance of antenna from array origin * cos(angB-angA)
    // angB - direction of beam
    // angA - direction of antenna from array origin
    const angB = antenna_array.direction
    const dist_from_origin_pt = Math.hypot(x - antenna_array.x, y - antenna_array.y)
    const angA = dist_from_origin_pt === 0 ? 0 : Math.asin((y-antenna_array.y) / dist_from_origin_pt)
    console.log((y - antenna_array.y), (antenna_array.x))
    const phase_dist_pt = dist_from_origin_pt * Math.cos(angB - angA) % WAVELENGTH_PT
    const phase_shift = phase_dist_pt / WAVELENGTH_PT * 2 * PI
    console.log({x ,y, angA, angB, phase_dist_pt, phase_rad: phase_shift})
    return {
        x: x, y: y,
        amplitude: amplitude,
        frequency: frequency,
        wavelength_m: C / frequency,
        wavelength_pt: C / frequency / P2M,
        phase_shift: phase_shift, // in radians [-Pi..Pi]
        color: color
    }
}

// antenna_array.antennas.push(antenna(FREQUENCY, antenna_array.x+800, antenna_array.y+500, BRIGHTNESS * 2 * NUM_ANTENNAS))

// for (let i = 0; i < NUM_ANTENNAS; i++) {
//     const x = antenna_array.x + Math.sin(2 * Math.PI / NUM_ANTENNAS * i) * antenna_array.r
//     const y = antenna_array.y + Math.cos(2 * Math.PI / NUM_ANTENNAS * i) * antenna_array.r
//     antenna_array.antennas.push(
//       antenna( FREQUENCY, 
//                x, 
//                y, 
//                amplitude = BRIGHTNESS ) )
//   }

for (let i = 0; i < ARRAY_SIZE; i++) {
    for (let j = 0; j < ARRAY_SIZE; j++) {
        const x = antenna_array.x + i * antenna_array.r
        const y = antenna_array.y + j * antenna_array.r
        console.log({x,y})
        antenna_array.antennas.push(
            antenna(FREQUENCY,
                x,
                y,
                amplitude = BRIGHTNESS
        ))
        // antenna_array.antennas.push(
        //     antenna(FREQUENCY,
        //         x - 0.25 * WAVELENGTH_PT,
        //         y,
        //         amplitude = BRIGHTNESS
        // ))
    }
}
console.log(antenna_array)


// Update Frames
let prev_ms = new Date().valueOf() - 1000 / 60
let max_brightness = 0
update()

function update() {

    const draw = (x, y, intensity) => {
        const brightness = Math.round(intensity/2000)
        max_brightness = Math.max(brightness, max_brightness)
        context.fillStyle = "hsl(120, 100%, " + brightness + "%)"
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
            draw(cx, cy, intensity)
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
                value['distance_pt'] ** 1
        }, 0))
    }
    // console.log(intensity)
    return intensity / TEST_RADIANS.length / phases.length
}
