import BondStressUltimate from "../bondStressUltimate.js"
import Bars from "utils/elements/steel/Bars.js"
import Concrete from "utils/elements/concrete/Concrete.js"
import { A } from "types/sectionsType.js"
import { BarPropertie } from "types/materials/steel/barsType.js"
import  Steel  from "utils/elements/steel/Steel.js"
import { Grip } from "../bondStressUltimate.js"
import { Distance, Stress, Diameter } from "types/index.js"
import BasicLength from "../basicLength.js"


/**
 * @remarks
 * Bibliographic Reference: ARAÚJO, José Milton de. Curso de concreto armado. v. 1. 5. ed. Rio Grande, RS: Dunas, 2023. p. 285-286.
*/

class StraightLength extends BasicLength {

    lb_nec: Distance
    lb_min: Distance
    lb: Distance
    lb_adopted: Distance
    
    constructor({steel, As, barDiameter, concrete, grip} : {steel: Steel, As: A, barDiameter: BarPropertie['diameter'], concrete: Concrete, grip: Grip} ){
        super();
        const bondStressUltimate = new BondStressUltimate({concrete, steel, grip})
        const bars = new Bars({As, barDiameter})

        this.lb = this.calculate_lb({fyd: steel.fyd, fbd: bondStressUltimate.fbd, barDiameter})
        this.lb_min = this.calculate_lb_min({fyd: steel.fyd, fbd: bondStressUltimate.fbd, barDiameter})
        this.lb_nec = this.calculate_lb_nec({fyd: steel.fyd, fbd: bondStressUltimate.fbd, barDiameter, bars})
        this.lb_adopted = this.calculate_lb_adopted({lb_nec: this.lb_nec, lb_min: this.lb_min})
    }

    calculate_lb_min({fyd, fbd, barDiameter}: {fyd: Stress, fbd: Stress, barDiameter: Diameter}) : Distance {
        const lb = this.calculate_lb({fyd, fbd, barDiameter})
        return {
            value: Math.max(lb.value * 0.3, 10 * barDiameter.value / 10, 10),
            unit: 'cm'
        }
    }

    calculate_lb_nec({fyd, fbd, barDiameter, bars}: {fyd: Stress, fbd: Stress, barDiameter: Diameter, bars: Bars}): Distance {
        const As_calculated = bars.steel.calculated
        const As_effective = bars.steel.effective
        const lb = this.calculate_lb({fyd, fbd, barDiameter})

        return {
            value: Math.max(lb.value * (As_calculated.value/As_effective.value)),
            unit: 'cm'
        }
    }

    calculate_lb_adopted({lb_nec, lb_min}: {lb_nec: Distance, lb_min: Distance}): Distance {
        return {
            value: Math.max(lb_nec.value, lb_min.value),
            unit: 'cm'
        }
    }
}

export default StraightLength;