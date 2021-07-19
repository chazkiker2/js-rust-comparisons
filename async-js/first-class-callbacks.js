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
            const entry = {
                data,
                resolve,
                reject,
            };
            this.sequence.push(entry);
            this.next();
        });
    }

    next() {
        if (!this.sequence) {
            return;
        }

        if (!this.is_open) {
            const { reject } = this.sequence[0];
            for (let i = 0; i < this.sequence.length; i++) {
                this.sequence[i].reject("ERROR: DISCONNECTED");
            }
            this.sequence = [];
            reject(new Error("ERROR: DISCONNECTED"));
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
