import { ValuesUnit, ValueUnit, Distance, Angles } from "types/index.js";

export class CableGeometry {
    public readonly width: Distance;
    public readonly epmax: ValueUnit;
    public readonly numPoints: number;
    public readonly c: number;
    public readonly x: ValuesUnit;
    public readonly y: ValuesUnit;
    public readonly slopes: ValuesUnit;
    public readonly angles: Angles;
    public readonly angleDeviations: Angles;


    constructor({ width, epmax, numPoints, c = 0}: { width: Distance, epmax: ValueUnit, c?:number, numPoints: number }) {
        this.width = width;
        this.epmax = epmax;
        this.c = c;
        if (numPoints < 2) {
            throw new Error("Number of points must be at least 2.");
        }
        this.numPoints = numPoints;
        this.x = this.subdivideSpan();
        this.y = {
            values: this.x.values.map(x_i => this.cableY(x_i)),
            unit: this.width.unit
        };

        this.slopes = {
            values: this.x.values.map(x_i => this.cableSlope(x_i)),
            unit: 'adimensional'
        };
            
        this.angles = {
            values: this.slopes.values.map(slope => -Math.atan(slope)),
            unit: 'radians'
        };
        const alpha1 = this.angles.values[0];
        this.angleDeviations = {
            values: this.angles.values.map(alpha_i => this.angleDeviation(alpha1, alpha_i)),
            unit: 'radians'
        };
    }

    /**
     * Subdivides a span into a specified number of points, returning their coordinates.
     * @returns An object with the point values and their unit.
     */
    public subdivideSpan(): ValuesUnit {
        if (this.numPoints <= 1) {
            throw new Error("Number of points must be greater than 1.");
        }
        const numSections = this.numPoints - 1;
        const stepSize = this.width.value / numSections;
        const points = [];
        for (let i = 0; i < this.numPoints; i++) {
            points.push(i * stepSize);
        }

        return {
            values: points,
            unit: this.width.unit
        };
    }

    /**
     * Calculates the vertical position y(x) of a parabolic cable path.
     * @param x The horizontal position.
     */
    public cableY(x: number): number {
        const L = this.width.value;
        const e = this.epmax.value;
        const c = this.c;

        const a = -(4 * (e - c)) / (L ** 2);
        const b = (4 * (e - c)) / L;

        return a * (x ** 2) + b * x + c;
    }

    /**
     * Calculates the slope y'(x) of the cable path.
     * @param x The horizontal position.
     */
    public cableSlope(x: number): number {
        const L = this.width.value;
        const e = this.epmax.value;
        const c = this.c;

        const delta = e - c; // relative eccentricity

        return -(8 * delta / (L ** 2)) * x + (4 * delta / L);
    }

    /**
     * Calculates the tilt angle α(x) of the cable in radians at a given horizontal position.
     */
    public cableAngle(x: number): number {
        return -Math.atan(this.cableSlope(x));
    }

    /**
     * Calculates the sum of angular deviations between two points.
     * Formula: Σα = α_start - α_end
     */
    public angleDeviation(alpha1: number, alphaI: number): number {
        return alpha1 - alphaI;
    }
}
