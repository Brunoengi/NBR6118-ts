import { ValuesUnit, ValueUnit } from "types/index.js"

class ImmediatePrestress {
    public readonly P0: ValuesUnit
    public readonly ep: ValuesUnit
    public readonly Ac: ValueUnit
    public readonly W1: ValueUnit
    public readonly W2: ValueUnit
    public readonly sigma1P0_ELU: ValuesUnit
    public readonly sigma2P0_ELU: ValuesUnit
    public readonly Mg: ValuesUnit


    constructor({P0, ep, Ac, W1, W2, Mg}: {
        P0: ValuesUnit
        ep: ValuesUnit
        Ac: ValueUnit
        W1: ValueUnit
        W2: ValueUnit
        Mg: ValuesUnit
    }) {
        this.P0 = P0
        this.ep = ep
        this.Ac = Ac
        this.W1 = W1
        this.W2 = W2
        this.Mg = Mg
        this.sigma1P0_ELU = this.calculateSigma1P0_ELU()
    }

    calculateSigma1P0_ELU(): ValuesUnit {
        const sigma1P0_ELU = this.P0.values.map((P0_i, i) => {
            const p_part = 1.1 * P0_i * ((1 / this.Ac.value) + (this.ep.values[i] / this.W1.value));
            const mg_part = - (this.Mg.values[i] * 100) / this.W1.value; // Convert Mg from kN*m to kN*cm
            return p_part + mg_part;
        })
        
        return {
            values: sigma1P0_ELU,
            unit: 'kN/cm²'
        }
    
    }
}

export default ImmediatePrestress;