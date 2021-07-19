function demonstrating_promise_object() {
    const myPromise = new Promise((resolve, reject) => {
        // "producing code" -- this may take some time
        resolve(4); // when successful
        reject(new Error("Error")); // when error
    });

    myPromise
        .then(function (value) {
            // The producing code for `myPromise` succeeded and resolved some value.
            // So now we can do something with that successful value (like log it to the console!)
            console.log(value);
        })
        .catch(function (error) {
            // The producing code for `myPromise` failed and rejected with some Error object
            // So now we can do something with that Error object (like log it to stderr!)
            console.error(error);
        })
        .finally(function () {
            // code in this block will run regardless of whether the promise resolved or rejected
            console.log(
                "The promise has settled——it either Resolved or Rejected... but it's definitely not pending."
            );
        });
}

async function no_await() {
    return 10;
}

async function main() {
    // console.log(no_await()); // Promise { 10 }
    // console.log(await no_await()); // 10
    // no_await().then(console.log); // 10;

    // // prints `Promise { 10 }`
    // console.log(Promise.resolve(10));

    // prints `10`
    console.log(await Promise.resolve(10).then());

    // this prints `Promise { 10 }`
    console.log(
        (async function () {
            return 10;
        })()
    );

    // this prints `10`
    console.log(
        await (async function () {
            return 10;
        })()
    );

    Promise.resolve(10).then(console.log); // 10
}

// main()
//     .catch(console.error)
//     .finally(() => console.log("finished"));

const promise = new Promise((resolve) => resolve(42));
promise
    .then((val) => {
        console.log(`From first \`.then\`: ${val}`);
        return val;
    })
    .then((val) => {
        console.log(`From second \`.then\`: ${val}`);
        return val;
    });

// console.log("B");
