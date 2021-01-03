/* eslint-disable camelcase */
function triangle (n) {
  function generateAdjacencyMatrix () {
    const A = []
    for (let i = 0; i < n; i++) {
      const arr = []
      for (let j = 0; j < n; j++) {
        if (i === j) {
          arr.push(0)
        } else if (j > i) {
          arr.push(Math.round(Math.random()))
        } else {
          arr.push(A[j][i])
        }
      }
      A.push(arr)
    }
    return A
  }
  function isTriangle (matrix, arr) {
    // maps from {0,1}^logn X {0,1}^logn -> {0,1}
    function fA (a, b) {
      return matrix[parseInt(a, 2)][parseInt(b, 2)] === 1 ? 1 : 0
    }
    let X = arr[0]
    let Y = arr[1]
    let Z = arr[2]
    let fA_X = fA(X, Y)
    let fA_Y = fA(Y, Z)
    let fA_Z = fA(X, Z)

    if (fA_X === 1 && fA_Y === 1 && fA_Z === 1) return true
  }
  function countTriangles () {
    /**
     * we use the approach of defining domain as {0,1}^logn * {0,1}^logn -> {0,1}
     */
    const matrix = generateAdjacencyMatrix(n) // random graph
    const ceiling = Math.ceil(Math.log(n) / Math.log(2)) // ceil(log(base2)n)
    const domain = [] // in binary representation
    const str = ''
    const createDomain = function (str, i) {
      if (str.length >= ceiling) {
        if (domain.length !== n) domain.push(str)
        return
      }
      createDomain(str + '0', i + 1)

      createDomain(str + '1', i + 1)
    }
    createDomain(str, 0) // actual domain/6
    let delta = 0

    // consider one 3-tuple once
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        for (let k = j + 1; k < n; k++) {
          // SUM+=fA.fB.fC
          if (isTriangle(matrix, [domain[i], domain[j], domain[k]])) delta++
        }
      }
    }

    // print matrix
    // for (let i = 0; i < matrix.length; i++) {
    //   console.log(...matrix[i])
    // }
    return { count: delta, matrix } // We only consider combinations
  }

  function countTrianglesShorthand (matrix) {
    function multiply (a, b) {
      let numberOfRowsInA = a.length
      let numberOfColumnsInA = a[0].length

      // let numberOfRowsInB = b.length
      let numberOfColumnsInB = b[0].length

      let m = new Array(numberOfRowsInA)
      for (let r = 0; r < numberOfRowsInA; ++r) {
        m[r] = new Array(numberOfColumnsInB)
        for (let c = 0; c < numberOfColumnsInB; ++c) {
          m[r][c] = 0
          for (let i = 0; i < numberOfColumnsInA; ++i) {
            m[r][c] += a[r][i] * b[i][c]
          }
        }
      }
      return m
    }
    let A2 = multiply(matrix, matrix)
    let A3 = multiply(A2, matrix)
    let sum = 0
    // trace(A3)/6
    for (let i = 0; i < n; i++) {
      sum = sum + A3[i][i]
    }
    return sum / 6
  }

  return {
    generateAdjacencyMatrix,
    countTriangles,
    countTrianglesShorthand
  }
}

module.exports = {
  triangle
}
