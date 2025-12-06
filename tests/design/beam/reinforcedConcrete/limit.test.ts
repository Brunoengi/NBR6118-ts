import { describe, it, expect } from '@jest/globals';
import ReducedLimitingMoment from '../../../../src/design/beam/reinforcedConcrete/steel/MuLimit.js';
import Concrete from '../../../../src/utils/elements/concrete/Concrete.js';

describe('Reduced Limiting Moment', () => {
    const testCases = [
        { fck: 4.0, expectedXi: 0.45, expectedLambda: 0.8, expectedMuLimit: 0.2952 }, // fck <= 50MPa
        { fck: 5.0, expectedXi: 0.45, expectedLambda: 0.8, expectedMuLimit: 0.2952 }, // fck <= 50MPa
        { fck: 5.5, expectedXi: 0.35, expectedLambda: 0.7875, expectedMuLimit: 0.2376 }, // fck > 50MPa
        { fck: 6.0, expectedXi: 0.35, expectedLambda: 0.775, expectedMuLimit: 0.2345 }, // fck > 50MPa
        { fck: 6.5, expectedXi: 0.35, expectedLambda: 0.7625, expectedMuLimit: 0.2313 }, // fck > 50MPa
        { fck: 7.0, expectedXi: 0.35, expectedLambda: 0.75, expectedMuLimit: 0.2280 }, // fck > 50MPa
        { fck: 7.5, expectedXi: 0.35, expectedLambda: 0.7375, expectedMuLimit: 0.2248 }, // fck > 50MPa
        { fck: 8.0, expectedXi: 0.35, expectedLambda: 0.725, expectedMuLimit: 0.2216 }, // fck > 50MPa
        { fck: 9.0, expectedXi: 0.35, expectedLambda: 0.7, expectedMuLimit: 0.2150 }, // fck > 50MPa
    ];

    testCases.forEach(({ fck, expectedXi, expectedLambda, expectedMuLimit }) => {
        it(`should calculate mu_limit correctly for fck = ${fck} kN/cm²`, () => {
            // Arrange
            const concrete = new Concrete({
                fck: { value: fck, unit: 'kN/cm²' },
                aggregate: 'granite'
            });

            // Act
            const reducedLimitingMoment = new ReducedLimitingMoment({ concrete });
            const mu_limit = reducedLimitingMoment.mu_limit;

            // Assert
            expect(mu_limit.value).toBeCloseTo(expectedMuLimit, 4);
            expect(mu_limit.unit).toBe('adimensional');
        });
    });

    it('should have correct constructor parameters', () => {
        const concrete = new Concrete({
            fck: { value: 4.0, unit: 'kN/cm²' },
            aggregate: 'granite'
        });

        // This is more of a check on the class implementation, as the constructor signature was a bit ambiguous.
        // The constructor should only need 'concrete'.
        const createInstance = () => new ReducedLimitingMoment({ concrete });
        expect(createInstance).not.toThrow();

        const instance = createInstance();
        expect(instance.mu_limit).toBeDefined();
    });
});