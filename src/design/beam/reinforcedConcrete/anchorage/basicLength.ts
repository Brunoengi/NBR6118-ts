import { Distance, Stress, Diameter } from "../../../../types/index.js"

abstract class BasicLength {
    calculate_lb({fyd, fbd, phi}: {fyd: Stress, fbd: Stress, phi: Diameter}): Distance {

        return {
            value: Math.max((phi.value/10) * (fyd.value/fbd.value), phi.value * (25/10)),
            unit: 'cm'
        }
    }
}

export default BasicLength;