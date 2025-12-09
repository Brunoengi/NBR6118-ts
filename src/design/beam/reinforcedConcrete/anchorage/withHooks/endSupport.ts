import BasicLength from "../basicLength.js"
import Bend from "./bend.js";
import { HooksDatabase, SteelBar } from "types/materials/steel/barsType.js";
import Steel from "utils/elements/steel/Steel.js"
import { Distance } from "types/index.js";
import { BarPropertie, HookType, Alpha1 } from "types/materials/steel/barsType.js";
import BondStressUltimate from "../bondStressUltimate.js"
import { Grip } from "../bondStressUltimate.js"
import Concrete from "utils/elements/concrete/Concrete.js"
import { A } from "types/sectionsType.js"
import Bars from "utils/elements/steel/Bars.js"
import { Stress, Diameter } from "types/index.js"


/**
 * @remarks
 * Bibliographic Reference: ARAÚJO, José Milton de. Curso de concreto armado. v. 1. 5. ed. Rio Grande, RS: Dunas, 2023. p. 296.
*/
class endSupport extends BasicLength {

    lb_nec: Distance
    lb_min: Distance
    lb: Distance
    lb_adopted: Distance


    constructor({ alpha1, concrete, steel, grip, hookType, barDiameter, As }: { hookType: HookType, barDiameter: BarPropertie['diameter'], steel: Steel, grip: Grip, concrete: Concrete, As: A, alpha1: Alpha1 }) {
        super();
        const bondStressUltimate = new BondStressUltimate({ concrete, steel, grip })
        const bend = new Bend({ hookType, barDiameter, steel: steel.label });
        const bars = new Bars({ As, barDiameter })

        this.lb = this.calculate_lb({ fyd: steel.fyd, fbd: bondStressUltimate.fbd, barDiameter })

        this.lb_min = this.calculate_lb_min({ BendDiameter: bend.minimalBendDiameter, barDiameter })

        this.lb_nec = this.calculate_lb_nec({ alpha1, fyd: steel.fyd, fbd: bondStressUltimate.fbd, barDiameter, bars })

        this.lb_adopted = this.calculate_lb_adopted({ lb_nec: this.lb_nec, lb_min: this.lb_min })
    }

    /**
    * @remarks
    * Bibliographic Reference: ARAÚJO, José Milton de. Curso de concreto armado. v. 1. 5. ed. Rio Grande, RS: Dunas, 2023. p. 297.
    */

    calculate_lb_min({ BendDiameter, barDiameter }: { BendDiameter: Distance, barDiameter: Diameter }): Distance {
        const bendRadius_cm = BendDiameter.value / 2;

        return {
            value: Math.max(barDiameter.value * 5.5 + bendRadius_cm, 6),
            unit: 'cm'
        }
    }

    calculate_lb_nec({ alpha1, fyd, fbd, barDiameter, bars }: { fyd: Stress, fbd: Stress, barDiameter: Diameter, bars: Bars, alpha1: Alpha1 }): Distance {
        const As_calculated = bars.steel.calculated
        const As_effective = bars.steel.effective
        const lb = this.calculate_lb({ fyd, fbd, barDiameter })

        return {
            value: alpha1 * lb.value * (As_calculated.value / As_effective.value),
            unit: 'cm'
        }
    }

    calculate_lb_adopted({ lb_nec, lb_min }: { lb_nec: Distance, lb_min: Distance }): Distance {
        return {
            value: Math.max(lb_nec.value, lb_min.value),
            unit: 'cm'
        }
    }
}

export default endSupport;