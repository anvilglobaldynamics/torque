
const delayAsync = (timeout) => {
  return new Promise((accept, reject) => {
    setTimeout(accept, timeout);
  });
}

(async () => {

  await (async () => {
    console.log("PARALLEL, CATCH INNER");

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
      await Promise.all(xList.map(async x => {
        try {
          await task(x, y);
        } catch (ex) {
          console.log('      ', 'caught in inner')
        }
      }));
      console.log("    inner End");
    }

    async function outer() {
      console.log("  outer Start");
      await Promise.all(yList.map(async y => {
        try {
          await inner(y);
        } catch (ex) {
          console.log('      ', 'caught in outer')
        }
      }));
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
    console.log("PARALLEL, CATCH OUTER");

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
      await Promise.all(xList.map(async x => {
        // try {
        await task(x, y);
        // } catch (ex) {
        // console.log('      ', 'caught in inner')
        // }
      }));
      console.log("    inner End");
    }

    async function outer() {
      console.log("  outer Start");
      await Promise.all(yList.map(async y => {
        try {
          await inner(y);
        } catch (ex) {
          console.log('      ', 'caught in outer')
        }
      }));
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
    console.log("PARALLEL, CATCH EXPERIMENT");

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
      await Promise.all(xList.map(async x => {
        // try {
        await task(x, y);
        // } catch (ex) {
        // console.log('      ', 'caught in inner')
        // }
      }));
      console.log("    inner End");
    }

    async function outer() {
      console.log("  outer Start");
      await Promise.all(yList.map(async y => {
        // try {
        await inner(y);
        // } catch (ex) {
        // console.log('      ', 'caught in outer')
        // }
      }));
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