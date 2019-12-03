module.exports = (batch, maxQueue = 1000) => {
  let waiting
  let queue = []
  let onEmpties = []

  const flush = async () => {
    const writes = queue
    queue = []
    waiting = batch(writes)
    await waiting
    waiting = null
    if (queue.length) flush()
    else {
      onEmpties.forEach(e => e())
      onEmpties = []
    }
  }

  const write = (...args) => {
    queue.push(args)
    if (!waiting) flush()
    else if (queue.length > maxQueue) {
      return waiting
    }
  }
  write.onEmpty = () => {
    if (!waiting) return true
    return new Promise(resolve => {
      onEmpties.push(resolve)
    })
  }
  return write
}
