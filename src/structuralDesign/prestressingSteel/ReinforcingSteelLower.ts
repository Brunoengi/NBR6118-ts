import { ValueUnit, ValuesUnit, Distance, VerificationOneValue } from "types/index.js";
import  CableGeometry from "structuralDesign/prestressingSteel/CableGeometry.js";
import AbstractSection from "sections/AbstractSection.js";
import Concrete from "structuralElements/Concrete.js";
import PrestressingSteel from "structuralElements/PrestressingSteel.js";
import { AbstractPrestressingSteelDesign } from "./PrestressingSteelEstimated.js";
import { Combinations } from "combinationLoads/Load.js";
import {GeometricPropsWithUnitsType, GeometricPropsWithoutPerimeterType} from "types/sectionsType.js";
import Steel from "structuralElements/Steel.js";
import {A} from "types/sectionsType.js";


class ReinforcingSteelAs {

    public readonly concrete: Concrete;
    public readonly section: AbstractSection;
    public readonly prestressingSteel: PrestressingSteel;
    public readonly prestressingDesign: AbstractPrestressingSteelDesign;
    public readonly ds1: Distance
    public readonly dp: Distance
    public readonly combinations: Combinations
    public readonly cableGeometry: CableGeometry
    public readonly dl: Distance    
    public readonly h: Distance // Adicionado 'h' como propriedade da classe
    public readonly steel: Steel
    public readonly LN: Distance
    public readonly Rcd: ValueUnit
    public readonly distanceRcdToAs: Distance
    public readonly asEstimated: A
    public readonly asMin: A
    public readonly asEffective: A
    
    constructor({cableGeometry, combinations, section, concrete, prestressingSteel, steel, prestressingDesign, dl, h, dpl}: {cableGeometry: CableGeometry, combinations: Combinations, section: AbstractSection, concrete: Concrete, prestressingSteel: PrestressingSteel, prestressingDesign: AbstractPrestressingSteelDesign, dl: Distance, h: Distance, dpl: Distance, steel: Steel}) {
        this.concrete = concrete;
        this.section = section;
        this.prestressingDesign = prestressingDesign
        this.ds1 = this.calculate_ds1({h, dl})
        this.dp = this.calculate_dp({h, dpl})
        this.dl = dl
        this.h = h // Inicializa 'h'
        this.combinations = combinations // Inicializa 'combinations'
        this.cableGeometry = cableGeometry // Inicializa 'cableGeometry'
        this.prestressingSteel = prestressingSteel // Inicializa 'prestressingSteel'
        this.steel = steel
        this.LN = this.calculate_LN()

        const concreteForces = this.calculateConcreteCompressionResultants({ x: this.LN });
        this.Rcd = concreteForces.Rcd;
        this.distanceRcdToAs = concreteForces.distanceRcdToAs;

        this.asEstimated = this.calculate_Asestimated()
        const bf = this.section.inputs.bf || this.section.inputs.base
        this.asMin = this.minimumSteel({bf})
        this.asEffective = this.minimumSteel({bf})
    }

    calculate_ds1({h, dl}: {h: Distance, dl: Distance}): Distance {
        return {
            value: h.value - dl.value,
            unit: h.unit
        }
    }

    calculate_dp({h, dpl}: {h: Distance, dpl: Distance}): Distance {
        return {
            value: h.value - dpl.value,
            unit: h.unit
        }
    } 

    calculate_c() {
        // Convert fpyd from MPa to kN/cm² (1 MPa = 0.1 kN/cm²)
        const fpyd_kNCm2 = this.prestressingSteel.fpyd.value / 10;
        const Ap = this.prestressingDesign.Ap_proj.value
        const ds1 = this.ds1.value
        const dp = this.dp.value

        // Get the maximum design moment (ELU) in kN*cm
        const Md_kNCm = this.combinations.last.moment.value;
        return {
            value: (-fpyd_kNCm2 * Ap * (ds1 - dp)) - Md_kNCm,
            unit: 'kN*cm'
        }
    }

    calculate_lambdax ({x}: {x: Distance}): Distance {
        return {
            value: this.concrete.lambda * x.value,
            unit: x.unit
        }
    }

    calculate_props_rectangularDiagram({x}: {x: Distance}): GeometricPropsWithoutPerimeterType {
        const lambdax = this.calculate_lambdax({x})
        const yLineValue = this.h.value - lambdax.value;
        const section = this.section.setProperties_upperHorizontaLine({points: this.section.points, yLine: {value: yLineValue, unit: x.unit}})

        return section

    }

    calculateConcreteCompressionResultants({x}: {x: Distance}): { Rcd: ValueUnit, distanceRcdToAs: Distance, moment_concrete: ValueUnit } {
        const props = this.calculate_props_rectangularDiagram({ x });

        const area = props.A.value;
        const Yg = props.Yg.value;
        const maxStress_concrete = this.concrete.calculate_maxStress_rectangularDiagram().value; // kN/cm²
        
        const Rcd_value = area * maxStress_concrete; // kN
        const distanceRcdToAs_value = (Yg - this.dl.value);
        const moment_concrete_value = Rcd_value * distanceRcdToAs_value; // kN*cm

        return {
            Rcd: { value: Rcd_value, unit: 'kN' },
            distanceRcdToAs: { value: distanceRcdToAs_value, unit: 'cm' },
            moment_concrete: { value: moment_concrete_value, unit: 'kN*cm' }
        };
    }

    //Solver
    calculate_LN(): Distance { // Retorna o valor da linha neutra
    const f = (x_number: number) => { // x_number é a profundidade da linha neutra em cm
        const { moment_concrete } = this.calculateConcreteCompressionResultants({ x: { value: x_number, unit: 'cm' } });
        return moment_concrete.value + this.calculate_c().value;
    };

        // --- Bisection Method with robust interval finding ---
        function bisection(f: (x: number) => number, initial_x1: number, initial_x2: number, tol = 1e-7, maxIter = 100): number {
            let x1 = initial_x1;
            let x2 = initial_x2;
            let y1 = f(x1);
            let y2 = f(x2);

            // If f(x1) and f(x2) have the same sign, search for a valid interval
            if (y1 * y2 > 0) {
                let found = false;
                // 1. Search for a root within the initial interval [x1, x2]
                const n_steps = 20;
                const step = (x2 - x1) / n_steps;
                let last_y = y1;
                for (let i = 1; i <= n_steps; i++) {
                    const current_x = x1 + i * step;
                    const current_y = f(current_x);
                    if (last_y * current_y < 0) {
                        x2 = current_x; // New, smaller upper bound
                        y2 = current_y;
                        x1 = current_x - step; // New, smaller lower bound
                        y1 = last_y;
                        found = true;
                        break;
                    }
                    last_y = current_y;
                }

                // 2. If not found, expand the interval outwards
                if (!found) {
                    for (let i = 0; i < 10; i++) {
                        x2 *= 2;
                        y2 = f(x2);
                        if (y1 * y2 < 0) break;
                    }
                }
            }

            if (y1 * y2 > 0) throw new Error("Não foi possível encontrar um intervalo que contenha a raiz da linha neutra.");

            for (let i = 0; i < maxIter; i++) {
                const xm = (x1 + x2) / 2;
                const ym = f(xm);
                if (Math.abs(ym) < tol) return xm;
                if (y1 * ym < 0) { x2 = xm; y2 = ym; } 
                else { x1 = xm; y1 = ym; }
            }
            return (x1 + x2) / 2;
        }

        const solution = bisection(f, 0.001, this.h.value);

        return { value: solution, unit: 'cm' };
    }

    calculate_xlim(): number {
        return this.concrete.fck.value <= 5 ? 0.45 : 0.35
    }

    verification_LN() : VerificationOneValue {
        const ln = this.LN
        const xlim = this.calculate_xlim()
        const ds1 = this.ds1.value
    
        return {
            passed: ln.value < xlim * ds1,
            limit: { value: xlim * ds1, unit: 'cm' },
            value: ln
        }
    }

    calculate_Asestimated(): A {
        // Convert fpyd from MPa to kN/cm² by dividing by 10
        const fpyd_kNCm2 = this.prestressingSteel.fpyd.value / 10
        const Ap = this.prestressingDesign.Ap_proj.value
        const  fyd = this.steel.fyd.value

        return {
            value: (this.Rcd.value - fpyd_kNCm2 * Ap) / fyd,
            unit: 'cm²'
        }
    }

    calculate_Mdmin(): ValueUnit {
        const fctk_sup = this.concrete.fctk_sup.value
        const W1 = this.section.props.W1.value

        return {
            value: Math.abs(0.8 * W1 * fctk_sup),
            unit: 'kN*cm'
        }
    }

    calculate_mi({bf}: {bf: Distance}): number {
        const Mdmin = this.calculate_Mdmin().value
        const criticalSection = bf.value
        return Mdmin / (criticalSection * this.ds1.value * this.ds1.value * this.concrete.sigmacd.value)
    }

    calculate_Asmin_from_bending({bf}: {bf: Distance}): A {
        const mi = this.calculate_mi({bf})
        const criticalSection = bf.value
        const qsi = 1.25 * (1 - Math.sqrt(1 - 2 * mi))
        const Asmin_estimated = this.concrete.lambda * qsi * criticalSection * this.ds1.value * (this.concrete.sigmacd.value / this.steel.fyd.value)
        return { value: Asmin_estimated, unit: 'cm²' }
    }

    minimumSteel({bf}: {bf: Distance}): A  {
        const Ac = this.section.props.A.value
        const Asmin_estimated = this.calculate_Asmin_from_bending({bf}).value
        return {
            value: Math.max(Asmin_estimated, Ac * 0.15/100),
            unit: 'cm²'
        }
    }    
}

export default ReinforcingSteelAs;
export type ReinforcingSteelAsType = InstanceType<typeof ReinforcingSteelAs>