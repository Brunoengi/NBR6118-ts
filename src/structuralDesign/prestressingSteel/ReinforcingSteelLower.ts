import { ValueUnit, ValuesUnit } from "types/index.js";
import { CableGeometry } from "structuralDesign/prestressingSteel/CableGeometry.js";
import AbstractSection from "sections/AbstractSection.js";
import Concrete from "structuralElements/Concrete.js";
import { Distance } from "types/index.js";
import PrestressingSteel from "structuralElements/PrestressingSteel.js";
import { AbstractPrestressingSteelDesign } from "./PrestressingSteelEstimated.js";
import { Combinations } from "combinationLoads/Load.js";
import {GeometricPropsWithUnitsType} from "types/sectionsType.js";

class ReinforcingSteel {

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
    
    constructor({cableGeometry, combinations, section, concrete, prestressingSteel, prestressingDesign, dl, h, dpl}: {cableGeometry: CableGeometry, combinations: Combinations, section: AbstractSection, concrete: Concrete, prestressingSteel: PrestressingSteel, prestressingDesign: AbstractPrestressingSteelDesign, dl: Distance, h: Distance, dpl: Distance}) {
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

        // Get the maximum design moment (ELU) and convert from kN*m to kN*cm
        const Md_kNCm = this.combinations.last.moment.value * 100;

        return {
            value: (- fpyd_kNCm2 * Ap * (ds1 - dp)) - Md_kNCm,
            unit: 'kN*cm'
        }
    }

    calculate_lambdax ({x}: {x: Distance}): Distance {
        return {
            value: this.concrete.lambda * x.value,
            unit: x.unit
        }
    }

    calculate_props_rectangularDiagram({x}: {x: Distance}): GeometricPropsWithUnitsType {
        const lambdax = this.calculate_lambdax({x})
        const yLineValue = this.h.value - lambdax.value;
        const section = this.section.setProperties_upperHorizontaLine({points: this.section.points, yLine: {value: yLineValue, unit: x.unit}})

        return section

    }

    //Solver
    calculate_LN(): ValueUnit { // Retorna o valor da linha neutra
    const f = (x_number: number) => { // x_number é a profundidade da linha neutra em cm
        const x_distance: Distance = { value: x_number, unit: 'cm' };
        const props = this.calculate_props_rectangularDiagram({ x: x_distance });

        const area = props.A.value;
        const Yg = props.Yg.value;
        const maxStress_concrete = this.concrete.calculate_maxStress_rectangularDiagram().value; // kN/cm²
        const Fc = area * maxStress_concrete; // kN
        const moment_concrete = Fc * (Yg - this.dl.value); // kN*cm

        return moment_concrete + this.calculate_c().value;
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
}

export default ReinforcingSteel;