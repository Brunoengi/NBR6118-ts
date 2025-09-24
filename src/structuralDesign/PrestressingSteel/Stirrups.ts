import { Combinations } from "combinations/Load.js";
import { ValueUnit, ValuesUnit } from "types/index.js";
import { CableGeometry } from "./CableGeometry.js";



class Stirrups {
    Vsd: ValuesUnit
    combinations: Combinations
    cableGeometry: CableGeometry
    P_inf: ValueUnit
    x: ValuesUnit
    

    constructor({combinations, cableGeometry, P_inf, x} ) {
        this.combinations = combinations
        this.cableGeometry = cableGeometry
        this.P_inf = P_inf
        this.x = x
    }

    // calculate_Vsd(): ValuesUnit {
    //     const Vg1 = this.calculate_V({g: this.combinations.mg1, x: this.x, width: this.cableGeometry.width})
    //     const Vg2 = this.calculate_V({g: this.combinations.mg2, x: this.x, width: this.cableGeometry.width})
    //     const Vq = this.calculate_V({g: this.combinations.mq, x: this.x, width: this.cableGeometry.width})



    // }

    calculate_V({g, x, width}: {g: ValueUnit, x: ValuesUnit, width: ValueUnit}) {
        const V = x.values.map((x_i, i) => {
            return (g.value * width.value / 2) - g.value * x_i
        }) 
        return {
            values: V,
            unit: 'kN'
        }
    }

    calculate_verticalPrestressingForce() {
        const P_inf = this.P_inf.value
    }

}