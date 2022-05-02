export class DoubleKeysMap {
  private map = new Map<string, number>();
  constructor() {
    console.log(`Call Maps constructor`);
  }

  set(key: [number, number], value: number): this {
    this.map.set(JSON.stringify(key), value);
    return this;
  }

  get(key: [number, number]): number | undefined {
    return this.map.get(JSON.stringify(key));
  }

  clear() {
    this.map.clear();
  }

  delete(key: [number, number]): boolean {
    return this.map.delete(JSON.stringify(key));
  }

  has(key: [number, number]): boolean {
    return this.map.has(JSON.stringify(key));
  }

  get size() {
    return this.map.size;
  }

  forEach(
    callback: (
      value: number,
      key: [number, number],
      map: Map<[number, number], number>,
    ) => void,
    thisArg?: any,
  ): void {
    this.map.forEach((value, key) => {
      callback.call(thisArg, value, JSON.parse(key), this);
    });
  }
}
