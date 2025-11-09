
import { Distance } from "types/index.js"

export type elementType = 'slab' | 'beam' | 'column' | 'soilContact'
export type environmentalAgressionClass = 'I' | 'II' | 'III' | 'IV'


class NominalConcreteCover {
    minimalConcreteCover: Distance;

    static readonly possible: Record<elementType, Record<environmentalAgressionClass, number>> = {
        slab: {
            I: 2.0,
            II: 2.5,
            III: 3.5,
            IV: 4.5
        },
        beam: {
            I: 2.5,
            II: 3.0,
            III: 4.0,
            IV: 5.0
        },
        column: {
            I: 2.5,
            II: 3.0,
            III: 4.0,
            IV: 5.0
        },
        soilContact: {
            I: 3.0,
            II: 3.0,
            III: 4.0,
            IV: 5.0
        }
    }

    constructor({elementType, environmentalAgressionClass}: {elementType: elementType, environmentalAgressionClass: environmentalAgressionClass}) {
        this.minimalConcreteCover = this.get_nominalConcreteCover({elementType, environmentalAgressionClass})
    }

    get_nominalConcreteCover({elementType, environmentalAgressionClass}): Distance {
        return {
            value: NominalConcreteCover.possible[elementType][environmentalAgressionClass],
            unit: 'cm'
        }
    }
}

export default NominalConcreteCover;