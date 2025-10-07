import { ValueUnit, Forces } from "types/index.js"
import { CableGeometry } from "../CableGeometry.js";


export type AnchoringType = 'active-active' | 'active-passive' | 'passive-active';

interface IAnchorageLoss {
    Ap: ValueUnit;
    Ep: ValueUnit;
    cableReturn: ValueUnit;
    tangBeta: ValueUnit;
    anchoring: AnchoringType;
    Patr: Forces;
    cableGeometry: CableGeometry;
}

class AnchorageLoss {
    public readonly Ap: ValueUnit;
    public readonly Ep: ValueUnit;
    public readonly cableReturn: ValueUnit;
    public readonly tangBeta: ValueUnit;
    public readonly anchoring: AnchoringType;
    public readonly Patr: Forces
    public readonly cableGeometry: CableGeometry;
    public readonly Panc: Forces
    
    constructor({ Patr, Ap, Ep, cableReturn, tangBeta, anchoring, cableGeometry }: IAnchorageLoss) {
        this.Ap = Ap;
        this.Ep = Ep;
        this.cableReturn = cableReturn;
        this.tangBeta = tangBeta;
        this.anchoring = anchoring;
        this.Patr = Patr
        this.cableGeometry = cableGeometry
        this.Panc = this.calculatePanc()

    }

    /**
     * Calculates the length of influence of anchorage slip (xr).
     * Formula: xr = sqrt(a * Ep * Ap / tan(β))
     * where:
     * a = cable return (anchorage slip) [cm]
     * Ep = modulus of elasticity of prestressing steel [kN/cm²]
     * Ap = prestressing steel area [cm²]
     * tangBeta = rate of prestressing force loss due to friction [kN/cm]
     */
    public get xr(): ValueUnit {
        // --- Unit Conversions to a consistent system (kN, cm) ---

        // cableReturn: mm -> cm
        const a_cm = this.cableReturn.value / 10;

        // Ep: GPa -> kN/cm² (1 GPa = 100 kN/cm²)
        const Ep_kN_cm2 = this.Ep.value * 100;

        // Ap: cm² (no conversion needed)
        const Ap_cm2 = this.Ap.value;

        // beta: kN/m -> kN/cm
        const tangBeta_kN_cm = this.tangBeta.value / 100;

        return {
            value: Math.sqrt(a_cm * Ep_kN_cm2 * Ap_cm2 / tangBeta_kN_cm),
            unit: 'cm'
        }   
    }

    /**
     * Calculates the maximum prestress force loss at the anchorage (x=0).
     * This loss is used to define the linear loss function within the influence length xr.
     * Formula: ΔP_max = 2 * tan(β) * xr
     */
    public get deltaP_max(): ValueUnit {
        // --- Unit Conversions to a consistent system (kN, cm) ---
        const tangBeta_kN_cm = this.tangBeta.value / 100;
        const xr_cm = this.xr.value;

        // ΔP_max (kN) = 2 * (kN/cm) * cm
        const loss_kN = 2 * tangBeta_kN_cm * xr_cm;

        return {
            value: loss_kN,
            unit: 'kN'
        };
    }

    /**
     * Calculates the prestress force loss due to anchorage slip at a specific distance 'x' from the anchor.
     * The calculation depends on whether the influence length `xr` is contained within the total cable length `width`.
     * @param x The distance from the anchorage.
     * @param width The total length of the cable.
     * @returns The force loss at distance 'x'.
     */
    public deltaPanc(x: ValueUnit, width: ValueUnit): ValueUnit {
        const xr_cm = this.xr.value;
        const x_cm = x.value;
        const width_cm = width.value;
        const deltaP_max_kN = this.deltaP_max.value;
        
        // If xr > width, the entire cable is affected by the slip.
        // The loss at the anchor is reduced because the slip is distributed over the whole length.
        if (xr_cm > width_cm) {
            const deltaP_max_adjusted = deltaP_max_kN * (width_cm / xr_cm);
            let totalLoss_kN = 0;
            switch (this.anchoring) {
                case 'active-passive':
                    totalLoss_kN = deltaP_max_adjusted * (1 - x_cm / width_cm);
                    break;
                case 'passive-active':
                    // For passive-active, the loss is mirrored.
                    totalLoss_kN = deltaP_max_adjusted * (x_cm / width_cm);
                    break;
                case 'active-active':
                    // With slip from both ends and xr > width, the loss is constant across the cable.
                    totalLoss_kN = deltaP_max_adjusted;
                    break;
            }
            return { value: totalLoss_kN, unit: 'kN' };
        }

        // Standard case: xr <= width.
        // Helper to calculate linear loss from a single anchor.
        const calculateLinearLoss = (distance_from_anchor: number): number => {
            if (distance_from_anchor >= 0 && distance_from_anchor <= xr_cm) {
                return deltaP_max_kN * (1 - (distance_from_anchor / xr_cm));
            }
            return 0;
        };

        let totalLoss_kN = 0;
        switch (this.anchoring) {
            case 'active-passive':
                totalLoss_kN = calculateLinearLoss(x_cm);
                break;

            case 'passive-active':
                totalLoss_kN = calculateLinearLoss(width_cm - x_cm);
                break;

            case 'active-active':
                const lossFromStart = calculateLinearLoss(x_cm);
                const lossFromEnd = calculateLinearLoss(width_cm - x_cm);
                totalLoss_kN = lossFromStart + lossFromEnd;
                
                // When influence zones overlap (xr > width/2), the simple superposition is incorrect.
                // The loss diagram becomes a trapezoid, not a 'V' shape.
                // We need to calculate the actual (effective) loss at the anchor and at mid-span.
                if (xr_cm > width_cm / 2) {
                    // Based on the user's formulas for the two "discounts"
                    const tangBeta_kN_cm = this.tangBeta.value / 100;
                    const a_cm = this.cableReturn.value / 10;
                    const Ep_kN_cm2 = this.Ep.value * 100;
                    const Ap_cm2 = this.Ap.value;

                    // The total energy from slip at both ends (2a) is balanced by the integral of force loss over the length.
                    // For a trapezoidal loss diagram, this leads to: 2 * a * Ep * Ap = (deltaP_max_eff + deltaP_mid) * (width_cm / 2)
                    // We also know that deltaP_max_eff = deltaP_mid + deltaP1, where deltaP1 is the friction drop to mid-span.
                    // Solving for deltaP_mid (which is deltaP2), as per user's formula:
                    const deltaP1 = (width_cm / 2) * tangBeta_kN_cm;

                    // parcela1 = (2 * a * Ep * Ap) / width
                    const parcela1 = (2 * a_cm * Ep_kN_cm2 * Ap_cm2) / width_cm;
                    // parcela2 = frictionDrop_to_mid
                    const parcela2 = deltaP1;
                    const deltaP2 = parcela1 - parcela2;

                    const deltaP_mid = Math.max(0, deltaP2); // Loss at mid-span cannot be negative
                    const deltaP_max_eff = deltaP_mid + 2 * deltaP1;

                    // The loss at any point 'x' is the linear interpolation between deltaP_max_eff and deltaP_mid
                    const distanceFromMid = Math.abs(x_cm - width_cm / 2);
                    totalLoss_kN = deltaP_mid + (deltaP_max_eff - deltaP_mid) * (distanceFromMid / (width_cm / 2));
                }
                break;
        }
        return { value: totalLoss_kN, unit: 'kN' };
    }

    calculatePanc (): Forces {
        const Patr = this.Patr
        const x_cm_values = this.cableGeometry.x.values 
        const width_cm = this.cableGeometry.width
        const loss = x_cm_values.map(x_cm => this.deltaPanc({value: x_cm, unit:'cm'}, width_cm))

        return {
            values: loss.map((l,i) => Patr.values[i] + l.value),
            unit: 'kN'
        }
    }
}

export default AnchorageLoss;