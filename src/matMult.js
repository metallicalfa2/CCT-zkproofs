/* eslint-disable camelcase */

// const BN = require('bn.js')

// accepts a, b of types Matrix
function MatrixMultiplication (A, B, n, field) {
  let domain = [] // in binary representation
  let ceiling = 0 // ceil(log(base2)n)

  function init () {
    ceiling = Math.ceil(Math.log(n) / Math.log(2))
    function createDomain (str, i) {
      if (str.length >= ceiling) {
        if (domain.length !== n) domain.push(str)
        return
      }
      createDomain(str + '0', i + 1)

      createDomain(str + '1', i + 1)
    }
    createDomain('', 0)
  }

  function getDomain () {
    return domain
  }
  function f_a (a, b) {
    return A.value(a, b, 'binary')
  }
  function f_b (a, b) {
    return B.value(a, b, 'binary')
  }
  function f_a_mle (a, b) {
    // assuming a, b were passed in binary
    function chi_w (wx, wy) {
      let w1 = wx.split('').map(x => parseInt(x, 2)) // values of x1, x2, x3, .... xlogn
      let w2 = wy.split('').map(x => parseInt(x, 2)) // values of y1, y2, y3, .... ylogn

      let Xis = a.split('').map(x => parseInt(x, 2))
      let Yis = b.split('').map(x => parseInt(x, 2))

      let product = 1
      for (let i = 0; i < w1.length; i++) {
        product = product * (w1[i] * Xis[i] + (1 - Xis[i]) * (1 - w1[i]))
        product = product % field
      }
      for (let i = 0; i < w2.length; i++) {
        product = product * (w2[i] * Yis[i] + (1 - Yis[i]) * (1 - w2[i]))
        product = product % field
      }
      return product
    }

    let sum = 0
    for (let i = 0; i < domain.length; i++) {
      for (let j = 0; j < domain.length; j++) {
        let f_a_w = f_a(domain[i], domain[j])
        let term1 = f_a_w * chi_w(domain[i], domain[j])
        sum += term1 % field
      }
    }
    return sum
  }

  return {
    init,
    getDomain,
    f_a,
    f_b,
    f_a_mle
  }
}

function Matrix (n, field) {
  let mat = []
  let domain = []
  let ceiling = 0

  function init () {
    ceiling = Math.ceil(Math.log(n) / Math.log(2))
    function createDomain (str, i) {
      if (str.length >= ceiling) {
        if (domain.length !== n) domain.push(str)
        return
      }
      createDomain(str + '0', i + 1)

      createDomain(str + '1', i + 1)
    }
    createDomain('', 0)

    const A = []
    for (let i = 0; i < n; i++) {
      const arr = []
      for (let j = 0; j < n; j++) {
        if (i === j) {
          arr.push(0)
        } else if (j > i) {
          arr.push(Math.round(Math.random() * 100) % field)
        } else {
          arr.push(A[j][i])
        }
      }
      A.push(arr)
    }
    mat = A
    return A
  }

  function mle (a, b) {
    // assuming a, b were passed in binary
    function chi_w (wx, wy) {
      let w1 = wx.split('').map(x => parseInt(x, 2)) // values of x1, x2, x3, .... xlogn
      let w2 = wy.split('').map(x => parseInt(x, 2)) // values of y1, y2, y3, .... ylogn

      let Xis = a.split('').map(x => parseInt(x, 2))
      let Yis = b.split('').map(x => parseInt(x, 2))

      let product = 1
      for (let i = 0; i < w1.length; i++) {
        product = product * (w1[i] * Xis[i] + (1 - Xis[i]) * (1 - w1[i]))
        product = product % field
      }
      for (let i = 0; i < w2.length; i++) {
        product = product * (w2[i] * Yis[i] + (1 - Yis[i]) * (1 - w2[i]))
        product = product % field
      }
      return product
    }

    let sum = 0
    for (let i = 0; i < domain.length; i++) {
      for (let j = 0; j < domain.length; j++) {
        let f_a_w = value(domain[i], domain[j], 'binary')
        let term1 = f_a_w * chi_w(domain[i], domain[j])
        sum += term1 % field
      }
    }
    return sum
  }

  function value (a, b, type) {
    // if (a >= a || b >= n) return undefined
    let tempX = 0
    let tempY = 0
    if (type === 'binary') {
      tempX = parseInt(a, 2)
      tempY = parseInt(b, 2)
    } else {
      tempX = parseInt(a)
      tempY = parseInt(b)
    }

    return mat[tempX][tempY]
  }
  function print () {
    for (let i = 0; i < n; i++) {
      console.log(...mat[i])
    }
    console.log('\n')
  }
  function returnMat () {
    return mat
  }
  function returnDomain () {
    return domain
  }

  init()

  return {
    init,
    value,
    print,
    mle,
    returnMat,
    returnDomain
  }
}

module.exports = {
  Matrix,
  MatrixMultiplication
}
