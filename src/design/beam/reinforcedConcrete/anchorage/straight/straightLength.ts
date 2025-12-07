import BondStressUltimate from "../bondStressUltimate.js"
import Bars from "../../../../../utils/elements/steel/Bars.js"
import Concrete from "../../../../../utils/elements/concrete/Concrete.js"
import { A } from "../../../../../types/sectionsType.js"
import { BarPropertie } from "../../../../../types/materials/barsType.js"
import  Steel  from "../../../../../utils/elements/steel/Steel.js"
import { Grip } from "../bondStressUltimate.js"
import { Distance, Stress, Diameter } from "../../../../../types/index.js"
import BasicLength from "../basicLength.js"


/**
 * @remarks
 * Bibliographic Reference: ARAÚJO, José Milton de. Curso de concreto armado. v. 1. 5. ed. Rio Grande, RS: Dunas, 2023. p. 285-286.
*/

class StraightLength extends BasicLength {

    lb_nec: Distance
    lb_min: Distance
    lb: Distance
    
    constructor({steel, As, barDiamenter, concrete, grip} : {steel: Steel, As: A, barDiamenter: BarPropertie['diameter'], concrete: Concrete, grip: Grip} ){
        super();
        const bondStressUltimate = new BondStressUltimate({concrete, steel, grip})
        const bars = new Bars({As, barDiamenter})

        this.lb = this.calculate_lb({fyd: steel.fyd, fbd: bondStressUltimate.fbd, phi: barDiamenter})
        this.lb_min = this.calculate_lb_min({fyd: steel.fyd, fbd: bondStressUltimate.fbd, phi: barDiamenter})
        this.lb_nec = this.calculate_lb_nec({fyd: steel.fyd, fbd: bondStressUltimate.fbd, phi: barDiamenter, bars})
    }

    calculate_lb_min({fyd, fbd, phi}: {fyd: Stress, fbd: Stress, phi: Diameter}) : Distance {
        const lb = this.calculate_lb({fyd, fbd, phi})
        return {
            value: Math.max(lb.value * 0.3, 10 * phi.value / 10, 10),
            unit: 'cm'
        }
    }

    calculate_lb_nec({fyd, fbd, phi, bars}: {fyd: Stress, fbd: Stress, phi: Diameter, bars: Bars}): Distance {
        const lb_min = this.calculate_lb_min({fyd, fbd, phi})
        const As_calculated = bars.steel.calculated
        const As_effective = bars.steel.effective
        const lb = this.calculate_lb({fyd, fbd, phi})

        return {
            value: Math.max(lb.value * (As_calculated.value/As_effective.value), lb_min.value),
            unit: 'cm'
        }

    }

}

export default StraightLength;