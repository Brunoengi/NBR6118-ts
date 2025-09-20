import { ValueUnit } from "types/index.js";

export class CableGeometry {
    public readonly width: ValueUnit;
    public readonly epmax: ValueUnit;

    constructor({ width, epmax }: { width: ValueUnit, epmax: ValueUnit }) {
        this.width = width;
        this.epmax = epmax;
    }

    /**
     * Subdivides a span into a specified number of sections, returning the coordinates of each point.
     * @param width The total width of the span.
     * @param numSections The number of sections to divide the span into.
     * @returns An object with the point values and their unit.
     */
    public subdivideSpan(width: ValueUnit, numSections: number): { values: number[], unit: string } {
        if (numSections <= 0) {
            throw new Error("The number of sections must be greater than zero.");
        }

        const step = width.value / numSections;
        const points = [];

        for (let i = 0; i <= numSections; i++) {
            points.push(parseFloat((i * step).toFixed(6)));
        }

        return {
            values: points,
            unit: width.unit
        };
    }

    /**
     * Calculates the vertical position y(x) of a parabolic cable path.
     * @param x The horizontal position.
     * @param c The vertical position at the anchor (default is 0).
     */
    public cableY(x: number, c: number = 0): number {
        const L = this.width.value;
        const e = this.epmax.value;

        const a = -(4 * (e - c)) / (L ** 2);
        const b = (4 * (e - c)) / L;

        return a * (x ** 2) + b * x + c;
    }

    /**
     * Calculates the slope y'(x) of the cable path.
     * @param x The horizontal position.
     * @param c The vertical position at the anchor (default is 0).
     */
    public cableSlope(x: number, c: number = 0): number {
        const L = this.width.value;
        const e = this.epmax.value;

        const delta = e - c; // relative eccentricity

        return -(8 * delta / (L ** 2)) * x + (4 * delta / L);
    }

    /**
     * Calculates the tilt angle α(x) of the cable in radians.
     * Formula: α(x) = -atan(y'(x))
     * @param x The horizontal position.
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
