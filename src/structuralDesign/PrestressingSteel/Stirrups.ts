import { Combinations } from "combinations/Load.js";
import { ValueUnit, ValuesUnit } from "types/index.js";
import { CableGeometry } from "./CableGeometry.js";
import PrestressingSteelForce from "./PrestressingSteelForce.js";



class Stirrups {
    Vsd: ValuesUnit
    combinations: Combinations
    cableGeometry: CableGeometry
    prestressSteelForce: PrestressingSteelForce
    

    constructor({combinations, cableGeometry, prestressSteelForce}: {combinations: Combinations, cableGeometry: CableGeometry, prestressSteelForce: PrestressingSteelForce} ) {

        this.combinations = combinations
        this.cableGeometry = cableGeometry
        this.prestressSteelForce = prestressSteelForce
    }

    calculate_Vsd(): ValuesUnit {
        const Vg1 = this.calculate_V({g: this.combinations.mg1})
        const Vg2 = this.calculate_V({g: this.combinations.mg2})
        const Vq = this.calculate_V({g: this.combinations.mq})
        const Vp = this.prestressSteelForce.shear()

        const gammas = {
            gamma_g1: this.combinations.gamma.gamma_g1,
            gamma_g2: this.combinations.gamma.gamma_g2,
            gamma_q: this.combinations.gamma.gamma_q
        }
        
        const gamma_p = 0.9

        return {
            values: Vg1.values.map((Vg1_i, i) => gammas.gamma_g1 * Vg1_i + gammas.gamma_g2 * Vg2.values[i] + gammas.gamma_q * Vq.values[i] + gamma_p * Vp.values[i]),
            unit: 'kN'
        }
    }

    calculate_V({g}: {g: ValueUnit}) {
        // Convert width and x from cm to m for consistency with g (kN/m)
        const width_m = this.cableGeometry.width.value / 100;
        const x_m = this.cableGeometry.x.values.map(val => val / 100);

        const V = x_m.map((x_i_m) => {
            // Formula for shear in a simply supported beam: V(x) = q*L/2 - q*x
            // All units are now in kN and m.
            return (g.value * width_m / 2) - (g.value * x_i_m);
        }) 
        return {
            values: V,
            unit: 'kN'
        }
    }
}

export default Stirrups;
