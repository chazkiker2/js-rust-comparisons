# [WIP] Translating async JS into async Rust <!-- omit in toc -->

> This document is for Rust developers who are familiar with the JavaScript `Promise` and `async`/`await` syntax.
>
> We will walk through each variation of asynchronous code in JavaScript and attempt to mirror each example with the idiomatic equivalent in Rust with `Futures` and `async`/`.await` syntax.
>
> Hopefully, this document will help Rustaceans learning to migrate from JavaScript's `Promise` to Rust's `Future` and from `await` to `.await`

## Author Notes

- The initial motivation for this document was to serve as a resource for Rust developers who are new to async Rust but familiar with JavaScript's Promise and async/await.
- As I worked with async Rust, there were several occasions where I wanted to achieve similar functionality in Rust as I would with the JS Promise API.
- Attempting to write this document quickly exposed several misconceptions I had—both about Rust's `Future` type as well as asynchronous programming as a whole.
- Thankfully, the rust-lang community is a supportive one that is quick to teach. Thanks to all of the people who kindly answered questions, pointed out errors, and helped discuss several points on this topic.
- This document is still a work in progress; comments, feedback, suggestions are incredibly welcome.

## Links & Resources

- JS
  - [Mozilla: JS Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
  - [Mozilla: Using JS Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
  - [Mozilla: The JavaScript Concurrency Model and Event Loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)
- Rust
  - [Async Rust](https://rust-lang.github.io/async-book/01_getting_started/01_chapter.html)
  - [Guide: Implementing `Future` by Hand](https://fasterthanli.me/articles/pin-and-suffering)

## Understanding Async

### [WIP] The JavaScript `Promise` vs Rust `Future`

What is the JS Promise?

From the Mozilla Docs:

> The `Promise` object represents the eventual completion (or failure) of an asynchronous operation and its resulting value.

What is the Rust `Future`?

> A `Future` is an asynchronous computation that can produce a value


The JS `Promise` is either *pending* or *settled*; when settled, the promise is either *fulfilled* or *rejected*.

That means a JS `Promise` is always in one of three states:

- Pending
- Settled: Fulfilled (Settled)
- Settled: Rejected (Settled)

A Rust `Future`, on the other hand, is either *pending* or *ready*.

*What's the difference? "Ready" and "Settled" sound an awful lot alike...* That's because they are! A Rust `Future` will either be pending or ready, just as a JS `Promise` will either be pending or settled.

Some key differences:

- `Promise` "settled" state is always either *fulfilled* or *rejected*, meaning that a `Promise`'s computation has baked in support for a possible failure.
- `Future` "ready" state simply denotes that a value is ready. If you'd like to support the possibility of a failure, you must specify that the returning value is of type `Result` and handle errors yourself!
- Behavior regarding execution of a `Promise` vs a `Future` are where the fundamental differences come in. (More on this later.)

## JavaScript Examples

### Create a `new Promise`

All the JS `new Promise` variations:

```javascript
// resolved (42)
new Promise((resolve) => resolve(42));

// rejected ("Error")
new Promise((_, reject) => reject("Error"));

// rejected ("Error")
new Promise(() => {
    throw "Error";
});

// as soon as `resolve` or `reject` is executed,
// the `Promise` will settle accordingly
new Promise((resolve, reject) => {
    setTimeout(() => resolve(42), 1000);
});
```

JS example to replicate:

```javascript
// JavaScript
async function main() {
  // Promise { 42 }
  const promise = new Promise((resolve) => resolve(42));
  // 42
  const resolved_val = await promise;
}

main().catch(console.error);
```

Rust equivalent:

```rust
// Rust
use std::error::Error;

// Docs: https://docs.rs/tokio/1.8.1/tokio/sync/oneshot/index.html
use tokio::sync::oneshot;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Rust futures do not have built-in support for the output being a failure.
    // You need to use `Result` as a message type to handle that.
    let (resolve, promise) = oneshot::channel::<Result<i32, Box<dyn Error>>>();

    // this is like calling `resolve(42)` in JS
    let _ = resolve.send(Ok(42));

    let resolved_val = promise.await?;

    match resolved_val {
        Ok(value) => println!("Success! Resolved to value {}", value),
        Err(e) => println!("Failure! Rejected to value: {:#?}", e),
    }

    Ok(())
}
```

### Static Methods: `Promise.resolve` and `Promise.reject`

```javascript
// resolved
Promise.resolve(42);

// rejected
Promise.reject("Error");
```

### `then` and `catch`

```javascript
// resolved -> resolved
Promise.resolve().then(() => 42);

// resolved -> resolved
Promise.resolve().then(() => Promise.resolve(42));

// rejected -> rejected
Promise.reject().catch(() => Promise.reject("Error"));

// rejected -> rejected
Promise.reject().catch(() => {
    throw "Error";
});
```

The `then` method on a ***rejected*** `Promise` and the `catch` method on a ***resolved*** `Promise` also return a newly constructed `Promise` object. However, the callbacks are not executed and thus the value of the settled promise remains the same.

```javascript
// stays resolved (42)
Promise.resolve(42).catch(() => "Error");

// stays rejected ("Error")
Promise.reject("Error").then(() => 42);
```

***Note:*** While the settled value remains the same, both `then` and `catch` methods return a newly constructed `Promise` object and they are not considered equal.

```javascript
// resolved (42)
const p1 = Promise.resolve(42);

// resolved (42) -- `.catch` runs, the callback we passed in does not...
// the resulting `Promise` (p2) is a new object
const p2 = p1.catch(() => "pass");

// not considered equal
let trip_eq = p1 === p2; // false
let dub_eq = p1 == p2;  // false
```

### Resolved to Rejected (and vice versa)

```javascript
// rejected -> resolved
Promise.reject().catch(() => 42);
Promise.reject().catch(() => Promise.resolve(42));

// resolved -> rejected
Promise.resolve().then(() => Promise.reject("Error"));
Promise.resolve().then(() => {
    throw "Error";
});
```

### `async`/`await`

```javascript
// returns resolved (42)
// the `async` keyword will wrap the returned `42` in a `Promise`
async function named_async_resolve() {
    return 42;
}

// returns resolved (42)
// the `async` keyword will wrap the returned `42` in a `Promise`!
const arrow_async_resolve = async () => 42;

// returns rejected ("Error")
// `async` fn can returned a rejected promise exactly like a non-async fn
async function named_async_reject() {
    return Promise.reject("Error");
}

// returns rejected ("Error")
// OR an `async` fn will wrap the thrown value in a Promise that will reject!
const arrow_async_reject = async () => {
    throw "Error";
};
```

### Thenables

```javascript
// resolved (42)
Promise.resolve({ then: (resolve) => resolve(42) });

// rejected ("Error")
Promise.resolve({ then: (_, reject) => reject("Error") });

// not super commonly seen in the wild... but good to know this exists
async function await_blocks() {
    // treated as a Promise, resolves to 42
    let x = await {
        then(resolve) {
            resolve(42);
        },
    };

    // treated as a Promise, rejects to "Error"
    let y = await {
        then(_, reject) {
            reject("Error");
        },
    };
}
```

## Possible Misconceptions

### `Future` != `Promise`

> This section is a WIP
>
> TODO: explain why the following attempt doesn't match

You may be tempted, as I was, to simply implement the `Future` trait and call it a day.

My first attempt at mirroring a promise looked like so:

Consider the following JavaScript. In this example, we're creating a new `Promise` that immediately resolves.

```javascript
async function main() {
    const promise = new Promise((resolve) => resolve(42));
    const resolved = await promise;
}
```

My first attempt at mirroring this creation of a Promise in Rust looked like so:

```rust
// Rust
use std::{
    future::{self, Future},
    pin::Pin,
    task::{Context, Poll},
};

// NOTE:
// this code is an example of an incorrect approach to matching the JS promise
#[tokio::main]
async fn main() {
    let fut1 = async { 42 };
    let resolved1 = fut1.await;

    let fut2 = future::ready(42);
    let resolved2 = fut2.await;

    let fut3 = MyFuture::new(42);
    let resolved3 = fut3.await;
}

struct MyFuture {
    value: u8,
}

impl MyFuture {
    fn new(value: u8) -> Self {
        Self { value }
    }
}

impl Future for MyFuture {
    type Output = u8;

    fn poll(self: Pin<&mut Self>, _: &mut Context) -> Poll<Self::Output> {
        Poll::Ready(self.value)
    }
}
```
