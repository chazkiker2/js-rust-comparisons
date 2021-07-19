// ---- Promises that will Resolve to the number 10 ----

function resolveTen() {
    return Promise.resolve(10);
}

async function resolveTenAsync() {
    return 10;
}

function resolveTenPromise() {
    return new Promise((resolve, reject) => {
        resolve(10);
    });
}

// ---- Promises that will Reject ---

function rejectErr() {
    return Promise.reject("Error from rejectErr");
}

async function rejectErrAsync() {
    // return Promise.reject("Error");
    throw "Error from rejectErrAsync";
}

function rejectErrPromise() {
    return new Promise((resolve, reject) => {
        reject("Error from rejectErrPromise");
    });
}

async function callResolveFunctions() {
    // a call to any of the variations without any `await` logic
    // will return a `Promise` object which will resolve to 10.
    //
    // All of the following lines print `Promise { 10 }`
    console.log(resolveTen());
    console.log(resolveTenAsync());
    console.log(resolveTenPromise());

    // or we can use `await` logic which will make the `main` function wait for a promise to settle.
    // This will execute the "producing code" within
    //
    resolveTen().then(console.log); // 10
    console.log(await resolveTenAsync()); // 10
    console.log(await resolveTenPromise()); // 10
}

function callRejectFunctions() {
    // a call to any of the functions that return a rejected promise
    // will result in a rejected `Promise` object.
    [rejectErr(), rejectErrAsync(), rejectErrPromise()]
        // for each rejected promise: log to console and pass in the `.catch` clause
        .forEach((promise) => {
            console.log(promise);
            promise.catch(() => "pass");
        });

    // Error from rejectErr
    rejectErr().catch(console.error);
    // Error from rejectErrAsync
    rejectErrAsync().catch(console.error);
    // Error from rejectErrPromise
    rejectErrPromise().catch(console.error);
}

// ---- Promises that may Resolve and may Reject -----

function maybe() {
    return new Promise((resolve, reject) => {
        if (Math.random() < 0.5) {
            resolve(10);
        } else {
            reject("Error!");
        }
    });
}

function maybeTimeout() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.5) {
                resolve(10);
            } else {
                reject("Error!");
            }
        }, 100);
    });
}

function callMaybeFunctions() {
    let promise_timeouts = [];
    let promises = [];

    for (let i = 0; i < 10; i++) {
        promise_timeouts.push(maybeTimeout());
        promises.push(maybe());
    }

    console.log("Timeout Promises:", promise_timeouts);
    console.log("Promises:", promises);

    const handle_promises = promises => promises.map(promise => {
        
    })

    [promises, promise_timeouts].forEach((promiseList) => {
        for (let i = 0; i < promiseList.length; i++) {
            res = promiseList[i].then((res) => res).catch(res);
            console.log(res);
        }
    });

    // [promise_timeouts, promises].forEach((promiseArray) =>
    //     promiseArray.map()
    // );

    console.log("Timeout Promises:", promise_timeouts);
    console.log("Promises:", promises);
}

async function main() {
    await callResolveFunctions();
    callRejectFunctions();
    callMaybeFunctions();
}

main().catch((err) => console.error(`Unhandled Rejection: ${err}`));
