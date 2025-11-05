import Concrete from '../../../utils/elements/concrete/Concrete.js'
import { Adimensional } from 'types/index.js'
import RelativeNeutralLineLimit from './XiLimit.js'

class ReducedLimitingMoment {
    mu_limit: Adimensional

    constructor({ concrete }: { concrete: Concrete }) {
        const xi_limit = new RelativeNeutralLineLimit({ fck: concrete.fck }).xi_limit
        this.mu_limit = this.calculate_mu_limit({ xi_limit, concrete })
    }

    calculate_mu_limit({ xi_limit, concrete }: { xi_limit: Adimensional, concrete: Concrete }): Adimensional {
        const lambda = concrete.lambda
        return {
            value: lambda.value * xi_limit.value * (1 - 0.5 * lambda.value * xi_limit.value),
            unit: 'adimensional'
        }
    }
}

export default ReducedLimitingMoment