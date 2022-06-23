export class GraphPoint {
  etc: string;

  constructor(
    public readonly x: string,
    public readonly y: number,
    min: number,
    max: number,
  ) {
    this.etc = this.contains(y, min, max) ? 'stable' : 'unstable';
  }

  private contains(average: number, min: number, max: number) {
    return average >= min && average <= max;
  }
}
