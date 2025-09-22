import Concrete from "buildingElements/Concrete.js";
import { Combinations } from "combinations/Load.js";
import { ValuesUnit, ValueUnit } from "types/index.js";
import { PrestressingDesignType } from "types/prestressSteel.js";

class ELS { 
    public readonly type: PrestressingDesignType
    public readonly Ac: ValueUnit
    public readonly ep: ValueUnit
    public readonly W1: ValueUnit
    public readonly W2: ValueUnit
    public readonly P_inf: ValuesUnit
    public readonly concrete: Concrete
    
    constructor({type, Ac, ep, W1, W2, P_inf}: {
        type: PrestressingDesignType
        Ac: ValueUnit
        ep: ValueUnit
        W1: ValueUnit
        W2: ValueUnit
        P_inf: ValuesUnit
        combinations: Combinations
    }) {
        this.type = type
        this.Ac = Ac
        this.ep = ep
        this.W1 = W1
        this.W2 = W2
        this.P_inf = P_inf
    }

    sigma1P_inf_ELS({combination}: {combination: ValuesUnit}): ValuesUnit {
        const sigma1P_inf = combination.values.map((combination_i, i) => {
            const p_part = this.P_inf.values[i] * ((1/this.Ac.value) + (this.ep.value[i]/this.W1.value))
            const mg_part = - (combination_i * 100) / this.W1.value
            return p_part + mg_part
        })

        return {
            values: sigma1P_inf,
            unit: 'kN/cm²'
        }
    }

    sigma2P_inf_ELSF({combination}: {combination: ValuesUnit}): ValuesUnit {
        const sigma2P_inf = combination.values.map((combination_i, i) => {
            const p_part = this.P_inf.values[i] * ((1/this.Ac.value) + (this.ep.value[i]/this.W2.value))
            const mg_part = - (combination_i * 100) / this.W2.value
            return p_part + mg_part
        })

        return {
            values: sigma2P_inf,
            unit: 'kN/cm²'
        }
    }







}


