// counter.ts
export class Counter {
    private static instance: Counter;
    private _value: number = 0;

    private constructor() {}

    public static getInstance(): Counter {
        if (!Counter.instance) {
            Counter.instance = new Counter();
        }
        return Counter.instance;
    }

    get value(): number {
        return this._value;
    }

    increment() {
        this._value++;
    }
}
