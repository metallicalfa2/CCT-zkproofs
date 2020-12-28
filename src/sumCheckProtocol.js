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
        sum = sum.add(g(array))
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
  return {
    H
  }
}

module.exports = {
  SumCheckProtocol
}
