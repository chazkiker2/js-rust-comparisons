# Writing JS to Rust Comparison

- how deep into async Rust is too deep? should I be implementing `Future` in my own code? or should I be straying away from it?
- Are `Pin` and `Box` and calls to `.clone()` acceptable? I'm sure this depends on the code.... but how do I know?

## first-class `resolve` and `reject` during "producing code"

```javascript
class Sequencer {
    constructor() {
        this.sequence = [];
        this.is_open = true;
    }

    send(data) {
        if (!this.is_open) {
            return Promise.reject("Error: Disconnected");
        }

        if (!data || typeof data !== "number") {
            return Promise.reject(new Error("Invalid data"));
        }

        return new Promise((resolve, reject) => {
            this.sequence.push({data, resolve, reject});
            this.next();
        });
    }

    next() {
        if (!this.sequence) {
            return;
        }

        if (!this.is_open) {
            // reject all remaining
            for (let i = 0; i < this.sequence.length; i++) {
                this.sequence.shift().reject("ERROR: DISCONNECTED");
            }
            this.sequence = [];
            return;
        }

        const { data, resolve } = this.sequence[0];
        // mock out something async with data -- like send to a serial port
        setTimeout(function () {
            console.log(`Sending Data: ${data}`);
            resolve(data);
        }, 2000);
        this.sequence.shift();
    }

    close() {
        this.is_open = false;
    }
}

function main() {
    const seq = new Sequencer();
    let promise1 = seq.send(1);
    let promise2 = seq.send(2);
    seq.close();

    promise1
        .then((res) => console.log(`First Send Success! Response: ${res}`))
        .catch(console.error);
    promise2
        .then((res) => console.log(`Second Send Success! Response: ${res}`))
        .catch(console.error);
}

main();
```
