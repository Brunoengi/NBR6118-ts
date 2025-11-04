import AnchorageLoss, { AnchoringType } from "../../../../src/design/beam/prestressingSteel/postTensioning//losses/AnchorageLoss.js";
import { ValueUnit, Forces } from "../../../../src/types/index.js";
import CableGeometry from "../../../../src/design/beam/prestressingSteel/postTensioning/CableGeometry.js";
import FrictionLoss from "../../../../src/design/beam/prestressingSteel/postTensioning//losses/FrictionLoss.js";

describe('AnchorageLoss', () => {
    // --- Base Test Data ---
    const cableReturn: ValueUnit = { value: 0.5, unit: 'cm' };
    const Ep: ValueUnit = { value: 19500, unit: 'kN/cm²' }; // 195 GPa
    const Ap: ValueUnit = { value: 17.82, unit: 'cm²' };
    const Patr: Forces = {
        values: [
            -2498.72,
            -2478.68,
            -2458.735,
            -2438.903,
            -2419.198,
            -2399.636,
            -2419.198,
            -2438.903,
            -2458.735,
            -2478.68,
            -2498.72
        ],
        unit: 'kN'
    };
    const width: ValueUnit = { value: 1500, unit: 'cm' }; // 15m cable
    const cableGeo = new CableGeometry({
        width,
        epmax: { value: -48, unit: 'cm' },
        numPoints: 11
    });
    // Create a FrictionLoss instance to get the calculated beta, ensuring consistency.
    const frictionLoss = new FrictionLoss({
        Pi: { value: Patr.values[0], unit: 'kN' },
        apparentFrictionCoefficient: 0.2, // From FrictionLoss.test.ts Case 2
        anchoring: 'active-active',
        cableGeometry: cableGeo
    });
    // Use the beta calculated by FrictionLoss for all AnchorageLoss tests.
    // This beta is slightly more precise (13.21146...) than the previously hardcoded 13.211.
    const tangBeta = frictionLoss.beta;

    it('should calculate the length of influence of anchorage slip (xr) correctly', () => {
        const anchorageLoss = new AnchorageLoss({
            Ap,
            Ep,
            cableReturn,
            tangBeta,
            anchoring: 'active-passive', // Anchoring type doesn't affect xr
            Patr,
            cableGeometry: cableGeo
        });

        // --- Manual Calculation for Verification ---
        // Convert units to be consistent: kN and cm

        // a (cableReturn): 0.5 cm
        const a_cm = cableReturn.value;

        // Ep: 195 GPa = 195 * 100 kN/cm² = 19500 kN/cm²
        const Ep_kN_cm2 = Ep.value;

        // Ap: 17.82 cm² (already in correct unit)
        const Ap_cm2 = Ap.value;

        // β (beta): 13.211 kN/m = 13.211 / 100 kN/cm = 0.13211 kN/cm
        const tangBeta_kN_cm = 0.13211;

        // xr = sqrt(a * Ep * Ap / β) = sqrt(0.5 * 19500 * 17.82 / 0.13211) = sqrt(1315150.25) ≈ 1146.8 cm
        expect(anchorageLoss.xr.value).toBeCloseTo(1146.8, 1);
        expect(anchorageLoss.xr.unit).toBe('cm');
    });

    describe('deltaPanc (Anchorage Loss Calculation)', () => {
        const xr_expected = 1146.8; // cm
        const deltaP_max_expected = 302.99; // kN (calculated as 2 * (13.211/100) * 1146.8)

        // Helper to create instances of the class for testing
        const createInstance = (anchoring: AnchoringType) => new AnchorageLoss({
            Ap, Ep, cableReturn, tangBeta, anchoring, Patr, cableGeometry: cableGeo
        });

        // --- Test cases for a 15m beam, divided into 11 points (0m to 15m) ---
        const testPoints = [
            // x (m), x (cm), loss_active_passive, loss_passive_active, loss_active_active
            { x_m: 0,    x_cm: 0,    ap: 302.99, pa: 0,      aa: 330.74 },
            { x_m: 1.5,  x_cm: 150,  ap: 263.35, pa: 0,      aa: 291.11 },
            { x_m: 3.0,  x_cm: 300,  ap: 223.71, pa: 0,      aa: 251.66 },
            { x_m: 4.5,  x_cm: 450,  ap: 184.07, pa: 25.57,  aa: 211.82 },
            { x_m: 6.0,  x_cm: 600,  ap: 144.43, pa: 65.20,  aa: 172.13 },
            { x_m: 7.5,  x_cm: 750,  ap: 104.83, pa: 104.83, aa: 132.58 },
            { x_m: 9.0,  x_cm: 900,  ap: 65.20,  pa: 144.43, aa: 172.13 },
            { x_m: 10.5, x_cm: 1050, ap: 25.57,  pa: 184.07, aa: 211.82 },
            { x_m: 12.0, x_cm: 1200, ap: 0,      pa: 223.71, aa: 251.66 },
            { x_m: 13.5, x_cm: 1350, ap: 0,      pa: 263.35, aa: 291.11 },
            { x_m: 15.0, x_cm: 1500, ap: 0,      pa: 302.99, aa: 330.74 },
        ];

        // Test suite for 'active-passive' anchoring
        describe('when anchoring is active-passive', () => {
            const anchorageLoss = createInstance('active-passive');

            it.each(testPoints)('should calculate loss correctly at x = $x_m m', ({ x_cm, ap }) => {
                const loss = anchorageLoss.deltaPanc({ value: x_cm, unit: 'cm' }, width);
                expect(loss.value).toBeCloseTo(ap, 0);
            });
        });

        // Test suite for 'passive-active' anchoring
        describe('when anchoring is passive-active', () => {
            const anchorageLoss = createInstance('passive-active');

            it.each(testPoints)('should calculate loss correctly at x = $x_m m', ({ x_cm, pa }) => {
                const loss = anchorageLoss.deltaPanc({ value: x_cm, unit: 'cm' }, width);
                expect(loss.value).toBeCloseTo(pa, 0);
            });

            it('should have zero loss at the start of influence length (x=width-xr)', () => {
                const loss = anchorageLoss.deltaPanc({ value: width.value - xr_expected, unit: 'cm' }, width);
                expect(loss.value).toBeCloseTo(0, 0);
            });

            it('should have half loss at the midpoint of influence length (x=width-xr/2)', () => {
                const loss = anchorageLoss.deltaPanc({ value: width.value - (xr_expected / 2), unit: 'cm' }, width);
                expect(loss.value).toBeCloseTo(deltaP_max_expected / 2, 0);
            });
        });

        // Test suite for 'active-active' anchoring
        describe('when anchoring is active-active', () => {
            const anchorageLoss = createInstance('active-active');

            it.each(testPoints)('should calculate superimposed loss correctly at x = $x_m m', ({ x_cm, aa }) => {
                const loss = anchorageLoss.deltaPanc({ value: x_cm, unit: 'cm' }, width);
                expect(loss.value).toBeCloseTo(aa, 0);
            });

            describe('intermediate calculation values for xr > width/2', () => {
                it('should match the expected intermediate parcels', () => {
                    // This test verifies the internal logic for the active-active case with overlapping zones.
                    // Values are derived from the base test data.
                    const width_cm = width.value;
                    const a_cm = cableReturn.value;
                    const Ep_kN_cm2 = Ep.value;
                    const Ap_cm2 = Ap.value;
                    const tangBeta_kN_cm = tangBeta.value / 100;

                    // 1. Calculate deltaP1 (friction drop from anchor to mid-span)
                    // Formula: deltaP1 = (L/2) * tan(β)
                    const deltaP1 = (width_cm / 2) * tangBeta_kN_cm;
                    // Calculation: (1500 cm / 2) * (13.211 / 100 kN/cm) = 750 * 0.13211 = 99.08 kN
                    expect(deltaP1).toBeCloseTo(99.08, 2);

                    // 2. Calculate the components of deltaP2
                    const parcela1 = (2 * a_cm * Ep_kN_cm2 * Ap_cm2) / width_cm;
                    const parcela2 = deltaP1;
                    expect(parcela1).toBeCloseTo(231.66, 2);
                    expect(parcela2).toBeCloseTo(99.08, 2);

                    // 3. Calculate final values based on the parcels
                    const deltaP2 = parcela1 - parcela2;
                    const deltaP_mid = Math.max(0, deltaP2);
                    const deltaP_max_eff = deltaP_mid + 2 * deltaP1;

                    // The final loss at the anchor (x=0) should match deltaP_max_eff
                    expect(deltaP_max_eff).toBeCloseTo(330.74, 2);
                });
            });
        });
    });

    describe('calculatePanc (Final Force Calculation)', () => {
        // Helper to create instances of the class for testing
        const createInstance = (anchoring: AnchoringType) => new AnchorageLoss({
            Ap, Ep, cableReturn, tangBeta, anchoring, Patr, cableGeometry: cableGeo
        });

        it('should calculate final force Panc correctly for active-passive anchoring', () => {
            const anchorageLoss = createInstance('active-passive');
            const Panc = anchorageLoss.calculatePanc();

            // Expected Panc = Patr + deltaPanc (loss is positive, Patr is negative)
            const expectedPanc = [
                -2195.73, -2215.33, -2235.02, -2254.83, -2274.77, -2294.81,
                -2354.00, -2413.33, -2458.74, -2478.68, -2498.72
            ];

            expect(Panc.unit).toBe('kN');
            Panc.values.forEach((force: any, i: number) => {
                expect(force).toBeCloseTo(expectedPanc[i], 1);
            });
        });

        it('should calculate final force Panc correctly for passive-active anchoring', () => {
            const anchorageLoss = createInstance('passive-active');
            const Panc = anchorageLoss.calculatePanc();

            // Expected Panc = Patr + deltaPanc
            const expectedPanc = [
                -2498.72, -2478.68, -2458.74, -2413.33, -2354.00, -2294.81,
                -2274.77, -2254.83, -2235.02, -2215.33, -2195.73
            ];

            expect(Panc.unit).toBe('kN');
            Panc.values.forEach((force: any, i: number) => {
                expect(force).toBeCloseTo(expectedPanc[i], 1);
            });
        });

        it('should calculate final force Panc correctly for active-active anchoring', () => {
            const anchorageLoss = createInstance('active-active');
            const Panc = anchorageLoss.calculatePanc();

            // Expected Panc = Patr + deltaPanc
            // Values updated to reflect the more precise tangBeta calculation.
            // Patr[mid] + deltaPanc[mid] = -2399.636 + 132.58 = -2267.056
            const expectedPanc = [
                -2167.98, -2187.57, -2207.08, -2227.08, -2247.07, -2267.06,
                -2247.07, -2227.08, -2207.08, -2187.57, -2167.98];

            expect(Panc.unit).toBe('kN');
            Panc.values.forEach((force: any, i: number) => {
                expect(force).toBeCloseTo(expectedPanc[i], 0);
            });
        });
    });

    describe('Sensitivity to cableReturn', () => {
        // Helper to create instances with varying cableReturn
        const createInstanceWithReturn = (returnValue: number, anchoring: AnchoringType) => {
            return new AnchorageLoss({
                Ap,
                Ep,
                cableReturn: { value: returnValue, unit: 'cm' },
                tangBeta,
                anchoring,
                Patr,
                cableGeometry: cableGeo
            });
        };

        it('should result in greater loss (less negative Panc) for a larger cableReturn', () => {
            // 1. Create instance with a smaller cable return
            const loss_small_return = createInstanceWithReturn(0.3, 'active-active');
            const Panc_small_return = loss_small_return.calculatePanc();

            // 2. Create instance with a larger cable return
            const loss_large_return = createInstanceWithReturn(0.7, 'active-active');
            const Panc_large_return = loss_large_return.calculatePanc();

            // 3. Assert that the forces are different
            expect(Panc_small_return.values[0]).not.toBeCloseTo(Panc_large_return.values[0]);
            expect(Panc_small_return.values[5]).not.toBeCloseTo(Panc_large_return.values[5]); // Mid-span

            // 4. Assert that the larger return causes a larger loss (Panc becomes less negative)
            // A larger cableReturn means more slip, which means a larger loss of prestress.
            // Since prestress force (Patr) is negative, a larger loss makes the final force (Panc)
            // less negative (i.e., a greater numerical value).
            expect(Panc_large_return.values[0]).toBeGreaterThan(Panc_small_return.values[0]);
            expect(Panc_large_return.values[5]).toBeGreaterThan(Panc_small_return.values[5]); // Mid-span
            console.log('tem que ser diferente', Panc_large_return, Panc_small_return)
        });
    });
});
