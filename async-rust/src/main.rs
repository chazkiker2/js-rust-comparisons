use std::error::Error;

// Docs: https://docs.rs/tokio/1.8.1/tokio/sync/oneshot/index.html
use tokio::sync::oneshot::{self, Receiver};

type SndResult<T, E = Box<dyn std::error::Error + Send + Sync>> = std::result::Result<T, E>;

fn chain_promise(settled_promise: SndResult<i32>) -> Receiver<SndResult<i32>> {
    let (tx, rx) = oneshot::channel::<SndResult<i32>>();
    match settled_promise {
        Ok(num) => {
            println!("Success! Resolved to value {}", num);
            let _ = tx.send(Ok(num)).expect("Failed to send");
            rx
        }
        Err(e) => {
            println!("Failure! Rejected to error {}", e);
            let _ = tx.send(Err(e)).expect("Failed to send");
            rx
        }
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Rust futures do not have built-in support for the output being a failure.
    // You need to use `Result` as a message type to handle that.
    let (tx, rx) = oneshot::channel::<SndResult<i32>>();

    // this is like calling `resolve(42)` in JS
    let _ = tx.send(Ok(42)).expect("Failed to send");

    let fut = rx;

    tokio::spawn(async move {
        let value = fut.await.expect("Receiver was dropped");
        tokio::task::yield_now().await;

        let value = chain_promise(value).await.expect("Receiver was dropped");
        tokio::task::yield_now().await;

        let value = chain_promise(value).await.expect("Receiver was dropped");
        tokio::task::yield_now().await;

        match value {
            Ok(num) => println!("Resolved to {}", num),
            Err(e) => println!("Rejected to {}", e),
        };
    })
    .await?;

    // Now let's try making a rejected promise
    let (tx, rx) = oneshot::channel::<SndResult<i32>>();
    // here, we're sending the `Err` variant of `Result`
    // which is like calling `reject(new Error("My Error!"))` in JS
    let _ = tx.send(Err(Box::from("My Error!")));

    tokio::spawn(async move {
        let value = rx.await.expect("Receiver was dropped");
        tokio::task::yield_now().await;

        let value = chain_promise(value).await.expect("Receiver was dropped");
        tokio::task::yield_now().await;

        match value {
            Ok(num) => println!("Resolved to {}", num),
            Err(e) => println!("Rejected to {}", e),
        };
    })
    .await?;

    Ok(())
}
