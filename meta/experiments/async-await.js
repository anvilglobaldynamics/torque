
const delayAsync = async (timeout) => {
  return new Promise((accept, reject) => {
    setTimeout(accept, timeout);
  });
}

const delayCb = (timeout, cbfn) => {
  setTimeout(cbfn, timeout);
}

// =================================== Throw test

const f0 = async () => {
  console.log('B0');
  await delayAsync(42);
  throw new Error("SHIT0")
  console.log('C0');
}

const f1 = async () => {
  console.log('B1');
  await f0();
  await delayAsync(42);
  throw new Error("SHIT")
  console.log('C1');
}

// (async () => {
//   console.log('A');
//   try {
//     await f1();
//   } catch (ex) {
//     console.log(ex.message)
//   }
//   console.log('D');
// })();

// =================================== Array Test

const slowHello = async (name) => {
  await delayAsync(500);
  console.log(`Hello, ${name}`);
}

(async () => {
  let nameList = [
    'John',
    'Adams',
    'Billy',
    'Jeans'
  ];

  console.log('Parallel Start');
  await Promise.all(nameList.map(name => slowHello(name)));
  console.log('Parallel End');

  console.log('Series Start');
  for (let name of nameList) {
    await slowHello(name);
  }
  console.log('Series End');

})();

