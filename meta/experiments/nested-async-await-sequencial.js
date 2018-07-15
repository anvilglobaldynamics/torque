
const delayAsync = (timeout) => {
  return new Promise((accept, reject) => {
    setTimeout(accept, timeout);
  });
}

(async () => {

  await (async () => {
    console.log("SEQUENCIAL, CATCH INNER");

    const xList = Array(4).fill(0).map((_, i) => i);
    const yList = Array(5).fill(0).map((_, i) => i);

    async function task(x, y) {
      console.log('      ', x, y);
      if (x === 1 && y === 2) {
        throw new Error("Planned Error 1");
      }
      await delayAsync(100);
    }

    async function inner(y) {
      console.log("    inner Start");
      for (let x of xList) {
        try {
          await task(x, y);
        } catch (ex) {
          console.log('      ', 'caught in inner')
        }
      }
      console.log("    inner End");
    }

    async function outer() {
      console.log("  outer Start");
      for (let y of yList) {
        await inner(y);
      }
      console.log("  outer End");
    }

    console.log("Experiment Start");

    try {
      await outer();
    } catch (ex) {
      console.log('      ', 'caught in experiment')
    }
    console.log("Experiment End");

  })();


  await (async () => {
    console.log("SEQUENCIAL, CATCH EXPERIMENT LEVEL");

    const xList = Array(4).fill(0).map((_, i) => i);
    const yList = Array(5).fill(0).map((_, i) => i);

    async function task(x, y) {
      console.log('      ', x, y);
      if (x === 1 && y === 2) {
        throw new Error("Planned Error 1");
      }
      await delayAsync(100);
    }

    async function inner(y) {
      console.log("    inner Start");
      for (let x of xList) {
        await task(x, y);
      }
      console.log("    inner End");
    }

    async function outer() {
      console.log("  outer Start");
      for (let y of yList) {
        await inner(y);
      }
      console.log("  outer End");
    }

    console.log("Experiment Start");

    try {
      await outer();
    } catch (ex) {
      console.log('      ', 'caught in experiment')
    }
    console.log("Experiment End");

  })();

})();