import PrestressingSteel from "../../structuralElements/PrestressingSteel.js";
import { IGeometricProperties } from "types/combinationsType.js";
import { ValueUnit } from "types/index.js"; 
import { Combinations } from "combinationLoads/Load.js";
import Concrete from "../../structuralElements/Concrete.js";
import { PrestressingDesignType } from "types/prestressSteelType.js";


interface IPrestressingSteelDesign {
    prestressingSteel: PrestressingSteel
    geometricProperties: IGeometricProperties
    lossFactor: number
    type: PrestressingDesignType
    epmax: ValueUnit
    combinations: Combinations
    concrete: Concrete
    ncable: number
}

abstract class AbstractPrestressingSteelDesign implements IPrestressingSteelDesign {
    public prestressingSteel: PrestressingSteel
    public geometricProperties: IGeometricProperties
    public lossFactor: number
    public epmax: ValueUnit
    public combinations: Combinations
    public concrete: Concrete
    public ncable: number;
    abstract readonly type: PrestressingDesignType
    

    constructor(options: IPrestressingSteelDesign) {
        if (options.lossFactor < 0 || options.lossFactor >= 1) {
            throw new Error(`Invalid lossFactor: ${options.lossFactor}. Must be in the range [0, 1).`);
        }

        this.prestressingSteel = options.prestressingSteel;
        this.geometricProperties = options.geometricProperties;
        this.lossFactor = options.lossFactor;
        this.epmax = options.epmax;
        this.combinations = options.combinations;
        this.concrete = options.concrete;
        this.ncable = options.ncable;
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
     * Estimates the required prestressing steel area.
     * Ap = -P_initial / sigma_pi
     */
    public get Apestimated(): ValueUnit {
        const p_initial_kN = this.P_initial_calc.value;
        const sigma_pi_MPa = this.prestressingSteel.sigma_pi.value;

        // Ap (cm²) = - Force (kN) / Stress (MPa) * 10
        // The conversion factor from (kN / MPa) to cm² is 10. (1 MPa = 0.1 kN/cm²)
        const area_cm2 = -p_initial_kN / sigma_pi_MPa * 10;

        return {
            value: area_cm2,
            unit: 'cm²'
        };
    }

    /**
     * Estimates the required number of prestressing steel cords.
     * n_cord = Ap_estimated / A_p_min_cordage
     */
    public get ncordestimated(): number {
        const apEstimated_cm2 = this.Apestimated.value;
        const areaMinCordage_cm2 = this.prestressingSteel.area_min_cordage.value;

        // The number of cords is the estimated area divided by the area of a single cord.
        return apEstimated_cm2 / areaMinCordage_cm2;
    }

    /**
     * Calculates the number of cords per cable, rounded up to the nearest integer.
     * n_cord_cable = ceil(n_cord_estimated / n_cable)
     */
    public get ncordagecable(): number {
        return Math.ceil(this.ncordestimated / this.ncable);
    }

    /**
     * Calculates the projected prestressing steel area based on the chosen number of cables and cords per cable.
     * Ap_proj = n_cable * n_cordage_cable * A_p_min_cordage
     */
    public get Ap_proj(): ValueUnit {
        const totalCords = this.ncable * this.ncordagecable;
        const areaMinCordage_cm2 = this.prestressingSteel.area_min_cordage.value;

        return {
            value: totalCords * areaMinCordage_cm2,
            unit: 'cm²'
        };
    }

    /**
     * Calculates the initial prestressing force based on the projected area of steel.
     * P_initial_proj = - Ap_proj * sigma_pi / 10
     */
    public get P_initial_proj(): ValueUnit {
        const apProj_cm2 = this.Ap_proj.value;
        const sigma_pi_MPa = this.prestressingSteel.sigma_pi.value;

        // Force (kN) = - Area (cm²) * Stress (MPa) / 10 (conversion factor)
        return {
            value: -apProj_cm2 * sigma_pi_MPa / 10,
            unit: 'kN'
        };
    }

    /**
     * Calculates the final prestressing force based on the projected initial force and loss factor.
     * P_inf_proj = P_initial_proj * (1 - lossFactor)
     */
    public get P_inf_proj(): ValueUnit {
        return {
            value: this.P_initial_proj.value * (1 - this.lossFactor),
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

        const numerator = this.combinations.quasiPermanent.moment.value; // kN * m

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
        const mf_kNm = this.combinations.frequent.moment.value;
        const fctf_kPa = this.concrete.fctf.value * 10000; // kN/cm² to kPa (kN/m²)
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

        const numerator = this.combinations.frequent.moment.value // kN * m
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
        const mr_kNm = this.combinations.rare.moment.value;
        const fctf_kPa = this.concrete.fctf.value * 10000; // kN/cm² to kPa (kN/m²)
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