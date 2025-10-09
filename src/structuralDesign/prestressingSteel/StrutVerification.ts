import { Combinations } from "combinationLoads/Load.js";
import { ValueUnit, ValuesUnit, Distance, Verification } from "types/index.js";
import { CableGeometry } from "./CableGeometry.js";
import PrestressingSteelForce from "./PrestressingSteelForce.js";
import Concrete from "../../structuralElements/Concrete.js";

class StrutVerification {
    Vsd: ValuesUnit
    combinations: Combinations
    cableGeometry: CableGeometry
    prestressSteelForce: PrestressingSteelForce

    concrete: Concrete
    tau_wu: ValueUnit
    sum_phi_b: Distance
    bw: Distance
    h: Distance
    dl: Distance


    constructor({combinations, cableGeometry, prestressSteelForce, sum_phi_b, bw, concrete, h, dl}: {combinations: Combinations, cableGeometry: CableGeometry, prestressSteelForce: PrestressingSteelForce, sum_phi_b: Distance, bw: Distance, concrete: Concrete, h: Distance, dl: Distance} ) {

        this.combinations = combinations
        this.cableGeometry = cableGeometry
        this.prestressSteelForce = prestressSteelForce
        this.concrete = concrete
        this.bw = bw
        this.sum_phi_b = sum_phi_b
        this.h = h
        this.dl = dl
        this.Vsd = this.calculate_Vsd()
    }

    calculate_Vsd(): ValuesUnit {
        const Vg1 = this.calculate_V({g: this.combinations.g1})
        const Vg2 = this.calculate_V({g: this.combinations.g2})
        const Vq = this.calculate_V({g: this.combinations.q})
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
        // Units are consistent: g is in kN/cm, width and x are in cm.
        const width_cm = this.cableGeometry.width.value;
        const x_cm = this.cableGeometry.x.values;

        const V = x_cm.map((x_i_cm) => {
            // Formula for shear in a simply supported beam: V(x) = q*L/2 - q*x
            return (g.value * width_cm / 2) - (g.value * x_i_cm);
        });
        return {
            values: V,
            unit: 'kN'
        }
    }

    calculate_tau_wu(): ValueUnit {
        return {
            value: (0.27 * (1 - this.concrete.fck.value / 25) * this.concrete.fcd.value) ,
            unit: 'kN/cm²'
        }
    }

    calculate_tau_wd(): ValuesUnit{

        const bw_corr = this.calculate_bw_corrected()
        const ds1 = this.h.value - this.dl.value
        

        return {
            values: this.Vsd.values.map((Vsd_i, i)=> {
                return Vsd_i / (bw_corr.value * ds1)
            }),
            unit: 'kN/cm²'
        }
    }

    calculate_bw_corrected(): Distance {
        return {
            value: this.bw.value -  this.sum_phi_b.value / 2,
            unit: 'cm'
        }
    }

    verification_crush_concrete(): Verification {
        const tau_wu = this.calculate_tau_wu()
        const tau_wd = this.calculate_tau_wd()
        
        return {
            passed: tau_wd.values.every(tau_wd_i => Math.abs(tau_wd_i) <= Math.abs(tau_wu.value)),
            limit: tau_wu,
            values: tau_wd
        }
    }
}

export default StrutVerification;
export type StrutVerificationType = InstanceType<typeof StrutVerification>
