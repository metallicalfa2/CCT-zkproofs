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
    // let g(x1, x2, x3) = 2*x1^2 + x1*x2 + x3
    const g = function (x) {
      const value = new BN(x[0]).pow(new BN(2)).mul(new BN(2)).add(new BN(x[0]).mul(new BN(x[1]))).add(new BN(x[2]))
      // console.log(`X=${x}, g(X)=${value}`)
      return value
    }

    const protocol = SumCheckProtocol(g, 3, 1000)
    const H = protocol.H()
    const s1x1 = protocol.siXi(1)
    const g1Value = s1x1(4) // assuming that verifier has oracle access to g
    deepStrictEqual(H.toString(10), '14')
    deepStrictEqual(g1Value.toString(10), '138')
  })
})
