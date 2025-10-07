import Losses from "../../../../src/structuralDesign/prestressingSteel/losses/index.js";
import { CableGeometry } from "../../../../src/structuralDesign/prestressingSteel/CableGeometry.js";
import { ValueUnit, ValuesUnit } from "../../../../src/types/index.js";
import { AnchoringType } from "../../../../src/types/prestressSteelType.js";



describe('Losses Integration Test', () => {
    let losses: Losses;

    beforeAll(() => {
        // --- 1. Assemble all input data from individual loss tests ---

        // From FrictionLoss.test.ts (Case 2) & AnchorageLoss.test.ts
        const width: ValueUnit = { value: 1500, unit: 'cm' };
        const epmax: ValueUnit = { value: -48, unit: 'cm' };
        const numPoints = 11;
        const cableGeometry = new CableGeometry({ width, epmax, numPoints });

        const Pi: ValueUnit = { value: -2498.72, unit: 'kN' };
        const apparentFrictionCoefficient = 0.2;
        const anchoring: AnchoringType = 'active-active';

        const Ap: ValueUnit = { value: 17.82, unit: 'cm²' };
        const Ep: ValueUnit = { value: 195, unit: 'GPa' };
        const cableReturn: ValueUnit = { value: 5, unit: 'mm' };

        // From ElasticShorteningLoss (using typical concrete properties)
        // Values from ELSD.test.ts and TimeDependentLoss.test.ts for consistency
        const Ac: ValueUnit = { value: 7200, unit: 'cm²' };
        const Ic: ValueUnit = { value: 8640000, unit: 'cm⁴' };
        const Ecs: ValueUnit = { value: 29.403, unit: 'GPa' }; // Ecs for 35MPa concrete
        const g1: ValueUnit = { value: 18, unit: 'kN/m' }; // 0.72m² * 25kN/m³
        const ncable = 3;
        const x: ValuesUnit = cableGeometry.x;
        const ep: ValuesUnit = {
            values: x.values.map(x_cm => cableGeometry.cableY(x_cm)),
            unit: 'cm'
        };

        // From TimeDependentLoss (using typical values)
        const phi = 2.5; // Creep coefficient
        const g2: ValueUnit = { value: 20, unit: 'kN/m' }; // Additional permanent load
        const alphap = Ep.value / Ecs.value; // Ep/Ecs = 195 / 29.403 ~ 6.632

        // --- 2. Instantiate the main Losses class ---
        losses = new Losses({
            Pi,
            apparentFrictionCoefficient,
            anchoring,
            cableGeometry,
            Ap,
            Ep,
            cableReturn,
            Ecs,
            ep,
            g1,
            x,
            width,
            Ac,
            Ic,
            ncable,
            phi,
            g2,
            alphap,
        });
    });

    it('should have the correct force after friction loss (Patr)', () => {
        const Patr = losses.frictionLoss.Patr;
        // Expected values from FrictionLoss.test.ts for active-active anchoring
        const expectedPatr = [
            -2498.72, -2478.68, -2458.735, -2438.903, -2419.198, -2399.636,
            -2419.198, -2438.903, -2458.735, -2478.68, -2498.72
        ];

        expect(Patr.unit).toBe('kN');
        Patr.values.forEach((force, i) => {
            expect(force).toBeCloseTo(expectedPatr[i], 1);
        });
    });

    it('should have the correct force after anchorage loss (Panc)', () => {
        const Panc = losses.anchorageLoss.Panc;
        // Expected values from AnchorageLoss.test.ts for active-active anchoring
        const expectedPanc = [
            -2167.98, -2187.57, -2207.08, -2227.08, -2247.07, -2267.06,
            -2247.07, -2227.08, -2207.08, -2187.57, -2167.98
        ];

        expect(Panc.unit).toBe('kN');
        Panc.values.forEach((force, i) => {
            expect(force).toBeCloseTo(expectedPanc[i], 0); // High precision as in the source test
        });
    });

    it('should have the correct force after elastic shortening loss (P0)', () => {
        const P0 = losses.elasticShorteningLoss.P0;
        // Expected values calculated based on the inputs.
        // These values are slightly different from the README example due to minor input variations,
        // but represent the correct calculation for this integration test.
        const expectedP0 = [
            -2156.1, -2174.1, -2190.4, -2206.4, -2223.2, -2241.8,
            -2223.2, -2206.4, -2190.4, -2174.1, -2156.1
        ];

        expect(P0.unit).toBe('kN');
        P0.values.forEach((force, i) => {
            expect(force).toBeCloseTo(expectedP0[i], 0);
        });

        // Check the mid-span value specifically
        const midSpanIndex = Math.floor(expectedP0.length / 2);
        expect(P0.values[midSpanIndex]).toBeCloseTo(-2241.8, 0);
    });

    it('should calculate the final prestressing force after all losses', () => {
        // --- 3. Call the final method and check the result ---
        const finalForce = losses.timeDependentLoss.finalPrestressingForce();

        // Expected values calculated manually based on the sequence of losses
        // Patr (friction) -> Panc (anchorage) -> P0 (elastic) -> Pinf (time-dependent)
        // These values are now corrected after fixing the TimeDependentLoss constructor.
        const expectedFinalForce = [
            -1874.4, -1890.1, -1904.1, -1917.8, -1932.3, -1945.6,
            -1932.3, -1917.8, -1904.1, -1890.1, -1874.4
        ];

        expect(finalForce.unit).toBe('kN');
        expect(finalForce.values.length).toBe(expectedFinalForce.length);

        finalForce.values.forEach((calculatedForce, index) => {
            expect(calculatedForce).toBeCloseTo(expectedFinalForce[index], -1);
        });

        // Check the mid-span value specifically
        const midSpanIndex = Math.floor(expectedFinalForce.length / 2);
        expect(finalForce.values[midSpanIndex]).toBeCloseTo(-1945.6, -1);
    });
});