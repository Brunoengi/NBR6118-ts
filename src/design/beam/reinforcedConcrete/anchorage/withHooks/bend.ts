import { HooksDatabase, SteelBar } from "types/materials/steel/barsType.js";
import { Steel } from "types/materials/steel/index.js";
import { Distance } from "types/index.js";
import { BarPropertie, HookType } from "types/materials/steel/barsType.js";


class Bend {

    static readonly minimalBendDiameterMultipliers  = {
        'CA-25': { lessThan20mm: 4, greaterThan20mm: 5 },
        'CA-50': { lessThan20mm: 5, greaterThan20mm: 8 },
        'CA-60': { lessThan20mm: 6, greaterThan20mm: null },
    };
    static readonly PossibleBend: HooksDatabase = {
        I: { minHookBasedOnDiameterMultiplier: 2, minimalBendBasedonDiameterMultiplier: Bend.minimalBendDiameterMultipliers  },
        II: { minHookBasedOnDiameterMultiplier: 4, minimalBendBasedonDiameterMultiplier: Bend.minimalBendDiameterMultipliers  },
        III: { minHookBasedOnDiameterMultiplier: 8, minimalBendBasedonDiameterMultiplier: Bend.minimalBendDiameterMultipliers  }
    };

    public minimalHookLength: Distance
    public minimalBendDiameter: Distance


    constructor({ hookType, barDiameter, steel }: { hookType: HookType, barDiameter: BarPropertie['diameter'], steel: Steel['name'] }) {
        this.minimalBendDiameter = this.calculateMinimalBendDiameter({ barDiameter, steel });
        this.minimalHookLength = this.calculateMinimalHookLength({ hookType, barDiameter, steel });

    }

    calculateMinimalHookLength({hookType, barDiameter}: {hookType: HookType, barDiameter: BarPropertie['diameter'], steel: Steel['name']}): Distance {
        const BarDiameter_cm = barDiameter.value * 10;
        return {
            value: BarDiameter_cm * Bend.PossibleBend[hookType].minHookBasedOnDiameterMultiplier,
            unit: 'cm'
        }
    }

    calculateMinimalBendDiameter({barDiameter, steel}: { barDiameter: BarPropertie['diameter'], steel: Steel['name'] }): Distance {
        const BarDiameter_cm = barDiameter.value * 10;
        const minimalBendDiameterMultipliers = Bend.minimalBendDiameterMultipliers[steel];

        if(BarDiameter_cm < 20) {
            return {
                value: BarDiameter_cm * minimalBendDiameterMultipliers.lessThan20mm,
                unit: 'cm'
            }
        } else if (BarDiameter_cm >= 20) {
            return {
                value: BarDiameter_cm * minimalBendDiameterMultipliers.greaterThan20mm,
                unit: 'cm'
            }
        }
    }



}

export default Bend