import { ValueUnit } from "types/index.js";


class PrestressingSteelLosses {

    width: ValueUnit;
    numSections: number;
    epmax: ValueUnit;
    Pi: ValueUnit
    apparentFrictionCoefficient: number
    k: ValueUnit

    constructor({width, numSections, epmax, Pi, apparentFrictionCoefficient}: {width: ValueUnit, numSections: number, epmax: ValueUnit, Pi: ValueUnit, apparentFrictionCoefficient: number}) {
        this.width = width;
        this.numSections = numSections;
        this.epmax = epmax;
        this.Pi = Pi;
        this.apparentFrictionCoefficient = apparentFrictionCoefficient;
        this.k = this.unintendedCurvatureLossPerMeter(this.apparentFrictionCoefficient);
    
    }

    subdivideSan(width: ValueUnit, span: number): {values: number[], unit: string} {
        
    if (span <= 0) {
        throw new Error("The number of partitions must be greater than zero.");
    }

    const step = width.value / span;
    const points = [];

    for (let i = 0; i <= span; i++) {
        points.push(parseFloat((i * step).toFixed(6)));
    }

    return {
        values: points,
        unit: width.unit
    }}

    /** Parabolic cable path y(x) */
    cableY(x: number): number {
        const L = this.width.value;
        const e = this.epmax.value;
        return (4 * e / (L ** 2)) * (x ** 2) + (4 * e / L) * x;
    }

    /** Cable slope y'(x) */
    cableSlope(x: number): number {
        const L = this.width.value;
        const e = this.epmax.value;
        return (8 * e / (L ** 2)) * x + (4 * e / L);
    }

    /** Tilt angle α(x) = -atan(y'(x)) */
    cableAngle(x: number): number {
        return -Math.atan(this.cableSlope(x));
    }

    /** Sum of angular deviations Σα_i = α_1 - α_i */
    angleDeviation(alpha1: number, alphaI: number): number {
        return alpha1 - alphaI;
    }

    unintendedCurvatureLossPerMeter(nu: number, k: number = 0.01): ValueUnit {
        return {
            value: k * nu,
            unit: '1/m'
        }
    }
    
    /** Loss of prestress along the cable due to friction P_atr_i = P_i * e^{-(μ Σα_i + k x_i)} */
    frictionPrestressLoss(mu: number, sumAlpha: number, k: number, x: number): number {
        return this.Pi.value * Math.exp(-(mu * sumAlpha + k * x));
    }

}

export default PrestressingSteelLosses;
