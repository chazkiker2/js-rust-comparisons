function main() {
    // resolved
    new Promise((resolve) => resolve(42));
    // rejected
    new Promise((_, reject) => reject("Error"));
    // rejected
    new Promise(() => {
        throw "Error";
    });
    // as soon as `resolve` or `reject` is executed, the `Promise` will settle accordingly
    new Promise((resolve, reject) => {
        setTimeout(() => resolve(42), 1000);
    });

    // ## Static Promise Methods

    // resolved
    Promise.resolve(42);
    // rejected
    Promise.reject("Error");

    // ## Then and Catch

    // resolved -> resolved
    Promise.resolve().then(() => 42);
    // rejected -> rejected
    Promise.reject().catch(() => Promise.reject("Error"));
    // rejected -> rejected
    Promise.reject().catch(() => {
        throw "Error";
    });

    // The `then` method on a rejected Promise and the `catch` method on a resolved Promise also return a new Promise. They just don't execute the callbacks and are equivalent to the original Promise.

    // stays resolved (42)
    Promise.resolve(42).catch(() => "Error");
    // stays rejected ("Error")
    Promise.reject("Error").then(() => 42);

    // Note: While the value stays the same, the method returns a new Promise object and they are not considered equal.

    // resolved (42)
    const p1 = Promise.resolve(42);
    // resolved (42)
    const p2 = p1.catch(() => "pass");
    let trip_eq = p1 === p2; // false
    let dub_eq = p1 == p2; // false

    // rejected -> resolved
    Promise.reject().catch(() => 42);
    // rejected -> resolved
    Promise.reject().catch(() => Promise.resolve(42));
    // resolved -> rejected
    Promise.resolve().then(() => Promise.reject("Error"));
    // resolved -> rejected
    Promise.resolve().then(() => {
        throw "Error";
    });
}

/*
Async / Await
*/

// returns resolved (42)
async function named_async_resolve() {
    return 42;
}
// returns resolved (42)
const arrow_async_resolve = async () => 42;
// returns rejected ("Error")
async function named_async_reject() {
    return Promise.reject("Error");
}
const arrow_async_reject = async () => {
    throw "Error";
};

/*
Thenables
*/

// resolved (42)
Promise.resolve({ then: (resolve) => resolve(42) });
// rejected ("Error")
Promise.resolve({ then: (_, reject) => reject("Error") });

async function await_blocks() {
    // treated as a Promise, resolves to (42)
    let x = await {
        then(resolve) {
            resolve(888);
        },
    };
    // treated as a Promise, rejects to "Error"
    let y = await {
        then(_, reject) {
            reject("Error");
        },
    };
}
