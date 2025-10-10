import timeDependentLoss from "../../../../src/structuralDesign/prestressingSteel/losses/TimeDependentLoss.js";
import { ValueUnit, ValuesUnit } from "../../../../src/types/index.js";

describe('TimeDependentLoss', () => {

    // --- Input Data based on similar tests ---
    const width: ValueUnit = { value: 1500, unit: 'cm' }; // 15m
    const numSections = 10; // To get 11 points from 0 to 15m

    // Generate x points from 0 to 15m
    const x_values_m = Array.from({ length: numSections + 1 }, (_, i) => (width.value / 100) * i / numSections);
    const x_values_cm = x_values_m.map(x => x * 100);

    // Generate parabolic eccentricity ep(x)
    const epmax_cm = -48;
    const ep_values_cm = x_values_cm.map(x_i => {
        const L = width.value;
        // Parabolic formula: y(x) = -(4*e/L^2)*x^2 + (4*e/L)*x
        return (-(4 * epmax_cm) / (L ** 2)) * (x_i ** 2) + ((4 * epmax_cm) / L) * x_i;
    });

    // P0 values (force after immediate losses)
    const p0_half = [-2156.117, -2174.280, -2190.570, -2206.547, -2223.403, -2241.92]; // Updated to match ElasticShorteningLoss output
    const p0_full = [...p0_half, ...p0_half.slice(0, -1).reverse()]; // Full array for 11 points
    const alphap = 6.632; // Consistent with ElasticShorteningLoss.test.ts

    let timeLoss: timeDependentLoss;

    beforeAll(() => {
        timeLoss = new timeDependentLoss({
            phi: 2.5,
            g1: { value: 18, unit: 'kN/m' },
            g2: { value: 20, unit: 'kN/m' },
            Ac: { value: 7200, unit: 'cm²' },
            Ic: { value: 8640000, unit: 'cm⁴' },
            width: width,
            x: { values: x_values_cm, unit: 'cm' },
            ep: { values: ep_values_cm, unit: 'cm' },
            P0: { values: p0_full, unit: 'kN' },
            alphap: alphap,
            Mg1: { values: [], unit: '' },
            Mg2: { values: [], unit: '' },
            sigmacpg: { value: 0, unit: '' },
            deltasigmap: { value: 0, unit: '' },
        } as any); // Use 'as any' to match constructor signature
    });

    it('should be instantiated correctly with the new phi value', () => {
        expect(timeLoss).toBeInstanceOf(timeDependentLoss);
        expect(timeLoss.phi).toBe(2.5);
    });

    it('should still calculate bending moments correctly as they do not depend on phi', () => {
        const mg1 = timeLoss.Mg1;
        const mg2 = timeLoss.Mg2;
        // Values are now in kN*cm
        const expected_mg1_mid_kNcm = 50625;
        const expected_mg2_mid_kNcm = 56250;

        expect(mg1.values[5]).toBeCloseTo(expected_mg1_mid_kNcm, 2);
        expect(mg2.values[5]).toBeCloseTo(expected_mg2_mid_kNcm, 2);
    });

    it('should still calculate sigmacpg correctly as it does not depend on phi', () => {
        const sigmacpg = timeLoss.calculateSigmacpg();
        // Manual calculation from the other test case
        const P0_mid = p0_full[5];
        const ep_mid = -48;
        const Ac = 7200;
        const Ic = 8640000;
        // Moments are now in kN*cm
        const Mg1_mid_kNcm = 50625;
        const Mg2_mid_kNcm = 56250;

        const part1 = P0_mid * ((1 / Ac) + (ep_mid ** 2 / Ic));
        // The conversion `* 100` is no longer needed as moments are already in kN*cm
        const total_Mg_kNcm = Mg1_mid_kNcm + Mg2_mid_kNcm;
        const part2 = -total_Mg_kNcm * ep_mid / Ic;
        const expected_sigmacpg_mid = part1 + part2;
        expect(sigmacpg.values[5]).toBeCloseTo(expected_sigmacpg_mid, 4);
    });

    describe('calculatedeltappercent', () => {
        it('should calculate the percentage loss correctly with the new phi value', () => {
            const deltaPPercent = timeLoss.calculatedeltappercent();
            const sigmacpg_MPa_mid = -0.3155 * 10; // -3.155 MPa
            const phi = 2.5;
            const expected_loss_percent_mid = 7.4 + (alphap / 18.7) * (phi ** 1.07) * (3 - sigmacpg_MPa_mid); // ~13.218
            expect(deltaPPercent[5]).toBeCloseTo(13.218, 3);
        });
    });

    describe('finalPrestressingForce', () => {
        it('should calculate the final prestressing force with the new phi value', () => {
            const finalForce = timeLoss.finalPrestressingForce();

            // --- Manual Calculation for Verification at mid-span (index 5) ---
            const p0_mid = p0_full[5]; // -2241.92 kN
            const loss_percent_mid = 13.218; // From calculatedeltappercent test
            const expected_final_force_mid = p0_mid * (1 - loss_percent_mid / 100); // ~1945.57 kN

            expect(finalForce.values[5]).toBeCloseTo(expected_final_force_mid, 1);
            expect(finalForce.unit).toBe('kN');
        });
    });
});
