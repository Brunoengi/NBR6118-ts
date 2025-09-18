import PrestressingSteelLosses from "../../src/structuralDesign/PrestressingSteel/Losses.js";
import { ValueUnit } from "../../src/types/index.js";

describe('PrestressingSteelLosses', () => {
    let losses: PrestressingSteelLosses;
    const width: ValueUnit = { value: 2500, unit: 'cm' }; // 25m
    const epmax: ValueUnit = { value: -48, unit: 'cm' };
    const Pi: ValueUnit = { value: -2000, unit: 'kN' };
    const apparentFrictionCoefficient = 0.3;

    beforeEach(() => {
        losses = new PrestressingSteelLosses({
            width,
            numSections: 10,
            epmax,
            Pi,
            apparentFrictionCoefficient: apparentFrictionCoefficient
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
            // y(1250) = (4 * -48 / 2500^2) * 1250^2 + (4 * -48 / 2500) * 1250 = -48 - 96 = -144
            expect(losses.cableY(1250)).toBeCloseTo(-144);
            // y(2500) = (4 * -48 / 2500^2) * 2500^2 + (4 * -48 / 2500) * 2500 = -192 - 192 = -384
            expect(losses.cableY(2500)).toBeCloseTo(-384);
        });

        it('should calculate cable slope y\'(x) correctly', () => {
            // y'(x) = (8 * e / L^2) * x + (4 * e / L)
            // y'(0) = 4 * -48 / 2500 = -0.0768
            expect(losses.cableSlope(0)).toBeCloseTo(-0.0768);
            // y'(1250) = (8 * -48 / 2500^2) * 1250 + (4 * -48 / 2500) = -0.0768 - 0.0768 = -0.1536
            expect(losses.cableSlope(1250)).toBeCloseTo(-0.1536);
            // y'(2500) = (8 * -48 / 2500^2) * 2500 + (4 * -48 / 2500) = -0.1536 - 0.0768 = -0.2304
            expect(losses.cableSlope(2500)).toBeCloseTo(-0.2304);
        });

        it('should calculate cable angle α(x) correctly', () => {
            // α(x) = -atan(y'(x))
            // α(0) = -atan(-0.0768)
            expect(losses.cableAngle(0)).toBeCloseTo(0.07666);
            // α(1250) = -atan(-0.1536)
            expect(losses.cableAngle(1250)).toBeCloseTo(0.15242);
            // α(2500) = -atan(-0.2304)
            expect(losses.cableAngle(2500)).toBeCloseTo(0.22629);
        });

        it('should calculate angle deviation Σα correctly', () => {
            const alpha1 = 0.5;
            const alphaI = 0.2;
            expect(losses.angleDeviation(alpha1, alphaI)).toBe(0.3);
        });
    });

    describe('frictionPrestressLoss', () => {
        it('should calculate the prestress force after friction loss', () => {
            const mu = 0.19; // Friction coefficient
            const k = 0.003; // Unintended curvature loss per meter
            const x = 12.5; // Position in meters

            // At x = 12.5m (1250cm), mid-span
            const alpha_0 = losses.cableAngle(0); // Angle at start
            const alpha_mid = losses.cableAngle(1250); // Angle at mid-span
            const sumAlpha = losses.angleDeviation(alpha_0, alpha_mid);

            // P_atr = P_i * e^{-(μ Σα + k x)}
            // P_atr = -2000 * e^{-(0.19 * (0.07666 - 0.15242) + 0.003 * 12.5)}
            // P_atr = -2000 * e^{-(0.19 * -0.07576 + 0.0375)}
            // P_atr = -2000 * e^{-(-0.01439 + 0.0375)}
            // P_atr = -2000 * e^{-0.02311} = -2000 * 0.97715
            const expectedForce = -1954.31;

            const result = losses.frictionPrestressLoss(mu, sumAlpha, k, x);
            expect(result).toBeCloseTo(expectedForce, 1);
        });
    });
});
