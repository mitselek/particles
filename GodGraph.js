
class G {
    constructor (seed, f) {
        this.Gv = seed
        this.f = f
    }

    next() {

    }
      = (n) => {
    if (Gv[n] === undefined) { Gv[n] = n - G(G(n-1)) }
    return Gv[n]
}

const f_values = [1, 1]
const f = (n) => {
    return f_values[n] || (f_values[n] = f(n-1) + f(n-2))
}

const g_values = [1, 1]
const g = (n) => {
    return g_values[n] || (g_values[n] = n - g(g(n-1)))
}



console.log(Gv)
G(1)
console.log(Gv)

for (let index = 0; index <= 100000; index++) {
    G(index*1e3)
}

let O = {
    'size': Gv.length,
    'last_value': Gv.slice(-1)
}
console.log({O, Fi: O.size/O.last_value, FI: (1 + Math.sqrt(5)) / 2})