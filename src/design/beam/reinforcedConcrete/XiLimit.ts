import { Stress, Adimensional } from "types/index.js";

/**
* Posição Relativa Limite da Linha Neutra 
*/
class RelativeNeutralLineLimit {

    xi_limit: Adimensional


    constructor({ fck }: { fck: Stress }) {

        this.xi_limit = this.calculate_xi_limit({ fck })
        
    }

    calculate_xi_limit({ fck }: { fck: Stress }): Adimensional {

        let value: number

        if (fck.value <= 5) {
            value = 0.45
        } else if (fck.value > 5) {
            value = 0.35
        }
        return {
            value,
            unit: 'adimensional'
        }

    }
}

export default RelativeNeutralLineLimit