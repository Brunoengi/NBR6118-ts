import { Combinations } from "combinationLoads/Load.js";
import { GeometricProps } from "geometric-props";
import Concrete from "structuralElements/Concrete.js";
import { Distance, ValuesUnit } from "types/index.js";

class ELSDEF {
    readonly combinations: Combinations
    readonly geometricProps: GeometricProps
    readonly concrete: Concrete
    readonly L: Distance
    readonly P_inf: ValuesUnit
    readonly epmax: Distance

    constructor({combinations, geometricProps, concrete, L, P_inf, epmax}: {combinations: Combinations, geometricProps: GeometricProps, concrete: Concrete, L: Distance, P_inf: ValuesUnit, epmax: Distance}) {
        this.combinations = combinations
        this.geometricProps = geometricProps
        this.concrete = concrete
        this.L = L
        this.P_inf = P_inf
        this.epmax = epmax
    }

    // calculate_wc(): Distance {
    //     return {
    //         value: 5 * this.combinations.quasiPermanent.distributedLoad.value * this.L.value ** 4,
    //         unit: 'cm'
    //     }
    // }

}