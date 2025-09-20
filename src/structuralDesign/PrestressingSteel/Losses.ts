import { ValueUnit } from "types/index.js";

export type AnchoringType = 'active-active' | 'active-passive' | 'passive-active';

class PrestressingSteelLosses {

    width: ValueUnit;
    numSections: number;
    epmax: ValueUnit;
    Pi: ValueUnit;
    apparentFrictionCoefficient: number;
    k: ValueUnit;
    anchoring: AnchoringType;
    beta: ValueUnit;

    constructor({width, numSections, epmax, Pi, apparentFrictionCoefficient, anchoring}: {width: ValueUnit, numSections: number, epmax: ValueUnit, Pi: ValueUnit, apparentFrictionCoefficient: number, anchoring: AnchoringType}) {
        this.width = width;
        this.numSections = numSections;
        this.epmax = epmax;
        this.Pi = Pi;
        this.apparentFrictionCoefficient = apparentFrictionCoefficient;
        this.anchoring = anchoring;
        this.k = this.unintendedCurvatureLossPerMeter(this.apparentFrictionCoefficient);
    
        // Calculate beta (slope of friction losses)
        const L_m = this.width.value / 100;
        let p1: number, p2: number, delta_x: number;

        if (this.anchoring === 'active-active') {
            // Reference points: start (0) and middle (L/2)
            p1 = this.Pi.value; // At the active anchor, force is Pi
            p2 = this.frictionPrestressLoss(L_m / 2);
            delta_x = L_m / 2;
        } else { // 'active-passive' or 'passive-active'
            // Reference points: start (0) and end (L)
            p1 = this.Pi.value; // At the active anchor, force is Pi
            p2 = this.frictionPrestressLoss(L_m);
            delta_x = L_m;
        }

        this.beta = {
            value: (p2 - p1) / delta_x,
            unit: 'kN/m'
        };
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
    cableY(x: number, c: number = 0): number {
        const L = this.width.value;
        const e = this.epmax.value;

        const a = -(4 * (e - c)) / (L ** 2);
        const b =  (4 * (e - c)) / L;

        return a * (x ** 2) + b * x + c;
    }

    /** Cable slope y'(x) allowing base elevation c */
    cableSlope(x: number, c: number = 0): number {
        const L = this.width.value;
        const e = this.epmax.value;

        const delta = e - c; // flecha relativa

        return -(8 * delta / (L ** 2)) * x + (4 * delta / L);
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
    frictionPrestressLoss(x: number): number {
        const mu = this.apparentFrictionCoefficient;
        const k = this.k.value;
        const L_m = this.width.value / 100;
        const x_cm = x * 100;
        const L_cm = this.width.value;

        const calculateForce = (start_cm: number, end_cm: number, distance_m: number): number => {
            const alpha_start = this.cableAngle(start_cm);
            const alpha_end = this.cableAngle(end_cm);
            const sumAlpha = this.angleDeviation(alpha_start, alpha_end);
            return this.Pi.value * Math.exp(-(mu * Math.abs(sumAlpha) + k * distance_m));
        };

        if (this.anchoring === 'active-passive') {
            // Tensioning from x=0
            return calculateForce(0, x_cm, x);
        }

        if (this.anchoring === 'passive-active') {
            // Tensioning from x=L
            return calculateForce(L_cm, x_cm, L_m - x);
        }

        if (this.anchoring === 'active-active') {
            const forceFromStart = calculateForce(0, x_cm, x);
            const forceFromEnd = calculateForce(L_cm, x_cm, L_m - x);
            // The actual force at the point is the minimum of the two calculations
            return Math.min(forceFromStart, forceFromEnd);
        }

        // Fallback for unknown anchoring type, though TypeScript should prevent this.
        return this.Pi.value;
    }
}

export default PrestressingSteelLosses;
