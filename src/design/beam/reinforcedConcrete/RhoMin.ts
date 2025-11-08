
import { Stress, Adimensional } from "types/index.js";
import Steel from "utils/elements/steel/Steel.js";

/**
* Taxa mínima de armadura baseado na NBR 6118
*/
class FlexuralRhoMin {
    
    rho_min: Adimensional

    constructor({fck, steel} : {fck: Stress, steel: Steel}){
        this.rho_min = this.calculate_rhomin({fck, steel})
    }

    calculate_rhomin({ fck, steel}: {fck: Stress, steel: Steel}): Adimensional {

        const steel_50: Record<number, number> = {
            20: 0.15/100,
            25: 0.15/100,
            30: 0.17/100,
            35: 0.19/100,
            40: 0.21/100,
            45: 0.23/100,
            50: 0.24/100,
            55: 0.25/100,
            60: 0.26/100,
            70: 0.27/100,
            80: 0.29/100,
            90: 0.30/100,
        }

        const steel_60: Record<number, number> = {
            20: 0.15/100,
            25: 0.15/100,
            30: 0.15/100,
            35: 0.16/100,
            40: 0.18/100,
            45: 0.19/100,
            50: 0.20/100,
            55: 0.21/100,
            60: 0.21/100,
            70: 0.23/100,
            80: 0.24/100,
            90: 0.25/100
        }

        const fck_MPa = fck.value * 10;
        let rho_value: number;

        if (steel.label === 'CA-50') {
            rho_value = steel_50[fck_MPa];
        } else if (steel.label === 'CA-60') {
            rho_value = steel_60[fck_MPa];
        } else {
            throw new Error('Invalid steel name');
        }

        return { value: rho_value, unit: 'adimensional' };
    }
}

class AxialRhoMin {
    rho_w_min: Adimensional

    constructor({ fck }: { fck: Stress }) {
        this.rho_w_min = this.calculate_rho_w_min({fck})
    }

    calculate_rho_w_min({ fck }: { fck: Stress }): Adimensional {

        const fck_rho_w_min: Record<number, number> = {
            2.0: 0.09/100,
            2.5: 0.10/100,
            3.0: 0.12/100,
            3.5: 0.13/100,
            4.0: 0.14/100,
            4.5: 0.15/100,
            5.0: 0.16/100,
            5.5: 0.17/100,
            6.0: 0.17/100,
            7.0: 0.18/100,
            8.0: 0.19/100,
            9.0: 0.20/100,
        }

        return {
            value: fck_rho_w_min[fck.value],
            unit: 'adimensional'
        }
    }
}

export {FlexuralRhoMin, AxialRhoMin}