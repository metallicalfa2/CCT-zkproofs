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

  function siXi (xindex) {
    // run 2^v-1 calculations

    const array = Array(v).fill(null)
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
        sum = sum.add(el(xvalue))
        return sum
      })
      return sum
    }
  }

  return {
    H,
    siXi
  }
}

module.exports = {
  SumCheckProtocol
}
