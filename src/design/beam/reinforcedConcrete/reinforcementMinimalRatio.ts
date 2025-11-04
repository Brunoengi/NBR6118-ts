
import { fck, rhomin, steel } from "types/index.js";


class Flexural {
    
    rhomin: rhomin

    constructor({fck, steel} : {fck: fck, steel: steel}){

        this.rhomin = this.calculate_rhomin({fck, steel})
    }

    calculate_rhomin({ fck, steel}: {fck: fck, steel: steel}): rhomin {

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

        if (steel.name === 'CA-50') {
            rho_value = steel_50[fck_MPa];
        } else if (steel.name === 'CA-60') {
            rho_value = steel_60[fck_MPa];
        } else {
            throw new Error('Invalid steel name');
        }

        return { value: rho_value, unit: 'adimensional' };
    }
}

export default Flexural