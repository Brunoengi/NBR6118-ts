import AgregateConcrete, { IAgregateConcrete } from "./Agregate.js" 

interface IUnitValue {
    value: number
    unit: string
}


class Concrete {

    fck: IUnitValue
    agregate: IAgregateConcrete
    fcm: IUnitValue
    Ec: IUnitValue
    e0: IUnitValue
    eu: IUnitValue
    fctm: IUnitValue
    Ecs: IUnitValue
    fctk_inf: IUnitValue
    fctk_sup: IUnitValue



    constructor(fck: number, agregate: IAgregateConcrete) {
        this.fck = this.calculate_fck(fck)
        this.agregate = agregate
        this.fcm = this.calculate_fcm(fck)
        this.Ec = this.calculate_Ec(fck, agregate.alpha_e)
        this.Ecs = this.calculate_Ecs(fck, this.Ec.value)
        this.e0 = this.calculate_e0(fck)
        this.eu = this.calculate_eu(fck)
        this.fctm = this.calculate_fctm(fck)
        this.fctk_inf = this.calculate_fctk_inf(this.fctm.value)
        this.fctk_sup = this.calculate_fctk_sup(this.fctm.value)
    }

    calculate_fck(fck: number): {value: number, unit: string} {
        return {
            value: fck,
            unit: "MPa"
        }
    }

    calculate_Ec(fck: number, alpha_e: number): {value: number, unit: string} {
        let Ec: number
        if(fck <=50) {
            Ec = alpha_e * 5600 * (fck ** 0.5)
        }
        else if (fck > 50){
            Ec = alpha_e * 21500 * ((this.fcm.value / 10) ** (1/3))
        }
        else {
            throw new Error("Invalid fck value")
        }
        return {
            value: Ec,
            unit: "MPa"
        }
    }

    calculate_fcm(fck: number): {value: number, unit: string} {
        return {
            value: fck + 12.5,
            unit: "MPa"
        }
    }

    calculate_Ecs(fck: number, Ec: number): {value: number, unit: string} {
        let alpha_i = 0.8 + 0.2 * fck / 80
        alpha_i = alpha_i > 1 ? 1 : alpha_i
        
        return {
            value: alpha_i * Ec,
            unit: "MPa"
        }

    }

    calculate_e0(fck: number): {value: number, unit: string} {
        let e0: number

        if (fck <= 50) {
            e0 = 2
        }
        else if (fck > 50) {
            e0 = 2 + 0.085 * ((fck - 50) ** 0.53)
        }
        else {
            throw new Error("Invalid fck value")
        }

        return {
            value: e0,
            unit: "1/1000"
        }
    }

    calculate_eu(fck: number): {value: number, unit: string} {
        let eu: number

        if (fck <= 50) {
            eu = 3.5
        }
        else if (fck > 50) {
            eu = 2.6 + 35 * ((90 - fck)/100) ** 4
        }
        else {
            throw new Error("Invalid fck value")
        }

        return {
            value: eu,
            unit: "1/1000"
        }
    }

    calculate_fctm(fck: number): {value: number, unit: string} {
        let fctm: number

        if (fck <= 50) {
            fctm = 0.3 * (fck) ** (2/3)
        }
        else if (fck > 50) {
            fctm = 2.12 * Math.log((1 + 0.1 * (fck + 8)))
        }
        else {
            throw new Error("Invalid fck value")
        }

        return {
            value: fctm,
            unit: "MPa"
        }
    }

    calculate_fctk_inf(fctm: number): {value: number, unit: string} {
        return {
            value: 0.7 * fctm,
            unit: "MPa"
        }
    }

    calculate_fctk_sup(fctm: number): {value: number, unit: string} {
        return {
            value: 1.3 * fctm,
            unit: "MPa"
        }
    }
}

export default Concrete