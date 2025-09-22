import { ValuesUnit, ValueUnit } from "types/index.js"
import Concrete from "buildingElements/Concrete.js"

class ELU {
    public readonly P0: ValuesUnit
    public readonly ep: ValuesUnit
    public readonly Ac: ValueUnit
    public readonly W1: ValueUnit
    public readonly W2: ValueUnit
    public readonly sigma1P0_ELU: ValuesUnit
    public readonly sigma2P0_ELU: ValuesUnit
    public readonly Mg: ValuesUnit
    public readonly concrete: Concrete



    constructor({P0, ep, Ac, W1, W2, Mg, concrete}: {
        P0: ValuesUnit
        ep: ValuesUnit
        Ac: ValueUnit
        W1: ValueUnit
        W2: ValueUnit
        Mg: ValuesUnit
        concrete: Concrete
    }) {
        this.P0 = P0
        this.ep = ep
        this.Ac = Ac
        this.W1 = W1
        this.W2 = W2
        this.Mg = Mg
        this.sigma1P0_ELU = this.calculateSigma1P0()
        this.sigma2P0_ELU = this.calculateSigma2P0()
        this.concrete = concrete
    }

    calculateSigma1P0(): ValuesUnit {
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

    calculateSigma2P0(): ValuesUnit {
        const sigma2P0_ELU = this.P0.values.map((P0_i, i) => {
            const p_part = 1.1 * P0_i * ((1 / this.Ac.value) + (this.ep.values[i] / this.W2.value));
            const mg_part = - (this.Mg.values[i] * 100) / this.W2.value
            return p_part + mg_part;
        })
        
        return {
            values: sigma2P0_ELU,
            unit: 'kN/cm²'
        }
    }

    verification_sigma1P0({j}: {j: number}) {
        const sigma1P0 = this.calculateSigma1P0()
        const fck = this.concrete.fck.value
        const fckj = this.concrete.calculate_fckj(j).value // in MPa

        let max_compression_stress_magnitude: number; // Positive value
        if(fck <= 50) {
            max_compression_stress_magnitude = 0.7 * fckj
        } else { // fck > 50
            max_compression_stress_magnitude = 0.7 * (1 - ((fckj - 50)/200)) * fckj
        }

        // Convert MPa to kN/cm² (1 MPa = 0.1 kN/cm²) and make it negative for compression limit
        const compression_limit_kn_cm2 = -max_compression_stress_magnitude / 10;

        // A stress is valid if it's "greater" than the negative limit (e.g., -2.0 >= -2.5)
        return {
            passed: sigma1P0.values.every(sigma1P0_i => sigma1P0_i >= compression_limit_kn_cm2),
            limit: {
                value: compression_limit_kn_cm2,
                unit: 'kN/cm²'
            },
            values: {
                values: sigma1P0.values,
                unit: 'kN/cm²'
            }
        }
    }

    verification_sigma2P0({j}: {j: number}) {
        const sigma2P0 = this.calculateSigma2P0() //kN/cm²
        const maxsigma = this.concrete.calculate_fctj(j).value //MPa

        const tension_limit_kn_cm2 = maxsigma / 10;
        
        return {
            passed: sigma2P0.values.every(sigma2P0_i => sigma2P0_i <= tension_limit_kn_cm2),
            limit: {
                value: tension_limit_kn_cm2,
                unit: 'kN/cm²'
            },
            values: {
                values: sigma2P0.values,
                unit: 'kN/cm²'
            }
        }
            
    }
}

export default ELU;