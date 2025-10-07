import { ValueUnit, ValuesUnit, Forces } from "types/index.js";
import { CableGeometry } from "../CableGeometry.js";
import { AnchoringType } from "index.js";


interface IFrictionLoss {
    Pi: ValueUnit;
    apparentFrictionCoefficient: number;
    anchoring: AnchoringType;
    cableGeometry: CableGeometry;
}

class FrictionLoss {
    public readonly Pi: ValueUnit;
    public readonly apparentFrictionCoefficient: number;
    public readonly anchoring: AnchoringType;
    public readonly cableGeometry: CableGeometry;
    public readonly k: ValueUnit;
    public readonly beta: ValueUnit;
    public readonly Patr: Forces

    constructor({ Pi, apparentFrictionCoefficient, anchoring, cableGeometry }: IFrictionLoss) {
        this.Pi = Pi;
        this.apparentFrictionCoefficient = apparentFrictionCoefficient;
        this.anchoring = anchoring;
        this.cableGeometry = cableGeometry;
        this.k = this.unintendedCurvatureLossPerMeter(this.apparentFrictionCoefficient);
    
        // Calculate beta (slope of friction losses)
        const L_m = this.cableGeometry.width.value / 100;
        let p1: number, p2: number, delta_x: number;

        if (this.anchoring === 'active-active') {
            // Reference points: start (0) and middle (L/2)
            p1 = this.Pi.value;
            p2 = this.frictionPrestressLoss(L_m / 2);
            delta_x = L_m / 2;
        } else { // 'active-passive' or 'passive-active'
            // Reference points: start (0) and end (L)
            p1 = this.Pi.value;
            p2 = this.frictionPrestressLoss(L_m);
            delta_x = L_m;
        }

        this.beta = {
            // The loss is negative, so beta should be positive.
            value: Math.abs((p2 - p1) / delta_x),
            unit: 'kN/m'
        };
        this.Patr = this.calculatePatr()
    }

    unintendedCurvatureLossPerMeter(nu: number, k_param: number = 0.01): ValueUnit {
        return {
            value: k_param * nu,
            unit: '1/m'
        }
    }
    
    /** Loss of prestress along the cable due to friction P_atr_i = P_i * e^{-(μ Σα_i + k x_i)} */
    frictionPrestressLoss(x: number): number {
        const mu = this.apparentFrictionCoefficient;
        const k = this.k.value;
        const L_m = this.cableGeometry.width.value / 100;
        const x_cm = x * 100;
        const L_cm = this.cableGeometry.width.value;

        const calculateForce = (start_cm: number, end_cm: number, distance_m: number): number => {
            const alpha_start = this.cableGeometry.cableAngle(start_cm);
            const alpha_end = this.cableGeometry.cableAngle(end_cm);
            const sumAlpha = this.cableGeometry.angleDeviation(alpha_start, alpha_end);
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
            // The actual force at the point is the minimum (most negative) of the two calculations, representing the maximum loss.
            return Math.min(forceFromStart, forceFromEnd);
        }

        // Fallback for unknown anchoring type, though TypeScript should prevent this.
        return this.Pi.value;
    }

    calculatePatr() : Forces {
        const x = this.cableGeometry.x.values 

        return {
            values: x.map(x_i_cm => this.frictionPrestressLoss(x_i_cm / 100)),
            unit: 'kN'
        }
    }
}

export default FrictionLoss;
