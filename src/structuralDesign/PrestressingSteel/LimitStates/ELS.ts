import Concrete from "buildingElements/Concrete.js";
import { Combinations } from "combinations/Load.js";
import { ValuesUnit, ValueUnit } from "types/index.js";
import { PrestressingDesignType } from "types/prestressSteel.js";

class ELS { 
    public readonly type: PrestressingDesignType
    public readonly Ac: ValueUnit
    public readonly ep: ValuesUnit
    public readonly W1: ValueUnit
    public readonly W2: ValueUnit
    public readonly P_inf: ValuesUnit
    public readonly concrete: Concrete
    public readonly sigma1P_infinity_ELSF: ValuesUnit
    public readonly sigma2P_infinity_ELSF: ValuesUnit
    public readonly sigma1P_infinity_ELSD: ValuesUnit
    public readonly sigma2P_infinity_ELSD: ValuesUnit
    
    constructor({type, Ac, ep, W1, W2, P_inf, combinations, x, width}: {
        type: PrestressingDesignType
        Ac: ValueUnit
        ep: ValuesUnit
        W1: ValueUnit
        W2: ValueUnit
        P_inf: ValuesUnit
        combinations: Combinations
        x: ValuesUnit
        width: ValueUnit
    }) {
        this.type = type
        this.Ac = Ac
        this.ep = ep
        this.W1 = W1
        this.W2 = W2
        this.P_inf = P_inf

        if(type == 'Limited') {
            this.sigma1P_infinity_ELSF = this.sigma1P_infinity({combination: combinations.calculateMoments({moment: combinations.frequent.moment, x, width})})
            this.sigma2P_infinity_ELSF = this.sigma2P_infinity({combination: combinations.calculateMoments({moment: combinations.frequent.moment, x, width})})

            this.sigma1P_infinity_ELSD = this.sigma1P_infinity({combination: combinations.calculateMoments({moment: combinations.quasiPermanent.moment, x, width})})
            this.sigma2P_infinity_ELSD = this.sigma2P_infinity({combination: combinations.calculateMoments({moment: combinations.quasiPermanent.moment, x, width})})
        }
    }

    sigma1P_infinity({combination}: {combination: ValuesUnit}): ValuesUnit {
        const sigma1P_inf = combination.values.map((combination_i, i) => {
            const p_part = this.P_inf.values[i] * ((1/this.Ac.value) + (this.ep.values[i]/this.W1.value))
            const mg_part = - (combination_i * 100) / this.W1.value
            return p_part + mg_part
        })

        return {
            values: sigma1P_inf,
            unit: 'kN/cm²'
        }
    }

    sigma2P_infinity({combination}: {combination: ValuesUnit}): ValuesUnit {
        const sigma2P_inf = combination.values.map((combination_i, i) => {
            const p_part = this.P_inf.values[i] * ((1/this.Ac.value) + (this.ep.values[i]/this.W2.value))
            const mg_part = - (combination_i * 100) / this.W2.value
            return p_part + mg_part
        })

        return {
            values: sigma2P_inf,
            unit: 'kN/cm²'
        }
    }
}


export default ELS;