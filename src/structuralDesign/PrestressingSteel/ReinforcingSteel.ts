import { ValuesUnit, ValueUnit } from "types/index.js"

class ReinforcingSteel {
    public readonly sigma: {
        sigma1P0: ValuesUnit
        sigma2P0: ValuesUnit
    }
    h: ValueUnit
    b: ValueUnit
    neutralLine: ValueUnit
    Rct: ValueUnit
    Asl: ValueUnit
    dl: ValueUnit
    dp: ValueUnit



    constructor({sigma, h, b, dl, dp}: {
        sigma: {
            sigma1P0: ValuesUnit
            sigma2P0: ValuesUnit
        }
        h: ValueUnit
        b: ValueUnit
        dl: ValueUnit
        dp: ValueUnit
    }
    ) {
        this.sigma = sigma
        this.h = h
        this.b = b
        this.dl = dl
        this.dp = dp
        this.neutralLine = this.calculateNeutralLine()
        this.Rct = this.calculateRct()
        this.Asl = this.calculateAsl()
    
    }

    calculateNeutralLine(): ValueUnit {
        const x = this.h.value *  Math.max(...this.sigma.sigma2P0.values) / (Math.max(...this.sigma.sigma2P0.values) - Math.min(...this.sigma.sigma1P0.values))

        return {
            value: x,
            unit: 'cm'
        }
    }

    calculateRct(): ValueUnit {
        return {
            value: this.neutralLine.value * Math.max(...this.sigma.sigma2P0.values) * this.b.value / 2,
            unit: 'kN'
        }
    }

    calculateAsl(): ValueUnit {
        return {
            value: this.Rct.value / 25,
            unit: 'cm²'
        }
    }

    calculate_ds1(): ValueUnit {
        return {
            value: this.h.value - this.dl.value,
            unit: 'cm' 
        }
    }

    calculate_dp(): ValueUnit {
        return {
            value: this.h.value - this.dp.value,
            unit: 'cm'
        }
    }

    // calculate_As_rectangular(): ValueUnit {

    //     const a = -0.32 * this.b.value * 

    //     return {
    //         value: this.h.value * this.b.value,
    //         unit: 'cm²'
    //     }}
    
}

export default ReinforcingSteel;