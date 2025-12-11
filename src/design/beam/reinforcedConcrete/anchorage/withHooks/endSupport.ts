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
import { Stress, Diameter, Force } from "types/index.js"


/**
 * @remarks
 * Bibliographic Reference: ARAÚJO, José Milton de. Curso de concreto armado. v. 1. 5. ed. Rio Grande, RS: Dunas, 2023. p. 296.
*/
class endSupport extends BasicLength {

    lb_nec: Distance
    lb_min: Distance
    lb: Distance
    lb_adopted: Distance
    lb_disponible: Distance

    bend: Bend
    bondStressUltimate: BondStressUltimate



    constructor({ concrete, steel, grip, hookType, barDiameter, Ase, Vd, lb_disponible }: { hookType: HookType, barDiameter: BarPropertie['diameter'], steel: Steel, grip: Grip, concrete: Concrete, Ase: A, Vd: Force, lb_disponible: Distance}) {
        super();
        const alpha1: Alpha1 = 0.7
        this.bondStressUltimate = new BondStressUltimate({ concrete, steel, grip })
        this.bend = new Bend({ hookType, barDiameter, steel: steel.label });

        this.lb = this.calculate_lb({ fyd: steel.fyd, fbd: this.bondStressUltimate.fbd, barDiameter })

        this.lb_min = this.calculate_lb_min({ BendDiameter: this.bend.minimalBendDiameter, barDiameter })

        this.lb_nec = this.calculate_lb_nec({ alpha1, fyd: steel.fyd, fbd: this.bondStressUltimate.fbd, barDiameter, Vd, Ase})

        this.lb_adopted = this.calculate_lb_adopted({ lb_nec: this.lb_nec, lb_min: this.lb_min })

        this.lb_disponible = lb_disponible
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

    calculate_lb_nec({ alpha1, fyd, fbd, barDiameter, Vd, Ase }: { fyd: Stress, fbd: Stress, barDiameter: Diameter, alpha1: Alpha1, Vd: Force, Ase: A }): Distance {

        const lb = this.calculate_lb({ fyd, fbd, barDiameter })
        const As_calculated: A = {value: Vd.value / fyd.value, unit: 'cm²'}
        
        return {
            value: alpha1 * lb.value * (As_calculated.value / Ase.value),
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