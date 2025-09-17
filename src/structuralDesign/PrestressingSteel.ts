import PrestressingSteel from "buildingElements/PrestressingSteel.js";
import { IGeometricProperties } from "types/combinationsType.js";
import { ValueUnit } from "types/index.js"; 
import { Combinations } from "combinations/Load.js";
import Concrete from "buildingElements/Concrete.js";


interface IPrestressingSteelDesign {
    prestressingSteel: PrestressingSteel
    geometricProperties: IGeometricProperties
    lossFactor: number
    type: 'Complete' | 'Limited'
    epmax: ValueUnit
    combinations: Combinations
    concrete: Concrete
}

abstract class AbstractPrestressingSteelDesign implements IPrestressingSteelDesign {
    public prestressingSteel: PrestressingSteel
    public geometricProperties: IGeometricProperties
    public lossFactor: number
    public epmax: ValueUnit
    public combinations: Combinations
    public concrete: Concrete
    abstract readonly type: 'Complete' | 'Limited';
    

    constructor(options: IPrestressingSteelDesign) {
        this.prestressingSteel = options.prestressingSteel;
        this.geometricProperties = options.geometricProperties;
        this.lossFactor = options.lossFactor;
        this.epmax = options.epmax;
        this.combinations = options.combinations;
        this.concrete = options.concrete;
    }

    /**
     * Calculates the final required prestressing force.
     * It returns the value (from ELS-D or ELS-F) that has the largest absolute magnitude, preserving its original sign.
     */
    public get P_inf_calc(): ValueUnit {
        const elsd = this.ELSD();
        const elsf = this.ELSF();

        const value = Math.abs(elsd.value) > Math.abs(elsf.value) ? elsd.value : elsf.value;

        return {
            value: value,
            unit: 'kN'
        };
    }

        /**
     * Calculates the initial prestressing force, considering the losses.
     * P_initial = P_inf / (1 - lossFactor)
     */
    public get P_initial_calc(): ValueUnit {
        const p_inf = this.P_inf_calc.value;
        const initialValue = p_inf / (1 - this.lossFactor);

        return {
            value: initialValue,
            unit: 'kN'
        };
    }

    /**
     * Calculates the required prestressing force for the Serviceability Limit State of Decompression (ELS-D).
     */

    /**
     * Calculates the required prestressing force for the Serviceability Limit State of Decompression (ELS-D).
     */
    abstract ELSD(): ValueUnit;
    
    /**
     * Calculates the required prestressing force for the Serviceability Limit State of Crack Formation (ELS-F).
     */
    abstract ELSF(): ValueUnit;
}

class LimitedPrestressingSteelDesign extends AbstractPrestressingSteelDesign {
    readonly type = 'Limited';

    ELSD(): ValueUnit {
        const { Ac, W1 } = this.geometricProperties;
        const epmax = this.epmax;

        const numerator = this.combinations.quasiPermanent.mqp.value; // kN * m

        const denominator = ((1 / Ac.value) + (epmax.value / W1.value)) * W1.value;
        const denominatorSI = denominator / 100

        return {
            value: numerator / denominatorSI,
            unit: 'KN'
        }
    }

    ELSF(): ValueUnit {
        const { Ac, W1 } = this.geometricProperties;
        const epmax = this.epmax;

        // --- Convert all units to a consistent system (kN, m) ---
        const mf_kNm = this.combinations.frequent.mf.value;
        const fctf_kPa = this.concrete.fctf.value * 1000; // MPa to kPa (kN/m²)
        const W1_m3 = W1.value / 1e6; // cm³ to m³
        const Ac_m2 = Ac.value / 1e4; // cm² to m²
        const epmax_m = epmax.value / 100; // cm to m

        // Numerator represents stress in kN/m²
        const numerator_stress = (mf_kNm / W1_m3) + fctf_kPa;

        // Denominator represents a geometric factor in 1/m²
        const denominator_geom = (1 / Ac_m2) + (epmax_m / W1_m3);

        // The result is the required prestressing force in kN
        return {
            value: numerator_stress / denominator_geom,
            unit: 'kN'
        }
    }
}

class CompletePrestressingSteelDesign extends AbstractPrestressingSteelDesign {
    readonly type = 'Complete';

    ELSD(): ValueUnit {
        const { Ac, W1 } = this.geometricProperties;
        const epmax = this.epmax;

        const numerator = this.combinations.frequent.mf.value // kN * m
        const denominator = ((1 / Ac.value) + (epmax.value / W1.value)) * W1.value
        const denominatorSI = denominator / 100

        return {
            value: numerator / denominatorSI,
            unit: 'KN'
        }
    }

    ELSF(): ValueUnit {
        const { Ac, W1 } = this.geometricProperties;
        const epmax = this.epmax;
        
        // --- Convert all units to a consistent system (kN, m) ---
        const mr_kNm = this.combinations.rare.mr.value;
        const fctf_kPa = this.concrete.fctf.value * 1000; // MPa to kPa (kN/m²)
        const W1_m3 = W1.value / 1e6; // cm³ to m³
        const Ac_m2 = Ac.value / 1e4; // cm² to m²
        const epmax_m = epmax.value / 100; // cm to m

        // Numerator represents stress in kN/m²
        const numerator_stress = (mr_kNm / W1_m3) + fctf_kPa;

        // Denominator represents a geometric factor in 1/m²
        const denominator_geom = (1 / Ac_m2) + (epmax_m / W1_m3);
        
        return {
            value: numerator_stress / denominator_geom,
            unit: 'kN'
        }
    }
}

/**
 * Interface for the PrestressingDesign factory class constructor.
 */
interface IPrestressingDesignFactory {
    new (options: IPrestressingSteelDesign): AbstractPrestressingSteelDesign;
}

/**
 * Factory class to create the appropriate prestressing design instance.
 * Using `new PrestressingDesign(options)` will return an instance of either
 * `LimitedPrestressingSteelDesign` or `CompletePrestressingSteelDesign`.
 * @param options - The design options, including the type ('Limited' or 'Complete').
 */
const PrestressingDesign: IPrestressingDesignFactory = class {
    constructor(options: IPrestressingSteelDesign) {
    switch (options.type) {
        case 'Limited':
            return new LimitedPrestressingSteelDesign(options);
        case 'Complete':
            return new CompletePrestressingSteelDesign(options);
        default:
            throw new Error(`Invalid prestressing design type: ${(options as any).type}`);
    }
}} as IPrestressingDesignFactory;

export default PrestressingDesign;
export { AbstractPrestressingSteelDesign, LimitedPrestressingSteelDesign, CompletePrestressingSteelDesign };