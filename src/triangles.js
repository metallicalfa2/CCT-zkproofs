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
    if (matrix[arr[0]][arr[1]] === 1 && matrix[arr[1]][arr[2]] === 1 && matrix[arr[0]][arr[2]] === 1) return true
  }
  function countTriangles () {
    /**
     * we use the approach of defining domain as {0,1}^logn X {0,1}^logn -> {0,1}
     */
    const matrix = generateAdjacencyMatrix(n) // random graph
    const ceiling = Math.ceil(Math.log(n) / Math.log(2)) // ceil(log(base2)n)
    const domain = [] // in binary representation
    const str = ''
    const createDomain = function (str, i) {
      if (str.length >= ceiling) {
        if (domain.length !== n) domain.push(parseInt(str, 2))
        return
      }
      createDomain(str + '0', i + 1)

      createDomain(str + '1', i + 1)
    }
    createDomain(str, 0)

    let delta = 0

    // consider one 3-tuple once
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        for (let k = j + 1; k < n; k++) {
          if (isTriangle(matrix, [domain[i], domain[j], domain[k]])) delta++
        }
      }
    }

    // print matrix
    // for (let i = 0; i < matrix.length; i++) {
    //   console.log(...matrix[i])
    // }
    return delta // because repeated counts
  }
  return {
    generateAdjacencyMatrix,
    countTriangles
  }
}

module.exports = {
  triangle
}
