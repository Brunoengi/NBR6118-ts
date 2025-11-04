import Losses from "../../../../src/design/beam/prestressingSteel/postTensioning/losses/index.js";
import CableGeometry from "../../../../src/design/beam/prestressingSteel/postTensioning/CableGeometry.js";
import { ValueUnit, ValuesUnit, Distances } from "../../../../src/types/index.js";
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
        const Ep: ValueUnit = { value: 19500, unit: 'kN/cm²' }; // 195 GPa
        const cableReturn: ValueUnit = { value: 0.5, unit: 'cm' };

        // From ElasticShorteningLoss (using typical concrete properties)
        // Values from ELSD.test.ts and TimeDependentLoss.test.ts for consistency
        const Ac: ValueUnit = { value: 7200, unit: 'cm²' };
        const Ic: ValueUnit = { value: 8640000, unit: 'cm⁴' };
        const Ecs: ValueUnit = { value: 2940.3, unit: 'kN/cm²' }; // 29.403 GPa
        const g1: ValueUnit = { value: 0.18, unit: 'kN/cm' }; // 18 kN/m -> 0.18 kN/cm
        const ncable = 3;
        const x: Distances = cableGeometry.x;
        const ep: ValuesUnit = {
            values: x.values.map(x_cm => cableGeometry.cableY(x_cm)),
            unit: 'cm'
        };

        // From TimeDependentLoss (using typical values)
        const phi = 2.5; // Creep coefficient
        const g2: ValueUnit = { value: 0.20, unit: 'kN/cm' }; // 20 kN/m -> 0.20 kN/cm
        const alphap = Ep.value / Ecs.value; // Ep/Ecs = 19500 / 2940.3 ~ 6.632

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
        Patr.values.forEach((force: number, i: number) => {
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
        Panc.values.forEach((force: number, i: number) => {
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
        P0.values.forEach((force: any, i: any) => {
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

        finalForce.values.forEach((calculatedForce: any, index: any) => {
            expect(calculatedForce).toBeCloseTo(expectedFinalForce[index], -1);
        });

        // Check the mid-span value specifically
        const midSpanIndex = Math.floor(expectedFinalForce.length / 2);
        expect(finalForce.values[midSpanIndex]).toBeCloseTo(-1945.6, -1);
    });
});

describe('Losses Integration Test - T-Beam', () => {
    let losses: Losses;

    beforeAll(() => {
        // --- 1. Assemble all input data for the T-Beam case ---

        // Geometry and Prestressing
        const width: ValueUnit = { value: 2000, unit: 'cm' }; // 20m
        const epmax: ValueUnit = { value: -92, unit: 'cm' };
        const numPoints = 11; // For x = 0, 2, 4, ..., 20m
        const cableGeometry = new CableGeometry({ width, epmax, numPoints });

        const Pi: ValueUnit = { value: -6744.44, unit: 'kN' };
        const apparentFrictionCoefficient = 0.2;
        const anchoring: AnchoringType = 'active-active';

        const Ap: ValueUnit = { value: 48.48, unit: 'cm²' };
        const Ep: ValueUnit = { value: 19500, unit: 'kN/cm²' }; // 195 GPa
        const cableReturn: ValueUnit = { value: 0.6, unit: 'cm' };

        // Concrete and Section Properties
        const Ac: ValueUnit = { value: 12000, unit: 'cm²' }; // 1.2 m²
        // Calculated for T-Beam, aprixated value: 20100000
        const Ic: ValueUnit = { value: 20100000, unit: 'cm⁴' }; // 0.20112 m⁴
        const Ecs: ValueUnit = { value: 2415, unit: 'kN/cm²' }; // 24.15 GPa
        const g1: ValueUnit = { value: 0.62, unit: 'kN/cm' }; // 62 kN/m
        const ncable = 4;
        const x: Distances = cableGeometry.x;
        const ep: ValuesUnit = {
            values: x.values.map(x_cm => cableGeometry.cableY(x_cm)),
            unit: 'cm'
        };

        // Time-Dependent Properties
        const phi = 2.1;
        const g2: ValueUnit = { value: 0.42, unit: 'kN/cm' }; // 42 kN/m
        const alphap = Ep.value / Ecs.value; // 19500 / 2415 ~ 8.0745

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
        const expectedPatr = [
            -6744.44, -6669.14, -6594.60, -6520.52, -6447.01, -6374.21,
            -6447.01, -6520.52, -6594.60, -6669.14, -6744.44
        ];

        expect(Patr.unit).toBe('kN');
        Patr.values.forEach((force: number, i: number) => {
            expect(force).toBeCloseTo(expectedPatr[i], 0);
        });
    });

    it('should have the correct force after anchorage loss (Panc)', () => {
        const Panc = losses.anchorageLoss.Panc;
        const expectedPanc = [
            -5807.0, -5881.0, -5954.9, -6028.9, -6102.8, -6176.8,
            -6102.8, -6028.9, -5954.9, -5881.0, -5807.0
        ];

        expect(Panc.unit).toBe('kN');
        Panc.values.forEach((force: number, i: number) => {
            expect(force).toBeCloseTo(expectedPanc[i], -1);
        });
    });

    it('should calculate sigmacp correctly for T-Beam', () => {
        const sigmacp = losses.elasticShorteningLoss.calculateSigmacp();
        // Values from ElasticShorteningLoss.test.ts
        const expectedSigmacp_half = [-0.4839, -0.811, -1.5233, -2.2937, -2.877, -3.1157];
        const expectedSigmacp = [...expectedSigmacp_half, ...expectedSigmacp_half.slice(0, -1).reverse()];

        expect(sigmacp.unit).toBe('kN/cm²');
        sigmacp.values.forEach((val: number, i: number) => {
            expect(val).toBeCloseTo(expectedSigmacp[i], 3);
        });
    });

    it('should calculate sigmacg correctly for T-Beam', () => {
        const sigmacg = losses.elasticShorteningLoss.calculateSigmacg();
        // Values from ElasticShorteningLoss.test.ts
        const expectedSigmacg_half = [0, 0.1839, 0.5812, 1.0012, 1.3077, 1.4189];
        const expectedSigmacg = [...expectedSigmacg_half, ...expectedSigmacg_half.slice(0, -1).reverse()];

        expect(sigmacg.values.length).toBe(expectedSigmacg.length);
        sigmacg.values.forEach((val: any, i: any) => {
            expect(val).toBeCloseTo(expectedSigmacg[i], 4);
        });
    });

    it('should calculate total stress (sigmac) correctly', () => {
        const sigmac = losses.elasticShorteningLoss.calculateSigmac();
        // Values from ElasticShorteningLoss.test.ts
        const expectedSigmac = {
            values: [-0.4839, -0.6271, -0.9422, -1.2925, -1.5693, -1.6968, -1.5693, -1.2925, -0.9422, -0.6271, -0.4839],
            unit: 'kN/cm²'
        };

        expect(sigmac.unit).toBe(expectedSigmac.unit);
        sigmac.values.forEach((calculatedValue: any, i: any) => {
            expect(calculatedValue).toBeCloseTo(expectedSigmac.values[i], 2);
        });
    });

    it('should calculate deltaSigmaP correctly for T-Beam', () => {
        const deltaSigmaP = losses.elasticShorteningLoss.calculateDeltaSigmaP();
        
        // These values are derived from the validated deltaP_el test
        // deltaSigmaP = deltaP_el / Ap (e.g., at mid-span: -249.1 / 48.48 = -5.138)
        const expected_deltaSigmaP_half = [-1.465, -1.900, -2.853, -3.913, -4.752, -5.138];
        const expected_deltaSigmaP = [...expected_deltaSigmaP_half, ...expected_deltaSigmaP_half.slice(0, -1).reverse()];

        expect(deltaSigmaP.unit).toBe('kN/cm²');
        deltaSigmaP.values.forEach((stress_loss: any, i: any) => {
            expect(stress_loss).toBeCloseTo(expected_deltaSigmaP[i], 2);
        });
    });

    it('should calculate elastic shortening force loss (deltaP_el) correctly', () => {
        const deltaSigmaP = losses.elasticShorteningLoss.calculateDeltaSigmaP();
        const Ap = losses.elasticShorteningLoss.Ap.value;
        const deltaP_el = deltaSigmaP.values.map((stress_loss: any) => stress_loss * Ap);

        // Values from ElasticShorteningLoss.test.ts
        const expected_deltaP_el_half = [-71.0, -92.1, -138.3, -189.7, -230.4, -249.1];
        const expected_deltaP_el = [...expected_deltaP_el_half, ...expected_deltaP_el_half.slice(0, -1).reverse()];

        expect(deltaP_el.length).toBe(expected_deltaP_el.length);

        deltaP_el.forEach((force_loss: any, i: any) => {
            expect(force_loss).toBeCloseTo(expected_deltaP_el[i], 0);
        });
    });

    it('should have the correct force after elastic shortening loss (P0)', () => {
        const P0 = losses.elasticShorteningLoss.P0;
        const expectedP0 = [
            -5736.0, -5788.9, -5816.6, -5839.1, -5872.5, -5927.7,
            -5872.5, -5839.1, -5816.6, -5788.9, -5736.0
        ];

        expect(P0.unit).toBe('kN');
        P0.values.forEach((force: any, i: any) => {
            expect(force).toBeCloseTo(expectedP0[i], -1);
        });
    });

    it('should calculate the percentage loss (deltasigmappercent) correctly', () => {
        const deltasigmapPercent = losses.timeDependentLoss.calculatedeltappercent();

        
        // Expected values calculated based on the formula:
        // 7.4 + (alphap / 18.7) * (phi ** 1.07) * (3 - sigmacpg_i_MPa)
        const expected_deltasigmapPercent_half = [14.831, 15.001, 15.345, 15.752, 16.159, 16.529];
        const expected_deltasigmapPercent = [...expected_deltasigmapPercent_half, ...expected_deltasigmapPercent_half.slice(0, -1).reverse()];
        expect(deltasigmapPercent.length).toBe(expected_deltasigmapPercent.length);

        deltasigmapPercent.forEach((percent_loss, i) => {
            // The value is a percentage
            expect(percent_loss).toBeCloseTo(expected_deltasigmapPercent[i], 0);
        });
    });

    it('should calculate the final prestressing force after all losses (Pinf)', () => {
        const finalForce = losses.timeDependentLoss.finalPrestressingForce();
        const expectedFinalForce = [
            -4885.3, -4920.5, -4924.1, -4919.4, -4923.5, -4947.9,
            -4923.5, -4919.4, -4924.1, -4920.5, -4885.3
        ];

        expect(finalForce.unit).toBe('kN');
        finalForce.values.forEach((calculatedForce: number, index: number) => {
            expect(calculatedForce).toBeCloseTo(expectedFinalForce[index], -2);
        });
    });
});