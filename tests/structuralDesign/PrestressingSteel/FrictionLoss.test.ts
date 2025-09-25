import FrictionLoss, {AnchoringType} from "../../../src/structuralDesign/PrestressingSteel/Losses/FrictionLoss.js";
import { CableGeometry } from "../../../src/structuralDesign/PrestressingSteel/CableGeometry.js";
import { ValueUnit } from "../../../src/types/index.js";

describe('FrictionLoss - Case 1', () => {
    let losses: FrictionLoss;
    let cableGeo: CableGeometry;
    const width: ValueUnit = { value: 2500, unit: 'cm' }; // 25m
    const epmax: ValueUnit = { value: -48, unit: 'cm' };
    const Pi: ValueUnit = { value: -2000, unit: 'kN' };
    const apparentFrictionCoefficient = 0.3;
    const anchoring: AnchoringType = 'active-passive';

    beforeAll(() => {
        cableGeo = new CableGeometry({ width, epmax, numPoints: 11 });
        losses = new FrictionLoss({
            Pi,
            apparentFrictionCoefficient: apparentFrictionCoefficient,
            anchoring,
            cableGeometry: cableGeo
        });
    });

    it('should initialize correctly and calculate unintended curvature loss', () => {
        expect(losses.cableGeometry.width).toEqual(width);
        expect(losses.cableGeometry.epmax).toEqual(epmax);
        expect(losses.Pi).toEqual(Pi);
        expect(losses.apparentFrictionCoefficient).toBe(apparentFrictionCoefficient);
        
        // k = k_param * nu = 0.01 * 0.3
        expect(losses.k.value).toBeCloseTo(0.003);
        expect(losses.k.unit).toBe('1/m');

        // beta = (P(L) - P(0)) / L
        // P(25) = -1772.08; P(0) = -2000; L = 25
        // beta = abs(-1772.08 - (-2000)) / 25 = 9.1168
        expect(losses.beta.value).toBeCloseTo(9.117, 2);
        expect(losses.beta.unit).toBe('kN/m');
    });

    describe('unintendedCurvatureLossPerMeter', () => {
        it('should calculate loss with default k parameter', () => {
            const result = losses.unintendedCurvatureLossPerMeter(0.3);
            expect(result.value).toBeCloseTo(0.003);
            expect(result.unit).toBe('1/m');
        });

        it('should calculate loss with a custom k parameter', () => {
            const result = losses.unintendedCurvatureLossPerMeter(0.3, 0.005);
            expect(result.value).toBeCloseTo(0.0015);
            expect(result.unit).toBe('1/m');
        });
    });

    describe('frictionPrestressLoss', () => {
        it('should calculate the prestress force after friction loss', () => {
            const x = 12.5; // Position in meters

            // P_atr = -2000 * e^{-(0.3 * 0.07666 + 0.003 * 12.5)}
            // P_atr = -2000 * e^{-(0.022998 + 0.0375)}
            // P_atr = -2000 * e^{-0.060498} = -2000 * 0.9413
            const expectedForce = -1882.60;
            const result = losses.frictionPrestressLoss(x);
            expect(result).toBeCloseTo(expectedForce, 1);
        });
    });
});

describe('FrictionLoss - Case 2 (Anchoring Active-Active)', () => {
    let losses: FrictionLoss;
    let cableGeo: CableGeometry;
    const width: ValueUnit = { value: 1500, unit: 'cm' }; // 15m
    const epmax: ValueUnit = { value: -48, unit: 'cm' };
    const Pi: ValueUnit = { value: -2498.72, unit: 'kN' };
    const apparentFrictionCoefficient = 0.2;
    const anchoring: AnchoringType = 'active-active';

    beforeAll(() => {
        cableGeo = new CableGeometry({ width, epmax, numPoints: 11 });
        losses = new FrictionLoss({
            Pi,
            apparentFrictionCoefficient: apparentFrictionCoefficient,
            anchoring,
            cableGeometry: cableGeo
        });
    });

    it('should have the correct anchoring type', () => {
        expect(losses.anchoring).toBe('active-active');

        // beta = (P(L/2) - P(0)) / (L/2)
        // beta = abs(-2399.636 - (-2498.72)) / 7.5 = 13.21
        expect(losses.beta.value).toBeCloseTo(13.21, 2);
        expect(losses.beta.unit).toBe('kN/m');
    });

    describe('friction Prestress Loss with Active-Active Anchoring', () => {
        // For active-active, the force at any point is the maximum of the forces
        // calculated from each end. This results in a symmetric loss profile.
        const testCases = [
            // x (m), expectedForce (kN)
            { x: 0,    expected: -2498.72 }, // Force at anchor is Pi
            { x: 1.5,  expected: -2478.68 },
            { x: 3.0,  expected: -2458.735 },
            { x: 4.5,  expected: -2438.903 },
            { x: 6.0,  expected: -2419.198 },
            { x: 7.5,  expected: -2399.636 }, // Mid-span, lowest force (max loss)
            { x: 9.0,  expected: -2419.198 }, // Symmetric to 6.0m
            { x: 10.5, expected: -2438.903 }, // Symmetric to 4.5m
            { x: 12.0, expected: -2458.735 }, // Symmetric to 3.0m
            { x: 13.5, expected: -2478.68 }, // Symmetric to 1.5m
            { x: 15.0, expected: -2498.72 }  // Force at anchor is Pi
        ];

        it.each(testCases)('should calculate symmetric prestress force correctly at x = $x m', ({ x, expected }) => {
            const result = losses.frictionPrestressLoss(x);
            expect(result).toBeCloseTo(expected, 1);
        });
    });
});

describe('FrictionLoss - Case 3 (Anchoring Active-Passive)', () => {
    let losses: FrictionLoss;
    let cableGeo: CableGeometry;
    const width: ValueUnit = { value: 1500, unit: 'cm' }; // 15m
    const epmax: ValueUnit = { value: -48, unit: 'cm' };
    const Pi: ValueUnit = { value: -2498.72, unit: 'kN' };
    const apparentFrictionCoefficient = 0.2;
    const anchoring: AnchoringType = 'active-passive';

    beforeAll(() => {
        cableGeo = new CableGeometry({ width, epmax, numPoints: 11 });
        losses = new FrictionLoss({
            Pi,
            apparentFrictionCoefficient: apparentFrictionCoefficient,
            anchoring,
            cableGeometry: cableGeo
        });
    });

    it('should initialize correctly and calculate unintended curvature loss', () => {
        expect(losses.cableGeometry.width).toEqual(width);
        expect(losses.cableGeometry.epmax).toEqual(epmax);
        expect(losses.Pi).toEqual(Pi);
        expect(losses.apparentFrictionCoefficient).toBe(apparentFrictionCoefficient);
        
        // k = k_param * nu = 0.01 * 0.2
        expect(losses.k.value).toBeCloseTo(0.002);
        expect(losses.k.unit).toBe('1/m');

        // beta = (P(L) - P(0)) / L
        // beta = abs(-2304.48 - (-2498.72)) / 15 = 12.95
        expect(losses.beta.value).toBeCloseTo(12.95, 2);
        expect(losses.beta.unit).toBe('kN/m');
    });

        describe('friction Prestress Loss', () => {
        const testCases = [
            // x (m), expectedForce (kN)
            { x: 0,    expected: -2498.72 },
            { x: 1.5,  expected: -2478.68 },
            { x: 3.0,  expected: -2458.735 },
            { x: 4.5,  expected: -2438.903 },
            { x: 6.0,  expected: -2419.198 },
            { x: 7.5,  expected: -2399.636 },
            { x: 9.0,  expected: -2380.23 },
            { x: 10.5, expected: -2361.00 },
            { x: 12.0, expected: -2341.96 },
            { x: 13.5, expected: -2323.11 },
            { x: 15.0, expected: -2304.48 }
        ];

        it.each(testCases)('should calculate prestress force correctly at x = $x m', ({ x, expected }) => {
            const result = losses.frictionPrestressLoss(x);
            expect(result).toBeCloseTo(expected, 1);
        });
    });
});
