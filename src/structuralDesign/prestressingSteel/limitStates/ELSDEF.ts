import { Combinations } from "combinationLoads/Load.js";
import { GeometricPropsWithUnitsType } from "types/sectionsType.js"
import { ValueUnit } from "types/index.js";
import Concrete from "structuralElements/Concrete.js";
import { Distance, ValuesUnit, VerificationOneValue } from "types/index.js";
import CableGeometry from "../CableGeometry.js";
import CreepConcrete from "structuralDesign/concrete/Creep.js";

class ELSDEF {
    readonly combinations: Combinations
    readonly geometricProps: GeometricPropsWithUnitsType
    readonly concrete: Concrete
    readonly cableGeometry: CableGeometry
    readonly P_inf: ValuesUnit
    readonly creepConcrete: CreepConcrete
    readonly Wc: Distance;
    readonly wp: ValueUnit;
    readonly Wp: Distance;
    readonly W0: Distance;
    readonly W_inf: Distance;
    readonly W_adm: Distance;
    readonly verification: VerificationOneValue;
   
    constructor({combinations, geometricProps, concrete, cableGeometry, P_inf, creepConcrete}: {combinations: Combinations, geometricProps: GeometricPropsWithUnitsType, concrete: Concrete, L: Distance, P_inf: ValuesUnit, epmax: Distance, cableGeometry: CableGeometry, creepConcrete: CreepConcrete}) {
        this.combinations = combinations
        this.geometricProps = geometricProps
        this.concrete = concrete
        this.cableGeometry = cableGeometry
        this.P_inf = P_inf
        this.creepConcrete = creepConcrete

        // Calculate all values once and store them as readonly properties
        this.Wc = this.calculate_Wc();
        this.wp = this.calculate_wp();
        this.Wp = this.calculate_Wp();
        this.W0 = this.calculate_W0();
        this.W_inf = this.calculate_W_inf();
        this.W_adm = this.calculate_W_adm();
        this.verification = this.verification_W();
    }

    calculate_Wc(): Distance {
        const L = this.cableGeometry.width.value
        const combinationQP = this.combinations.quasiPermanent.distributedLoad.value // in kN/cm
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
            value: 8 * P_inf_max * epmax / (L ** 2),
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
            value: this.Wc.value - this.Wp.value,
            unit: 'cm'
        }
    }

    calculate_W_inf(): Distance {
        const W0 = this.calculate_W0().value
        const phi_inf = this.creepConcrete.value
        if (phi_inf === undefined) throw new Error("Creep coefficient (phi) is undefined.");
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
            passed: Math.abs(this.W_inf.value) <= this.W_adm.value,
            limit: this.W_adm,
            value: this.W_inf
        }
    }
}

export default ELSDEF;