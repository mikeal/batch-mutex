const assert = require('assert')
const main = require('../')

const sum = (x, y) => x + y

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const basicTest = async max => {
  let init = true
  let final = false
  const totals = []
  let goal = 0
  let allWrites = 0
  const batch = async writes => {
    const total = writes.map(o => o[0]).reduce(sum)
    totals.push(total)
    allWrites += writes.length
    await sleep(100)
    if (init) {
      init = false
    } else {
      if (final) return
      final = true
      let i = 0
      while (i < 1000) {
        write(i)
        i++
        goal++
      }
    }
  }
  const write = main(batch, max)
  let i = 0
  while (i < 500) {
    i++
    goal++
    await write(i)
  }
  await write.onEmpty()
  assert.strictEqual(goal, allWrites)
  return totals
}

exports.testBatch = async () => {
  const totals = await basicTest(100)
  assert.deepStrictEqual(totals, [1, 5252, 514953, 25654, 35855, 43035])
}
exports.testBatchDefault = async () => {
  const totals = await basicTest()
  assert.deepStrictEqual(totals, [1, 125249, 499500])
}
exports.testEmpty = async () => {
  const write = main(() => {})
  assert.strictEqual(write.onEmpty(), true)
}
