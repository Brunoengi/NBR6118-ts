import { describe, it, expect } from '@jest/globals';
import RelativeNeutralLineLimit from '../../../../src/design/beam/reinforcedConcrete/steel/XiLimit.js';
import { Stress } from '../../../../src/types/index.js';

describe('RelativeNeutralLineLimit', () => {
    const testCases = [
        { fck: 2.0, expectedXi: 0.45 },
        { fck: 2.5, expectedXi: 0.45 },
        { fck: 3.0, expectedXi: 0.45 },
        { fck: 3.5, expectedXi: 0.45 },
        { fck: 4.0, expectedXi: 0.45 },
        { fck: 4.5, expectedXi: 0.45 },
        { fck: 5.0, expectedXi: 0.45 }, // Boundary condition for fck <= 5
        { fck: 5.5, expectedXi: 0.35 }, // Boundary condition for fck > 5
        { fck: 6.0, expectedXi: 0.35 },
        { fck: 7.0, expectedXi: 0.35 },
        { fck: 8.0, expectedXi: 0.35 },
        { fck: 9.0, expectedXi: 0.35 },
    ];

    testCases.forEach(({ fck, expectedXi }) => {
        it(`should calculate xi_limit as ${expectedXi} for fck = ${fck} kN/cm²`, () => {
            // Arrange
            const fckStress: Stress = { value: fck, unit: 'kN/cm²' };

            // Act
            const relativeNeutralLineLimit = new RelativeNeutralLineLimit({ fck: fckStress });
            const xi_limit = relativeNeutralLineLimit.xi_limit;

            // Assert
            expect(xi_limit.value).toBe(expectedXi);
            expect(xi_limit.unit).toBe('adimensional');
        });
    });
});