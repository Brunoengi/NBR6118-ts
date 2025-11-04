import  CableGeometry from "../postTensioning/CableGeometry.js";
import { ValuesUnit } from "types/index.js";

class PrestressingSteelForce {

    P_inf: ValuesUnit
    cableGeometry: CableGeometry


    constructor({P_inf, cableGeometry} : {P_inf: ValuesUnit, cableGeometry: CableGeometry}) {
        this.P_inf = P_inf
        this.cableGeometry = cableGeometry
    
    }

    normal() : ValuesUnit{
        const angles = this.cableGeometry.angles.values

        return {
            values: angles.map((angle_i ,i) => this.P_inf.values[i] * Math.cos(angle_i)),
            unit: 'kN'
        } 
    }

    shear() : ValuesUnit {
        const angles = this.cableGeometry.angles.values

        return {
            values: angles.map((angle_i ,i) => this.P_inf.values[i] * Math.sin(angle_i)),
            unit: 'kN'
        }
    }
}

export default PrestressingSteelForce;