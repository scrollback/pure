declare interface Subscription {
    // Cancels the subscription
    unsubscribe(): void;
}

declare interface Observer {

    // Sends the next value in the sequence
    next(value: any): void;

    // Sends the sequence error
    error(errorValue: any): void;

    // Sends the sequence completion value
    complete(completeValue: any): void;
}

declare interface SubscriptionObserver {

    // Sends the next value in the sequence
    next(value: any): void;

    // Sends the sequence error
    error(errorValue: any): void;

    // Sends the sequence completion value
    complete(completeValue: any): void;
}

declare function SubscriberFunction(observer: SubscriptionObserver) : Function | Subscription;

declare class Observable {
    constructor(subscriber: SubscriberFunction): void;

    // Subscribes to the sequence
    subscribe(observer: Observer): Subscription;

    // Subscribes to the sequence with a callback, returning a promise
    forEach(onNext: Function): Promise<any>;

    // Converts items to an Observable
    static of(...items: Array<any>): Observable;

    // Converts an observable or iterable to an Observable
    static from(observable: Observable): Observable;
}
