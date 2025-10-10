type ConcreteClass = "C20_C45" | "C50_C90";

interface TablePoint {
  humidity: number;    // %
  thickness: number;  // cm
  t0: number;         // days
  value: number;
}

export default class CreepConcrete {
  public readonly value: number | undefined;

  private static readonly data: Record<ConcreteClass, TablePoint[]> = {
    C20_C45: [],
    C50_C90: [],
  };

  private static isInitialized = false;

  constructor({
    concreteClass,
    t0,
    humidity,
    thickness,
  }: {
    concreteClass: ConcreteClass;
    t0: number;
    humidity: number;
    thickness: number;
  }) {
    CreepConcrete.initializeData();
    this.value = this.calculateValue(concreteClass, t0, humidity, thickness);
  }

  private calculateValue(
    concreteClass: ConcreteClass,
    t0: number,
    humidity: number,
    thickness: number
  ): number | undefined {
    const allPoints = CreepConcrete.data[concreteClass];
    const t0Values = Array.from(new Set(allPoints.map(p => p.t0))).sort((a, b) => a - b);
    const [t0_1, t0_2] = this.getBounds(t0, t0Values);

    const value1 = this.interpolateForFixedT0(concreteClass, t0_1, humidity, thickness);
    if (value1 === undefined) return undefined;

    // If t0 is on a boundary or outside the range, no need for a second interpolation.
    if (t0_1 === t0_2) {
      return value1;
    }

    const value2 = this.interpolateForFixedT0(concreteClass, t0_2, humidity, thickness);
    if (value2 === undefined) return undefined;

    return this.linear(t0, t0_1, t0_2, value1, value2);
  }

  /**
   * Performs 2D interpolation for humidity and thickness for a fixed, existing t0.
   */
  private interpolateForFixedT0(
    concreteClass: ConcreteClass,
    t0: number,
    humidity: number,
    thickness: number
  ): number | undefined {
    const points = CreepConcrete.data[concreteClass].filter(p => p.t0 === t0);

    const hValues = Array.from(new Set(points.map(p => p.humidity))).sort((a, b) => a - b);
    const [h1, h2] = this.getBounds(humidity, hValues);

    const interpolateForHumidity = (h: number) => {
      const pointsForH = points.filter(p => p.humidity === h);
      const tValues = pointsForH.map(p => p.thickness).sort((a, b) => a - b);
      const [t1, t2] = this.getBounds(thickness, tValues);
      const v1 = this.getPointValue(pointsForH, h, t1);
      const v2 = this.getPointValue(pointsForH, h, t2);
      if (v1 === undefined || v2 === undefined) return undefined;
      return this.linear(thickness, t1, t2, v1, v2);
    };

    const f1 = interpolateForHumidity(h1);
    const f2 = interpolateForHumidity(h2);
    if (f1 === undefined || f2 === undefined) return undefined;

    return this.linear(humidity, h1, h2, f1, f2);
  }

  private getPointValue(
    array: TablePoint[],
    humidity: number,
    thickness: number
  ): number | undefined {
    return array.find(p => p.humidity === humidity && p.thickness === thickness)?.value;
  }

  private linear(x: number, x1: number, x2: number, y1: number, y2: number): number {
    if (x1 === x2) return y1;
    const t = (x - x1) / (x2 - x1);
    return y1 + t * (y2 - y1);
  }

  /**
   * Finds the lower and upper bounds of x in the list of points.
   * If x is out of range, returns the endpoint value to extrapolate.
   */
  private getBounds(x: number, array: number[]): [number, number] {
    if (x <= array[0]) return [array[0], array[0]];
    if (x >= array[array.length - 1]) return [array[array.length - 1], array[array.length - 1]];
    for (let i = 0; i < array.length - 1; i++) {
      if (x >= array[i] && x <= array[i + 1]) return [array[i], array[i + 1]];
    }
    return [array[0], array[0]]; // fallback
  }

  private static initializeData() {
    if (this.isInitialized) {
      return;
    }

    this.data.C20_C45.push(
      { humidity: 40, thickness: 20, t0: 5, value: 4.6 },
      { humidity: 40, thickness: 60, t0: 5, value: 3.8 },
      { humidity: 55, thickness: 20, t0: 5, value: 3.9 },
      { humidity: 55, thickness: 60, t0: 5, value: 3.3 },
      { humidity: 75, thickness: 20, t0: 5, value: 2.8 },
      { humidity: 75, thickness: 60, t0: 5, value: 2.4 },
      { humidity: 90, thickness: 20, t0: 5, value: 2.0 },
      { humidity: 90, thickness: 60, t0: 5, value: 1.9 },
    );

    this.data.C20_C45.push(
      { humidity: 40, thickness: 20, t0: 30, value: 3.4 },
      { humidity: 40, thickness: 60, t0: 30, value: 3.0 },
      { humidity: 55, thickness: 20, t0: 30, value: 2.9 },
      { humidity: 55, thickness: 60, t0: 30, value: 2.6 },
      { humidity: 75, thickness: 20, t0: 30, value: 2.2 },
      { humidity: 75, thickness: 60, t0: 30, value: 2.0 },
      { humidity: 90, thickness: 20, t0: 30, value: 1.6 },
      { humidity: 90, thickness: 60, t0: 30, value: 1.5 },
    )

    this.data.C20_C45.push(
      { humidity: 40, thickness: 20, t0: 60, value: 2.9 },
      { humidity: 40, thickness: 60, t0: 60, value: 2.7 },
      { humidity: 55, thickness: 20, t0: 60, value: 2.5 },
      { humidity: 55, thickness: 60, t0: 60, value: 2.3 },
      { humidity: 75, thickness: 20, t0: 60, value: 1.9 },
      { humidity: 75, thickness: 60, t0: 60, value: 1.8 },
      { humidity: 90, thickness: 20, t0: 60, value: 1.4 },
      { humidity: 90, thickness: 60, t0: 60, value: 1.4 },
    )

    this.data.C50_C90.push(
      { humidity: 40, thickness: 20, t0: 5, value: 2.7 },
      { humidity: 40, thickness: 60, t0: 5, value: 2.4 },
      { humidity: 55, thickness: 20, t0: 5, value: 2.4 },
      { humidity: 55, thickness: 60, t0: 5, value: 2.1 },
      { humidity: 75, thickness: 20, t0: 5, value: 1.9 },
      { humidity: 75, thickness: 60, t0: 5, value: 1.8 },
      { humidity: 90, thickness: 20, t0: 5, value: 1.6 },
      { humidity: 90, thickness: 60, t0: 5, value: 1.5 },
    )

    this.data.C50_C90.push(
      { humidity: 40, thickness: 20, t0: 30, value: 2.0 },
      { humidity: 40, thickness: 60, t0: 30, value: 1.8 },
      { humidity: 55, thickness: 20, t0: 30, value: 1.7 },
      { humidity: 55, thickness: 60, t0: 30, value: 1.6 },
      { humidity: 75, thickness: 20, t0: 30, value: 1.4 },
      { humidity: 75, thickness: 60, t0: 30, value: 1.3 },
      { humidity: 90, thickness: 20, t0: 30, value: 1.1 },
      { humidity: 90, thickness: 60, t0: 30, value: 1.1 },
    )

    this.data.C50_C90.push(
      { humidity: 40, thickness: 20, t0: 60, value: 1.7 },
      { humidity: 40, thickness: 60, t0: 60, value: 1.6 },
      { humidity: 55, thickness: 20, t0: 60, value: 1.5 },
      { humidity: 55, thickness: 60, t0: 60, value: 1.4 },
      { humidity: 75, thickness: 20, t0: 60, value: 1.2 },
      { humidity: 75, thickness: 60, t0: 60, value: 1.2 },
      { humidity: 90, thickness: 20, t0: 60, value: 1.0 },
      { humidity: 90, thickness: 60, t0: 60, value: 1.0 },
    )

    this.isInitialized = true;
  }
}

export type CreepConcreteType = InstanceType<typeof CreepConcrete>