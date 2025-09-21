import { ValueUnit, ValuesUnit } from "types/index.js"

class timeDependentLoss {
    public readonly phi: number
    public readonly Mg1: ValuesUnit
    public readonly Mg2: ValuesUnit
    public readonly sigmacpg: ValueUnit
    public readonly deltasigmap: ValueUnit
    public readonly x: ValuesUnit
    public readonly width: ValueUnit
    public readonly Ac: ValueUnit
    public readonly Ic: ValueUnit
    public readonly ep: ValuesUnit
    public readonly g1: ValueUnit
    public readonly g2: ValueUnit
    public readonly P0: ValuesUnit
    public readonly alphap: number
    

    constructor({phi, g2, sigmacpg, deltasigmap, x, width, Ac, Ic, ep, P0, g1, alphap}: {
        phi: number
        Mg2: ValuesUnit
        sigmacpg: ValueUnit
        deltasigmap: ValueUnit
        x: ValuesUnit
        width: ValueUnit
        Ac: ValueUnit
        Ic: ValueUnit
        ep: ValuesUnit
        g2: ValueUnit
        P0: ValuesUnit
        Mg1: ValuesUnit
        g1: ValueUnit
        alphap: number

    }) {
        this.phi = phi
       
        this.sigmacpg = sigmacpg
        this.deltasigmap = deltasigmap
        this.x = x
        this.width = width
        this.Ac = Ac
        this.Ic = Ic
        this.ep = ep
        this.g1 = g1
        this.g2 = g2
        this.P0 = P0
        this.alphap = alphap
        this.Mg1 = this.calculateMg({g: this.g1});
        this.Mg2 = this.calculateMg({g: this.g2});
    }

    /**
     * Calculates the bending moment (Mg2) at various points 'x' along a simply supported beam
     * due to a uniformly distributed load (g2).
     * Formula: Mg2(x) = (g2 * L * x / 2) - (g2 * x^2 / 2)
     */
    calculateMg({g}: {g: ValueUnit}): ValuesUnit {
        const g_val = g.value; // expecting kN/m
        const width_val = this.width.value; // expecting cm
        const x_vals = this.x.values; // expecting cm

        // Convert lengths from cm to m for consistent calculation with g2 in kN/m
        const width_m = width_val / 100;
        const x_vals_m = x_vals.map(x_cm => x_cm / 100);
        const mg_values = x_vals_m.map(x_m => {
            return (g_val * width_m * x_m / 2) - (g_val * x_m**2 / 2);
        });

        return {
            values: mg_values,
            unit: 'kN*m'
        };
    }

    calculateSigmacpg(): ValuesUnit {

        const P0_values = this.P0.values;

        // Stress from prestressing force P0
        const part1 = P0_values.map((P0_i, i) => {
            const ep_i = this.ep.values[i];
            return P0_i * ((1/this.Ac.value) + (ep_i**2 / this.Ic.value))
        })

        // Stress from moments Mg1 and Mg2
        const part2 = this.P0.values.map((_, i) => {
            const Mg1_i = this.Mg1.values[i];
            const Mg2_i = this.Mg2.values[i];
            const ep_i = this.ep.values[i];
            
            // Convert moments from kN*m to kN*cm for unit consistency
            const total_Mg_kNcm = (Mg1_i + Mg2_i) * 100;

            return total_Mg_kNcm * ep_i / this.Ic.value
        })

        // Total stress is the sum of the parts (sign of ep and Mg will determine final sign)
        const sigmacpg_values = part1.map((p1, i) => p1 + part2[i]);

        return {
            values: sigmacpg_values,
            unit: 'kN/cm²'
        };
    }

    calculatedeltappercent(): number[] {
        const sigmacpg = this.calculateSigmacpg().values
        const sigmacpg_MPa = sigmacpg.map(sigmacpg_i => sigmacpg_i * 10)

        const deltasigmappercentuais = sigmacpg_MPa.map(sigmacpg_i => {
            return 7.4 + (this.alphap/ 18.7) * (this.phi) ** 1.07 * (3 + sigmacpg_i)
        })

        return deltasigmappercentuais
    }

    finalPrestressingForce(): ValuesUnit {
        const P0 = this.P0.values;
        const deltasigmap = this.calculatedeltappercent();

        const finalPrestressingForce = P0.map((finalPrestressingForce_i, i) => {
            return finalPrestressingForce_i * (1 - (deltasigmap[i]/100))
        })

        return {
           values: finalPrestressingForce,
            unit: 'kN'
    }
    }


            

}

export default timeDependentLoss;