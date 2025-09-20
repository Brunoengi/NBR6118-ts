import PrestressingSteelLosses, {AnchoringType} from "../../src/structuralDesign/PrestressingSteel/Losses.js";
import { ValueUnit } from "../../src/types/index.js";

describe('Prestressing Steel Losses - Case 1', () => {
    let losses: PrestressingSteelLosses;
    const width: ValueUnit = { value: 2500, unit: 'cm' }; // 25m
    const epmax: ValueUnit = { value: -48, unit: 'cm' };
    const Pi: ValueUnit = { value: -2000, unit: 'kN' };
    const apparentFrictionCoefficient = 0.3;
    const anchoring: AnchoringType = 'active-passive';

    beforeEach(() => {
        losses = new PrestressingSteelLosses({
            width,
            numSections: 10,
            epmax,
            Pi,
            apparentFrictionCoefficient: apparentFrictionCoefficient,
            anchoring
        });
    });

    it('should initialize correctly and calculate unintended curvature loss', () => {
        expect(losses.width).toEqual(width);
        expect(losses.epmax).toEqual(epmax);
        expect(losses.Pi).toEqual(Pi);
        expect(losses.apparentFrictionCoefficient).toBe(apparentFrictionCoefficient);
        
        // k = k_param * nu = 0.01 * 0.3
        expect(losses.k.value).toBeCloseTo(0.003);
        expect(losses.k.unit).toBe('1/m');

        // beta = (P(L) - P(0)) / L
        // P(25) = -1772.08; P(0) = -2000; L = 25
        // beta = (-1772.08 - (-2000)) / 25 = 9.1168
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

    describe('subdivideSan', () => {
        it('should subdivide the span into the correct number of points', () => {
            const spanWidth: ValueUnit = { value: 20, unit: 'm' };
            const result = losses.subdivideSan(spanWidth, 4);
            expect(result.values).toEqual([0, 5, 10, 15, 20]);
            expect(result.unit).toBe('m');
        });

        it('should handle floating point steps', () => {
            const spanWidth: ValueUnit = { value: 10, unit: 'm' };
            const result = losses.subdivideSan(spanWidth, 3);
            expect(result.values.length).toBe(4);
            expect(result.values[0]).toBeCloseTo(0);
            expect(result.values[1]).toBeCloseTo(3.333333);
            expect(result.values[2]).toBeCloseTo(6.666667);
            expect(result.values[3]).toBeCloseTo(10);
        });

        it('should throw an error for zero or negative spans', () => {
            const spanWidth: ValueUnit = { value: 10, unit: 'm' };
            expect(() => losses.subdivideSan(spanWidth, 0)).toThrow("The number of partitions must be greater than zero.");
            expect(() => losses.subdivideSan(spanWidth, -1)).toThrow("The number of partitions must be greater than zero.");
        });
    });

    describe('Cable Geometry Calculations', () => {
        // Using L = 2500 cm, e = -48 cm
        it('should calculate cable path y(x) correctly', () => {
            expect(losses.cableY(0)).toBeCloseTo(0);
            // y(1250) = -(4 * -48 / 2500^2) * 1250^2 + (4 * -48 / 2500) * 1250 = 48 - 96 = -48
            expect(losses.cableY(1250)).toBeCloseTo(-48);
            // y(2500) = -(4 * -48 / 2500^2) * 2500^2 + (4 * -48 / 2500) * 2500 = 192 - 192 = 0
            expect(losses.cableY(2500)).toBeCloseTo(0);
        });

        it('should calculate cable slope y\'(x) correctly', () => {
            // y'(x) = -(8 * e / L^2) * x + (4 * e / L)
            // y'(0) = 4 * -48 / 2500 = -0.0768
            expect(losses.cableSlope(0)).toBeCloseTo(-0.0768);
            // y'(1250) = -(8 * -48 / 2500^2) * 1250 + (4 * -48 / 2500) = 0.0768 - 0.0768 = 0
            expect(losses.cableSlope(1250)).toBeCloseTo(0);
            // y'(2500) = -(8 * -48 / 2500^2) * 2500 + (4 * -48 / 2500) = 0.1536 - 0.0768 = 0.0768
            expect(losses.cableSlope(2500)).toBeCloseTo(0.0768);
        });

        it('should calculate cable angle α(x) correctly', () => {
            // α(x) = -atan(y'(x))
            // α(0) = -atan(-0.0768)
            expect(losses.cableAngle(0)).toBeCloseTo(0.07666);
            // α(1250) = -atan(0)
            expect(losses.cableAngle(1250)).toBeCloseTo(0);
            // α(2500) = -atan(0.0768)
            expect(losses.cableAngle(2500)).toBeCloseTo(-0.07666);
        });

        it('should calculate angle deviation Σα correctly', () => {
            const alpha1 = 0.5;
            const alphaI = 0.2;
            expect(losses.angleDeviation(alpha1, alphaI)).toBe(0.3);
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

describe('Prestressing Steel Losses - Case 2 (Anchoring Active-Active)', () => {
    let losses: PrestressingSteelLosses;
    const width: ValueUnit = { value: 1500, unit: 'cm' }; // 15m
    const epmax: ValueUnit = { value: -48, unit: 'cm' };
    const Pi: ValueUnit = { value: -2498.72, unit: 'kN' };
    const apparentFrictionCoefficient = 0.2;
    const anchoring: AnchoringType = 'active-active';

    beforeEach(() => {
        losses = new PrestressingSteelLosses({
            width,
            numSections: 11,
            epmax,
            Pi,
            apparentFrictionCoefficient: apparentFrictionCoefficient,
            anchoring
        });
    });

    it('should have the correct anchoring type', () => {
        expect(losses.anchoring).toBe('active-active');

        // beta = (P(L/2) - P(0)) / (L/2)
        // beta = (-2399.636 - (-2498.72)) / 7.5 = 13.21
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

describe('Prestressing Steel Losses - Case 2 (Anchorgin Active-Passive)', () => {
    let losses: PrestressingSteelLosses;
    const width: ValueUnit = { value: 1500, unit: 'cm' }; // 15m
    const epmax: ValueUnit = { value: -48, unit: 'cm' };
    const Pi: ValueUnit = { value: -2498.72, unit: 'kN' };
    const apparentFrictionCoefficient = 0.2;
    const anchoring: AnchoringType = 'active-passive';

    beforeEach(() => {
        losses = new PrestressingSteelLosses({
            width,
            numSections: 11,
            epmax,
            Pi,
            apparentFrictionCoefficient: apparentFrictionCoefficient,
            anchoring
        });
    });

    it('should initialize correctly and calculate unintended curvature loss', () => {
        expect(losses.width).toEqual(width);
        expect(losses.epmax).toEqual(epmax);
        expect(losses.Pi).toEqual(Pi);
        expect(losses.apparentFrictionCoefficient).toBe(apparentFrictionCoefficient);
        
        // k = k_param * nu = 0.01 * 0.2
        expect(losses.k.value).toBeCloseTo(0.002);
        expect(losses.k.unit).toBe('1/m');

        // beta = (P(L) - P(0)) / L
        // beta = (-2304.48 - (-2498.72)) / 15 = 12.95
        expect(losses.beta.value).toBeCloseTo(12.95, 2);
        expect(losses.beta.unit).toBe('kN/m');
    });

    describe('Cable Geometry Calculations', () => {
        // Using L = 1500 cm, e = -48 cm
        it('should calculate cable path y(x) correctly', () => {
            expect(losses.cableY(0)).toBeCloseTo(0);
            // y(750) = -(4 * -48 / 1500^2) * 750^2 + (4 * -48 / 1500) * 750 = 48 - 96 = -48
            expect(losses.cableY(750)).toBeCloseTo(-48);
            // y(1500) = -(4 * -48 / 1500^2) * 1500^2 + (4 * -48 / 1500) * 1500 = 192 - 192 = 0
            expect(losses.cableY(1500)).toBeCloseTo(0);
        });

        it('should calculate cable slope y\'(x) correctly', () => {
            // y'(x) = -(8 * e / L^2) * x + (4 * e / L)
            // y'(0) = 4 * -48 / 1500 = -0.128
            expect(losses.cableSlope(0)).toBeCloseTo(-0.128);
            // y'(750) = -(8 * -48 / 1500^2) * 750 + (4 * -48 / 1500) = 0.128 - 0.128 = 0
            expect(losses.cableSlope(750)).toBeCloseTo(0);
        });

        it('should calculate cable angle α(x) correctly', () => {
            // α(x) = -atan(y'(x))
            // α(0) = -atan(-0.128)
            expect(losses.cableAngle(0)).toBeCloseTo(0.1272);
            // α(750) = -atan(0)
            expect(losses.cableAngle(750)).toBeCloseTo(0);
        });
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
