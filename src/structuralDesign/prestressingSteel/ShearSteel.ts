import PrestressingSteelForce from "./PrestressingSteelForce.js";
import Concrete from "../../structuralElements/Concrete.js";
import { Combinations } from "../../combinationLoads/Load.js";
import { ValuesUnit, ValueUnit } from "../../types/index.js";
import { CableGeometry } from "./CableGeometry.js";
import CompressionStruts from "./StrutVerification.js";
import Steel from "../../structuralElements/Steel.js";

class ShearSteel {

    prestressingSteelForce: PrestressingSteelForce
    concrete: Concrete
    combinations: Combinations
    cableGeometry: CableGeometry
    Ac: ValueUnit
    W1: ValueUnit
    Md: ValuesUnit
    M0: ValueUnit
    compressionStruts: CompressionStruts
    tau_d: ValueUnit
    tau_c: ValueUnit
    steel: Steel
    rho_w: ValueUnit
    bw: ValueUnit

    constructor({
        prestressingSteelForce, concrete, cableGeometry, combinations, compressionStruts, Ac, W1, Md, steel, bw
    }: {
        prestressingSteelForce: PrestressingSteelForce,
        concrete: Concrete,
        combinations: Combinations
        Ac: ValueUnit
        W1: ValueUnit
        cableGeometry: CableGeometry
        Md: ValuesUnit
        compressionStruts: CompressionStruts
        steel: Steel
        bw: ValueUnit
    }) {
        // 1. Assign all dependencies from constructor arguments first
        this.prestressingSteelForce = prestressingSteelForce
        this.concrete = concrete
        this.combinations = combinations
        this.cableGeometry = cableGeometry
        this.compressionStruts = compressionStruts
        this.Ac = Ac
        this.W1 = W1
        this.Md = Md
        this.steel = steel
        this.bw = bw

        // 2. Now, call calculation methods that depend on the properties above
        this.M0 = this.calculateM0()
        this.tau_c = this.calculate_tau_c()
        this.tau_d = this.calculate_tau_d()
        this.rho_w = this.calculate_rho_w()
    }

    calculateM0(): ValueUnit {
        const NP1 = this.prestressingSteelForce.normal().values[0]
        const y_x1 = this.cableGeometry.y.values[0]
        const W1 = this.W1.value
        const Ac = this.Ac.value

        return {
            value: 0.9 * NP1 * ((1 / Ac) + (y_x1 / W1)) * W1,
            unit: 'kN*cm'
        }
    }

    calculate_psi3(): number {
        return Math.min(0.09 * (1 + (this.M0.value / Math.max(...this.Md.values))), 0.18)
    }

    calculate_tau_c(): ValueUnit {
        const psi3 = this.calculate_psi3()
        const fck_kNCm2 = this.concrete.fck.value
        const fck_MPa = fck_kNCm2 * 10 // Convert fck to MPa for the formula

        // The formula uses fck in MPa, and the result (in MPa) is divided by 10 to get kN/cm²
        return {
            value: psi3 * (fck_MPa ** (2 / 3)) / 10,
            unit: 'kN/cm²'
        }
    }

    calculate_tau_d(): ValueUnit {
        return {
            value: Math.max(1.11 * (Math.max(...this.compressionStruts.calculate_tau_wd().values) - this.calculate_tau_c().value), 0),
            unit: 'kN/cm²' 
        }
    }

    calculate_rho_w(): ValueUnit {
        return {
            value: Math.max((this.calculate_tau_d().value / this.steel.fyd.value), (0.2 * ((this.concrete.fctm.value) / this.steel.fyd.value))),
            unit: 'adimensional'
        }
    }

    calculate_Asw(): ValueUnit {
        return {
            value: this.rho_w.value * this.bw.value * 100,
            unit: 'cm²/m'
        }
    }
}

export default ShearSteel;
export type ShearSteelType = InstanceType<typeof ShearSteel>
