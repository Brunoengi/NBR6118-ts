import { ValueUnit, ValuesUnit } from "types/index.js";



class ElasticShorteningLoss {
    public readonly Ecs: ValueUnit;
    public readonly Ep: ValueUnit;
    public readonly ep: ValuesUnit;
    public readonly sigmacp: ValuesUnit;
    public readonly sigmacg: ValuesUnit;
    public readonly g1: ValueUnit;
    public readonly x: ValuesUnit;
    public readonly width: ValueUnit;
    public readonly Panc: ValuesUnit
    public readonly Ac: ValueUnit;
    public readonly Ic: ValueUnit
    public readonly Ap: ValueUnit;
    public readonly ncable: number;
    public readonly alphap: number;

    
    constructor({Ecs, Ep, ep, g1, x, width, Panc, Ac, Ic, Ap, ncable}: {
        Ecs: ValueUnit,
        Ep: ValueUnit,
        ep: ValuesUnit,
        g1: ValueUnit,
        x: ValuesUnit,
        width: ValueUnit
        Panc: ValuesUnit
        Ac: ValueUnit,
        Ic: ValueUnit
        Ap: ValueUnit,
        ncable: number
    }) {
        this.Ecs = Ecs;
        this.Ep = Ep;
        this.ep = ep;
        this.g1 = g1;
        this.x = x;
        this.width = width;
        this.Panc = Panc;
        this.Ac = Ac;
        this.Ic = Ic;
        this.Ap = Ap;
        this.ncable = ncable;
        this.alphap = this.calculateAlphap();
    }

    /**
     * Calculates the bending moment (Mg) at various points 'x' along a simply supported beam
     * due to a uniformly distributed load (g1).
     * Formula: Mg(x) = (g1 * L * x / 2) - (g1 * x^2 / 2)
     */
    calculateMg(): ValuesUnit {
        const g1_val = this.g1.value; // expecting kN/m
        const width_val = this.width.value; // expecting cm
        const x_vals = this.x.values; // expecting cm

        // Convert lengths from cm to m for consistent calculation with g1 in kN/m
        const width_m = width_val / 100;
        const x_vals_m = x_vals.map(x_cm => x_cm / 100);

        const mg_values = x_vals_m.map(x_m => {
            return (g1_val * width_m * x_m / 2) - (g1_val * x_m**2 / 2);
        });

        return {
            values: mg_values,
            unit: 'kN*m'
        };
    }

    /**
     * Calculates the ratio between the moduli of elasticity of prestressing steel and concrete.
     * Formula: αp = Ep / Ecs
     */
    calculateAlphap(): number {
        // Both Ep and Ecs should be in the same unit (e.g., GPa or MPa), making the result dimensionless.
        return this.Ep.value / this.Ecs.value;
    }

    /**
     * Calculates the stress in the concrete at the level of the prestressing steel cable
     * due to the prestressing force after anchorage loss (Panc).
     * Formula: σ_cp(x) = Panc(x) * (1/Ac + ep(x)² / Ic)
     */
    calculateSigmacp(): ValuesUnit {
        const panc_vals = this.Panc.values;
        const ep_vals = this.ep.values;
        const ac_val = this.Ac.value;
        const ic_val = this.Ic.value;

        if (panc_vals.length !== ep_vals.length) {
            throw new Error("Panc and ep arrays must have the same length for point-wise calculation.");
        }

        const sigmacp_values = panc_vals.map((panc_i, i) => {
            const ep_i = ep_vals[i];
            return panc_i * ((1 / ac_val) + ((ep_i ** 2) / ic_val));
        });

        return {
            values: sigmacp_values,
            unit: `${this.Panc.unit}/${this.Ac.unit}` // e.g., kN/cm²
        };
    }

    calculateSigmacg(): ValuesUnit {
        const mg = this.calculateMg(); // Returns { values: number[], unit: 'kN*m' }
        const mg_vals_kNm = mg.values;
        const ep_vals_cm = this.ep.values;
        const ic_val_cm4 = this.Ic.value;

        if (mg_vals_kNm.length !== ep_vals_cm.length) {
            throw new Error("Mg and ep arrays must have the same length for point-wise calculation.");
        }

        // Convert Mg from kN*m to kN*cm for unit consistency
        const mg_vals_kNcm = mg_vals_kNm.map(val => val * 100);

        const sigmacg_values = mg_vals_kNcm.map((mg_i, i) => {
            const ep_i = ep_vals_cm[i];
            // Formula: σ_cg = Mg(x) * ep(x) / Ic
            return (mg_i * ep_i) / ic_val_cm4;
        });

        return {
            values: sigmacg_values,
            unit: 'kN/cm²' // (kN*cm * cm) / cm⁴ = kN/cm²
        };
    }

    /**
     * Calculates the total stress in the concrete at the level of the prestressing steel cable.
     * It is the sum of the stress due to prestressing (σ_cp) and the stress due to self-weight (σ_cg).
     * Formula: σ_c = σ_cp + σ_cg
     */
    calculateSigmac(): ValuesUnit {
        const sigmacp = this.calculateSigmacp();
        const sigmacg = this.calculateSigmacg();

        if (sigmacp.values.length !== sigmacg.values.length) {
            throw new Error("sigmacp and sigmacg arrays must have the same length for summation.");
        }

        const sigmac_values = sigmacp.values.map((val, i) => val + sigmacg.values[i]);

        return {
            values: sigmac_values,
            unit: 'kN/cm²' 
        };
    }

    /**
     * Calculates the prestress loss due to the elastic shortening of concrete.
     * This method assumes sequential tensioning of the cables.
     * Formula: Δσ_p,enc = αp * σ_c * (n_cables - 1) / (2 * n_cables)
     * where:
     * αp = modular ratio (Ep/Ecs)
     * σ_c = total stress in concrete at the cable level
     * n_cables = number of cables
     */
    calculateDeltaSigmaP(): ValuesUnit {
        const alphap = this.calculateAlphap();
        const sigmac = this.calculateSigmac();
        const ncable = this.ncable;

        // This factor accounts for the average loss when tensioning cables sequentially.
        // If ncable is 1, the factor is 0, meaning no loss from this effect on other cables.
        const sequentialFactor = ncable > 1 ? (ncable - 1) / (2 * ncable) : 0;

        const deltaSigmaP_values = sigmac.values.map(sigmac_i => {
            return alphap * sigmac_i * sequentialFactor;
        });

        return {
            values: deltaSigmaP_values,
            unit: sigmac.unit // Should be 'kN/cm²'
        };
    }
    
    /**
     * Calculates the final prestressing force (P0) after accounting for elastic shortening loss.
     * Formula: P0(x) = Panc(x) - ΔP_enc(x)
     * where ΔP_enc(x) = Δσ_p,enc(x) * Ap
     */
    calculateP0(): ValuesUnit {
        const deltaSigmaP = this.calculateDeltaSigmaP(); // { values: number[], unit: 'kN/cm²' }
        const panc = this.Panc; // { values: number[], unit: 'kN' }
        const ap_val = this.Ap.value; // cm²

        if (panc.values.length !== deltaSigmaP.values.length) {
            throw new Error("Panc and deltaSigmaP arrays must have the same length for subtraction.");
        }

        // Convert stress loss (Δσ_p) to force loss (ΔP)
        const deltaP_values = deltaSigmaP.values.map(stress_loss => stress_loss * ap_val);

        // P0 = Panc - ΔP
        const p0_values = panc.values.map((panc_i, i) => panc_i - deltaP_values[i]);

        return {
            values: p0_values,
            unit: 'kN'
        };
    }
}

export default ElasticShorteningLoss;