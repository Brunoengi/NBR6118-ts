import Concrete from '../../../../utils/elements/concrete/Concrete.js' 
import Steel from '../../../../utils/elements/steel/Steel.js'
import { Force, Adimensional, Distance, Stress, AreaPerMeter, VerificationOneValue } from '../../../../types/index.js'
import AbstractSection from 'utils/sections/AbstractSection.js'
import { AxialRhoMin } from './RhoMin.js'


class ShearSteel {
    
    steel: {
        Asw_min: AreaPerMeter
        Aswc: AreaPerMeter
        Asw: AreaPerMeter
    }

    constructor ({Vk, concrete, steel, section, d, gamma_f = {value: 1.4, unit: 'adimensional'}}: {Vk: Force, concrete: Concrete, steel: Steel, gamma_f?: Adimensional, section: AbstractSection, d: Distance}) {

        const Vd = this.calculate_Vd({gamma_f, Vk})
        const tau_wd = this.calculate_tau_wd({Vd, bw: section.inputs.base, d})
        const tau_wu = this.calculate_tau_wu({concrete})
        const tau_c = this.calculate_tau_c({concrete})
        const tau_d = this.calculate_tau_d({tau_wd, tau_c})
        const Aswc = this.calculate_Aswc({bw: section.inputs.base, tau_d, steel})
        
        const rho_w_min = new AxialRhoMin({fck: concrete.fck}).rho_w_min
        const Asw_min = this.calculate_Asw_min({rho_w_min, bw: section.inputs.base})
        const Asw = this.calculate_Asw({Asw_min, Aswc})

        this.steel = {
            Asw_min,
            Aswc,
            Asw
        }
    }

    calculate_Vd({gamma_f, Vk}: {gamma_f: Adimensional, Vk: Force}): Force {
        return {
            value: gamma_f.value * Vk.value,
            unit: 'kN'
        }
    }

    calculate_tau_wd({Vd, bw, d}: {Vd: Force, bw: Distance, d: Distance}): Stress {
        
        return {
            value: Vd.value / (bw.value * d.value),
            unit: 'kN/cm²'
        }
    }

    calculate_tau_wu({concrete}: {concrete: Concrete}): Stress {
        return {
            value: 0.27 * (1 - (concrete.fck.value * 10/250)) * concrete.fcd.value,
            unit: 'kN/cm²'
        }
    }

    calculate_tau_c({concrete}: {concrete: Concrete}): Stress {
        return {
            value: (0.09 * ((concrete.fck.value * 10) ** (2/3)))/10,
            unit: 'kN/cm²'
        }
    }

    calculate_tau_d({tau_wd, tau_c}: {tau_wd: Stress, tau_c: Stress}): Stress {
        return {
            value: 1.11 * (tau_wd.value - tau_c.value),
            unit: 'kN/cm²'
        }
    }

      /**
     * A NBR-6118 determina que a tensão de escoamento do aço a ser adotada nos cálculos não pode passar 43.5 kN/cm²
     * @returns {A}
     */

    calculate_Aswc({bw, tau_d, steel}: {bw: Distance, tau_d: Stress, steel: Steel}): AreaPerMeter {
        
        const fyd = steel.fyd.value <= 43.5 ? steel.fyd.value : 43.5 
        
        return {
            value: 100 * bw.value * (tau_d.value / fyd),
            unit: 'cm²/m'
        }
    }

    calculate_Asw_min({rho_w_min, bw}: {rho_w_min: Adimensional, bw: Distance}): AreaPerMeter {
        return {
            value: rho_w_min.value * bw.value * 100,
            unit: 'cm²/m'
        }
    }

    calculate_Asw({Asw_min, Aswc}: {Asw_min: AreaPerMeter, Aswc: AreaPerMeter}): AreaPerMeter {
        return {
            value: Math.max(Asw_min.value, Aswc.value),
            unit: 'cm²/m'
        }
    }

    verify_compression_strut({tau_wu, tau_wd}): VerificationOneValue {
        return {
            passed: tau_wd.value <= tau_wu.value,
            limit: tau_wu,
            value: tau_wd
        }
    } 
}

export default ShearSteel;