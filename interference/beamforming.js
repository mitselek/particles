const C = 299792458 // speed limit in m/s
const M2P = 1 // how many meters per point
const P_SIZE = 2
const ARRAY_SIZE = 4
const FREQUENCY = 142800000
const BRIGHTNESS = 1e7
const WAVELENGTH = C / FREQUENCY
const WAVELENGTH_PT = WAVELENGTH / M2P
const PI = Math.PI


const TESTS_PER_WAVE = 10
const TEST_RADIANS = new Array(TESTS_PER_WAVE).fill(0).map((v, ix) => ix / TESTS_PER_WAVE * 2 * Math.PI)
const TARGET = { x: 290, y: 150, r: 10 }


class Antenna {
    constructor (frequency, x, y, target, amplitude = 100) {
        this.x = x
        this.y = y
        this.amplitude = amplitude
        this.frequency = frequency
        this.wavelength = C / this.frequency
        this.target_distance = Math.hypot(target.x-x, target.y-y)
        // this.target_direction = Math.asin((target.y-y)/this.target_distance)
        this.phase_dist = this.target_distance % this.wavelength
        this.phase_shift = this.phase_dist / this.wavelength * 2 * PI

        console.log(this)
    }
}

class AntennaArray {
    constructor (x, y) {
        this.x = x
        this.y = y
        this.r = WAVELENGTH * 0.75,
        this.antennas = []
    }

    add (frequency, x, y, target, amplitude) {
        this.antennas.push(
            new Antenna(frequency, x, y, target, amplitude)
        )
    }
}

const antenna_array = new AntennaArray(200,150)

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


for (let i = 0; i < ARRAY_SIZE; i++) {
    for (let j = 0; j < ARRAY_SIZE; j++) {
        const x = antenna_array.x + i * antenna_array.r
        const y = antenna_array.y + j * antenna_array.r
        antenna_array.add(FREQUENCY, x, y, TARGET, BRIGHTNESS)
    }
}
console.log(antenna_array)


// Update Frames
let prev_ms = new Date().valueOf() - 1000 / 60
let max_brightness = 0
update()

function update() {

    const draw = (x, y, intensity) => {
        // console.log('draw', x, y, intensity)
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
                const phase_incr = a.wavelength * a.phase_shift / 2 / PI
                const distance = Math.hypot(a.x-cx, a.y-cy)
                const phase_dist = (phase_incr + distance) % WAVELENGTH
                const phase_rad = phase_dist / WAVELENGTH * 2 * PI
                return {phase_rad, distance, 'amplitude': a.amplitude}
            })
            // Sum up the phases from all antennas
            const intensity = getIntensity(phases)
            // console.log(intensity, phases)
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
                value['distance'] ** 1
        }, 0))
    }
    // console.log(intensity)
    return intensity / TEST_RADIANS.length / phases.length
}
