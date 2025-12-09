import { Distance, Stress, Diameter } from "../../../../types/index.js"

abstract class BasicLength {
    calculate_lb({fyd, fbd, barDiameter}: {fyd: Stress, fbd: Stress, barDiameter: Diameter}): Distance {

        return {
            value: Math.max((barDiameter.value/10) * (fyd.value/fbd.value), barDiameter.value * (25/10)),
            unit: 'cm'
        }
    }
}

export default BasicLength;