type SetInterval = ReturnType<typeof setInterval>;

declare type PromiseData<T> = Promise<Data<T>>;

interface Data<T> {
    code: number;
    message: string;
    data: T;
}