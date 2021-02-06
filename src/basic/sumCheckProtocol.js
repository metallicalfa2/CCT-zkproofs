const BN = require('bn.js')

/**
 *
 * @param {function} g // v-variate function
 * @param {Number} v // v
 * @param {Number} size // |F|
 */
const SumCheckProtocol = function (g, v, size) {
  function H () {
    // run 2^v calculations

    let sum = new BN(0)
    const array = Array(v).fill(null)
    // let totalCount = 0
    const sumRecursion = function (array, i) {
      if (array.length === i) {
        // totalCount++
        sum = sum.add(g(array)).umod(size)
        return
      }
      const arr = array
      arr[i] = 0
      sumRecursion(arr, i + 1)

      arr[i] = 1
      sumRecursion(arr, i + 1)
    }
    sumRecursion(array, 0)
    return sum
  }

  function siXi (xindex, Rs) {
    // run 2^v-1 calculations

    const array = Array(v).fill(null)
    Rs.map((el, index) => {
      array[index] = el
      return el
    })
    // console.log(array)
    const funcs = [] // used later

    const sumRecursion = function (array, i) {
      if (array.length === i) {
        const arr = JSON.parse(JSON.stringify(array)) // deep copy
        funcs.push(function (xvalue) {
          arr[xindex - 1] = xvalue
          return g(arr)
        })
        return
      }
      const arr = array
      arr[i] = 0
      sumRecursion(arr, i + 1)

      arr[i] = 1
      sumRecursion(arr, i + 1)
    }
    sumRecursion(array, xindex)

    // because can't do math reductions for BN expressions
    return function (xvalue) {
      let sum = new BN(0)
      funcs.map(el => {
        sum = sum.add(el(xvalue)).umod(size)
        return sum
      })
      return sum
    }
  }

  // works with 5-variate function for now
  // Todo: implement v variate transcripts using a for loop
  function generateTranscript () {
    const transcript = []
    // Prover, P
    // calculate H and send to V
    // calculate g1(X1) and send to V
    const Htotal = H().umod(size) // claimed
    const g1X1 = siXi(1, [])

    // V, round1
    // has access to H, g1(X1), oracle access to g
    // add check for max degree
    const claimedC1 = g1X1(0).add(g1X1(1)).umod(size)
    transcript.push(`claimedC1 = ${claimedC1.toString(10)}, Htotal = ${Htotal.toString(10)}, ${claimedC1.cmp(Htotal) === 0}`)
    const r1 = Math.floor(Math.random() * size) - 1 // calculate randomness, send to P
    // console.log(r1)

    // P, round2
    // has access to r1 now
    const g2X2 = siXi(2, [r1])

    // V, round2
    // has access to g2X2
    const claimedC2 = g2X2(0).add(g2X2(1)).umod(size)
    const g1X1r1 = g1X1(r1).umod(size)
    // console.log(claimedC2.toString(10), g1X1r1.toString(10))
    transcript.push(`claimedC2 = ${claimedC2.toString(10)}, g1X1r1 = ${g1X1r1.toString(10)}, ${claimedC2.cmp(g1X1r1) === 0}`)
    const r2 = Math.floor(Math.random() * size) - 1 // send to P

    // P, round3
    // has access to r2
    const g3X3 = siXi(3, [r1, r2])

    // V, round3
    // has access to g3X3
    const claimedC3 = g3X3(0).add(g3X3(1)).umod(size)
    const g2X2r2 = g2X2(r2).umod(size)
    // console.log(claimedC3.toString(10), g2X2r2.toString(10))
    transcript.push(`claimedC3 = ${claimedC3.toString(10)}, g2X2r2 = ${g2X2r2.toString(10)}, ${claimedC3.cmp(g2X2r2) === 0}`)
    const r3 = Math.floor(Math.random() * size) - 1 // send to P

    // P, round4
    // has access to r3 now
    const g4X4 = siXi(4, [r1, r2, r3]) // send to V

    // V, round4
    // has access to g4x4 now
    const claimedC4 = g4X4(0).add(g4X4(1)).umod(size)
    const g3x3r3 = g3X3(r3)
    // console.log(claimedC3.toString(10), g2X2r2.toString(10))
    transcript.push(`claimedC4 = ${claimedC4.toString(10)}, g3x3r3 = ${g3x3r3.toString(10)}, ${claimedC4.cmp(g3x3r3) === 0}`)

    // Final round
    // choose r4
    const r4 = Math.floor(Math.random() * size) - 1
    const finalOracle = g([r1, r2, r3, r4]).umod(size)
    const g4X4r4 = g4X4(r4).umod(size)
    transcript.push(`finalOracle = ${finalOracle.toString(10)}, g4X4r4 = ${g4X4r4.toString(10)}, ${finalOracle.cmp(g4X4r4) === 0}`)

    return transcript
  }

  return {
    H,
    siXi,
    generateTranscript
  }
}

module.exports = {
  SumCheckProtocol
}
