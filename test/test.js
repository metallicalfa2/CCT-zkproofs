// const { Hash, stringToCoefficients } = require('../src/hash')
// const { multilinearExtension } = require('../src/mle')
// const { getDAG } = require('../src/boolean')
// const { H, s } = require('../src/sumcheck')
const { deepStrictEqual, fail, rejects, strictEqual } = require('assert')
const assert = require('assert')
const BN = require('bn.js')
const utils = require('../src/utils')
const ec = utils.ec

function print (el) {
  console.log(el)
}

describe('Basic', function () {
  describe('utils', function () {
    it('should return random field element in the range of secp256k1 field order', function () {
      assert(utils.randomScalar().cmp(ec.curve.p) !== 1)
    })
    it('should return random group element in the range of secp256k1 group order', function () {
      const pt = utils.randomPoint()
      // secp256k1 equation: y^3 = x^2 + 7
      assert(
        pt.x
          .pow(new BN(3))
          .umod(ec.curve.p)
          .add(new BN(7))
          .umod(ec.curve.p)
          .cmp(pt.y.pow(new BN(2)).umod(ec.curve.p)) === 0
      )
    })
  })
})

describe('Sum check protocol', function () {
  it('calculating polynomial at various values', function () {
    // let g(x1, x2) = 2*x1^2 + x1*x2
    const g = function (x1, x2) {
      return new BN(x1).pow(new BN(2)).mul(new BN(2)).add(new BN(x1).mul(new BN(x2)))
    }
    // 2,3
    const value1 = g(2, 3)
    deepStrictEqual(value1.toString(10), '14')
  })
})
