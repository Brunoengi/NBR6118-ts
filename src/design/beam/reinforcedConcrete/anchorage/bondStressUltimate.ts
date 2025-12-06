import Concrete from "utils/elements/concrete/Concrete.js";
import { Stress } from "types/index.js";
import Steel from "utils/elements/steel/Steel.js";

export type Grip = 'good' | 'bad'

interface AnchorageCoefficients {
    k1: number;
    k2: number;
}

/**
 * @remarks
 * Referencia Bibliográfica: ARAÚJO, José Milton de. Curso de Concreto Armado. Volume 1. 5. ed. Rio Grande, RS: Dunas, 2023. p. 285.
 */
 class BondStressUltimate {

    static readonly anchorageTableCoefficients: Record<Grip, Record<Steel['label'], AnchorageCoefficients>> = {
        good: {
            "CA-25": { k1: 1.0, k2: 0.44 },
            "CA-50": { k1: 1.0, k2: 1.00 },
            "CA-60": { k1: 0.8, k2: 0.44 },
        },

        bad: {
            "CA-25": { k1: 0.7, k2: 0.44 },
            "CA-50": { k1: 0.7, k2: 1.00 },
            "CA-60": { k1: 0.7, k2: 0.44 },
        },
    };

    readonly fbd: Stress;

    constructor({concrete, steel, grip}: {concrete: Concrete, steel: Steel, grip: Grip}){
        const fcd = concrete.fcd;
        if (concrete.fck.value <= 5){
            this.fbd = this.calculate_fbd_fckLessThan50MPa({fcd, grip, steelName: steel.label})
        } else if (concrete.fck.value > 5){
            this.fbd = this.calculate_fbd_fckGreaterThan50MPa({fcd, grip, steelName: steel.label})
        }
    }

    calculate_k1_k2({ grip, steelName }: { grip: Grip, steelName: Steel['label'] }): AnchorageCoefficients {
        return BondStressUltimate.anchorageTableCoefficients[grip][steelName]
    }
 
    calculate_fbd_fckLessThan50MPa({ fcd, grip, steelName }: { fcd: Stress, grip: Grip, steelName: Steel['label'] }) {
        const { k1, k2 } = this.calculate_k1_k2({ grip, steelName });
        const fcd_MPa = fcd.value * 10
        const fbd_MPa = 0.42 * (fcd_MPa) ** (2 / 3)
        const fbd = (fbd_MPa * k1 * k2) / 10

        return {
            value: fbd,
            unit: fcd.unit
        }
    }

    calculate_fbd_fckGreaterThan50MPa({ fcd, grip, steelName}: { fcd: Stress, grip: Grip, steelName: Steel['label']}) {
        const { k1, k2 } = this.calculate_k1_k2({ grip, steelName });
        const fcd_MPa = fcd.value * 10
        const fbd_MPa = 2.39 * Math.log(1.8 + 0.14 * fcd_MPa)
        const fbd = (fbd_MPa * k1 * k2) / 10

        return {
            value: fbd,
            unit: fcd.unit
        }
    }
}

export default BondStressUltimate;