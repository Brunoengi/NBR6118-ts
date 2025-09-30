import { Combinations } from "combinationLoads/Load.js";
import { GeometricPropsWithUnitsType } from "types/sectionsType.js"
import { ValueUnit } from "types/index.js";
import Concrete from "structuralElements/Concrete.js";
import { Distance, ValuesUnit, VerificationOneValue } from "types/index.js";
import { CableGeometry } from "../CableGeometry.js";
import { CreepConcrete } from "structuralDesign/concrete/Creep.js";

class ELSDEF {
    readonly combinations: Combinations
    readonly geometricProps: GeometricPropsWithUnitsType
    readonly concrete: Concrete
    readonly cableGeometry: CableGeometry
    readonly P_inf: ValuesUnit
    readonly creepConcrete: CreepConcrete
   
    constructor({combinations, geometricProps, concrete, cableGeometry, P_inf, creepConcrete}: {combinations: Combinations, geometricProps: GeometricPropsWithUnitsType, concrete: Concrete, L: Distance, P_inf: ValuesUnit, epmax: Distance, cableGeometry: CableGeometry, creepConcrete: CreepConcrete}) {
        this.combinations = combinations
        this.geometricProps = geometricProps
        this.concrete = concrete
        this.cableGeometry = cableGeometry
        this.P_inf = P_inf
        this.creepConcrete = creepConcrete
    }

    calculate_Wc(): Distance {
        const L = this.cableGeometry.width.value
        const combinationQP = this.combinations.quasiPermanent.distributedLoad.value
        const Ecs = this.concrete.Ecs.value
        const Ic = this.geometricProps.Ixg.value

        return {
            value: (5/384) * ((combinationQP * (L ** 4)) / (Ecs * Ic)),
            unit: 'cm'
        }
    }

    calculate_wp(): ValueUnit {
        const P_inf_max = Math.min(...this.P_inf.values)
        const epmax = this.cableGeometry.epmax.value
        const L = this.cableGeometry.width.value

        return {
            value: 8 * P_inf_max * (epmax / L),
            unit: 'kN/cm'
        }
    } 

    calculate_Wp(): Distance {
        const wp = this.calculate_wp().value
        const L = this.cableGeometry.width.value
        const Ecs = this.concrete.Ecs.value
        const Ic = this.geometricProps.Ixg.value

        return {
            value: (5/384) * wp * (L ** 4)/(Ecs * Ic),
            unit: 'cm'
        }
    }

    calculate_W0(): Distance {
        return {
            value: this.calculate_Wc().value - this.calculate_Wp().value,
            unit: 'cm'
        }
    }

    calculate_W_inf(): Distance {
        const W0 = this.calculate_W0().value
        const phi_inf = this.creepConcrete.value

        return {
            value: (1 + phi_inf) * W0,
            unit: 'cm'
        }
    }

    calculate_W_adm(): Distance {
        const L = this.cableGeometry.width.value
        return {
            value: L/250,
            unit: 'cm'
        }
    }

    verification_W(): VerificationOneValue {
        return {
            passed: this.calculate_W_inf().value <= this.calculate_W_adm().value,
            limit: this.calculate_W_adm(),
            value: this.calculate_W_inf()
        }
    }
}

export default ELSDEF;