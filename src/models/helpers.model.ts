export class Helpers {
    public static assignNotNull<T>(instance: T, key: keyof T, fromObject: Partial<T>): void {
        fromObject[key] != null && (instance[key] = <any>fromObject[key]);
    }
}
