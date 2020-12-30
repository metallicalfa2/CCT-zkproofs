// const { Hash, stringToCoefficients } = require('../src/hash')
// const { multilinearExtension } = require('../src/mle')
// const { getDAG } = require('../src/boolean')
// const { H, s } = require('../src/sumcheck')
const { deepStrictEqual, fail, rejects, strictEqual } = require('assert')
const assert = require('assert')
const BN = require('bn.js')
const utils = require('../src/utils')
const ec = utils.ec
const { SumCheckProtocol } = require('../src/sumCheckProtocol')
const { Z_ASCII } = require('zlib')

describe('Basic', function () {
  describe('utils', function () {
    it('calculation boolean hypercube-v space', function () {
      const v = 4
      const array = Array(v + 1).fill(null)

      const printArray = function (array, i) {
        if (array.length === i) {
          return
        }
        const arr = array
        arr[i] = 0
        printArray(arr, i + 1)

        arr[i] = 1
        printArray(arr, i + 1)
      }

      printArray(array, 0)
    })
  })
})

describe('Sum check protocol', function () {
  /**
   * Sum check protocol
   * H = ∑∑∑∑∑∑...g(v1, v2, v3, ....)
   */
  it('calculate H', function () {
    const size = new BN(Math.floor(Math.random() * 1000))
    // let g(x1, x2, x3) = 2*x1^2 + x1*x2 + x3
    const g = function (x) {
      const value = new BN(x[0]).pow(new BN(2)).mul(new BN(2)).add(new BN(x[0]).mul(new BN(x[1]))).add(new BN(x[2]))
      // console.log(`X=${x}, g(X)=${value}`)
      return value
    }

    const protocol = SumCheckProtocol(g, 3, size)
    const H = protocol.H()
    deepStrictEqual(H.toString(10), '14')
  })
  it('calculate siXi', function () {
    // let g(x1, x2, x3) = 2*x1^2 + x1*x2 + x3
    const size = new BN(Math.floor(Math.random() * 1000)).add(new BN('138'))
    const g = function (x) {
      const value = new BN(x[0]).pow(new BN(2)).mul(new BN(2)).add(new BN(x[0]).mul(new BN(x[1]))).add(new BN(x[2]))
      // console.log(`X=${x}, g(X)=${value}`)
      return value
    }

    const protocol = SumCheckProtocol(g, 3, size)
    const s1x1 = protocol.siXi(1, [])
    const g1Value = s1x1(4).umod(size) // assuming that verifier has oracle access to g
    deepStrictEqual(g1Value.toString(10), '138')
  })

  it('initial IP', function () {
    console.time('IP')
    const size = new BN(Math.floor(Math.random() * 100000)) // |F|
    const v = 4 // v-variate polynomial
    const d = new BN(2)
    // console.log(`init IP, size=${size}, v=${v}`)

    // let g(x1, x2, x3) = 2*x1^2 + x1*x2 + x3 + x2*x4
    // x = [1,2,3,4] all non-null elements
    const g = function (x) {
      const value = new BN(x[0]).pow(new BN(2)).mul(new BN(2)).add(new BN(x[0]).mul(new BN(x[1]))).add(new BN(x[2])).add(new BN(x[1]).mul(new BN(3)))
      // console.log(`X=${x}, g(X)=${value}`)
      return value
    }

    const protocol = SumCheckProtocol(g, v, size)

    // Prover, P
    // calculate H and send to V
    // calculate g1(X1) and send to V
    const H = protocol.H().umod(size) // claimed
    const g1X1 = protocol.siXi(1, [])

    // V, round1
    // has access to H, g1(X1), oracle access to g
    // add check for max degree
    const C1 = g1X1(0).add(g1X1(1)).umod(size)
    deepStrictEqual(C1.toString('hex'), H.toString('hex'), 'C1 = H = true') // c1 === h
    const r1 = Math.floor(Math.random() * size) - 1 // calculate randomness, send to P
    // console.log(r1)

    // P, round2
    // has access to r1 now
    const g2X2 = protocol.siXi(2, [r1])

    // V, round2
    // has access to g2X2
    const claimedC2 = g2X2(0).add(g2X2(1)).umod(size)
    const g1X1r1 = g1X1(r1).umod(size)
    // console.log(claimedC2.toString(10), g1X1r1.toString(10))
    deepStrictEqual(claimedC2.toString('hex'), g1X1r1.toString('hex'), 'C2 = g1X1r1')
    const r2 = Math.floor(Math.random() * size) - 1 // send to P

    // P, round3
    // has access to r2
    const g3X3 = protocol.siXi(3, [r1, r2])

    // V, round3
    // has access to g3X3
    const claimedC3 = g3X3(0).add(g3X3(1)).umod(size)
    const g2X2r2 = g2X2(r2).umod(size)
    // console.log(claimedC3.toString(10), g2X2r2.toString(10))
    deepStrictEqual(claimedC3.toString('hex'), g2X2r2.toString('hex'), 'C3 = g2X2r2')
    const r3 = Math.floor(Math.random() * size) - 1 // send to P

    // P, round4
    // has access to r3 now
    const g4X4 = protocol.siXi(4, [r1, r2, r3]) // send to V

    // V, round4
    // has access to g4x4 now
    const claimedC4 = g4X4(0).add(g4X4(1)).umod(size)
    const g3x3r3 = g3X3(r3)
    // console.log(claimedC3.toString(10), g2X2r2.toString(10))
    deepStrictEqual(claimedC4.toString('hex'), g3x3r3.toString('hex'), 'C4 = g3x3r3')

    // Final round
    // choose r4
    const r4 = Math.floor(Math.random() * size) - 1
    const finalOracle = g([r1, r2, r3, r4]).umod(size)
    const g4X4r4 = g4X4(r4).umod(size)
    deepStrictEqual(finalOracle.toString('hex'), g4X4r4.toString('hex'), 'finalOracle = g4X4r4')

    // soundness errors
    // const soundnessError = new BN(v).mul(d).mul(new BN(10000)).div(size)
    // console.log(`soundness error 0.000${soundnessError.toString(10)}`)

    console.timeEnd('IP')
  })
})

describe('#SAT problem', function () {
  it('Phi to Psi', function () {
    // construction of XNOR gate
    // phi = a.b + a`.b`,  a`=not(a)
    // S=3 gates
    const phi = function (x) {
      // basic gate construction
      function and (a, b) {
        return a === b && a === 1 ? 1 : 0
      }
      function or (a, b) {
        return a === 1 || b === 1 ? 1 : 0
      }
      function not (a) {
        return a === 1 ? 0 : 1
      }
      const exp1 = and(x[0], x[1])
      const exp2 = and(not(x[0]), not(x[1]))
      return or(exp1, exp2)
    }
    deepStrictEqual(phi([0, 1]), 0, '[0,1]=0')

    // convert to psi
    // and -> x.y, or -> x+y - x.y, not -> 1-x
    const psi = function (x) {
      // transformation of gates into arithmetic circuits
      function and (a, b) {
        return new BN(a).mul(new BN(b)).umod(new BN(2))
      }
      function or (a, b) {
        return new BN(a).add(new BN(b)).sub(and(a, b)).umod(new BN(2))
      }
      function not (a) {
        return new BN(1).sub(new BN(a)).umod(new BN(2))
      }
      const exp1 = and(x[0], x[1])
      const exp2 = and(not(x[0]), not(x[1]))
      return or(exp1, exp2)
    }
    deepStrictEqual(psi([0, 1]).toString(10), '0', '[0,1]=0')
  })
  it('Sum check protocol', function () {
    // phi = (a.b).c` + d.e
    // S=5 gates
    const phi = function (x) {
      // basic gate construction
      function and (a, b) {
        return a === b && a === 1 ? 1 : 0
      }
      function or (a, b) {
        return a === 1 || b === 1 ? 1 : 0
      }
      function not (a) {
        return a === 1 ? 0 : 1
      }
      const exp1 = and(and(x[0], x[1]), not(x[2]))
      const exp2 = and(x[3], x[4])
      return or(exp1, exp2)
    }
    // add the recursion from SumCheckProtocol.H() to create the input<>output table
    deepStrictEqual(phi([1, 1, 0, 1, 1]), 1, '[ 1, 1, 0, 1, 1 ]=1')

    // convert to psi
    // and -> x.y, or -> x+y - x.y, not -> 1-x
    const psi = function (x) {
      // transformation of gates into arithmetic circuits
      function and (a, b) {
        return new BN(a).mul(new BN(b)).umod(new BN(2))
      }
      function or (a, b) {
        return new BN(a).add(new BN(b)).sub(and(a, b)).umod(new BN(2))
      }
      function not (a) {
        return new BN(1).sub(new BN(a)).umod(new BN(2))
      }
      // copy the gates logic from phi function, and override and, or, not with arithmetic logic
      const exp1 = and(and(x[0], x[1]), not(x[2]))
      const exp2 = and(x[3], x[4])
      return or(exp1, exp2)
    }

    // Sum check protocol
    const size = new BN(Math.floor(Math.random() * 100000)) // |F|
    const v = 5 // 5 variables
    const g = function (x) {
      return psi(x) // without reductions in coefficients
    }
    const protocol = SumCheckProtocol(g, v, size)
    const transcript = protocol.generateTranscript()
    console.log(transcript)
    // deepStrictEqual(transcript.length, 5)
  })
})
