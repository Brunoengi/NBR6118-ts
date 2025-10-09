import { ElasticShorteningLoss, ValueUnit, Distances } from "../../../../src/index.js";

describe('ElasticShorteningLoss', () => {
    let elasticLoss: ElasticShorteningLoss;

    // --- Input Data based on user request ---
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

    // Panc values for the full symmetric beam
    const panc_half = [-2167.976, -2187.793, -2207.61, -2227.427, -2247.244, -2267.06];
    const panc_full = [...panc_half, ...panc_half.slice(0, -1).reverse()];

    const x: Distances = { values: x_values_cm, unit: 'cm' };


    beforeAll(() => {
        elasticLoss = new ElasticShorteningLoss({
            Ecs: { value: 29.403, unit: 'GPa' },
            Ep: { value: 195, unit: 'GPa' }, // Standard value from other tests
            ep: { values: ep_values_cm, unit: 'cm' },
            g1: { value: 18, unit: 'kN/m' },
            Ac: { value: 7200, unit: 'cm²' },
            Ic: { value: 8640000, unit: 'cm⁴' },
            width: width,
            x: x,
            Panc: { values: panc_full, unit: 'kN' },
            Ap: { value: 17.82, unit: 'cm²' },
            // sigmacp and sigmacg are not needed for these calculations
            ncable: 3
        });
    });

    it('should be instantiated correctly', () => {
        expect(elasticLoss).toBeInstanceOf(ElasticShorteningLoss);
        expect(elasticLoss.Panc.values.length).toBe(11);
        expect(elasticLoss.ep.values.length).toBe(11);
    });

    describe('calculateMg', () => {
        it('should calculate the bending moment due to self-weight correctly', () => {
            const mg = elasticLoss.calculateMg();
            
            // --- Manual Calculation for Verification ---
            // Formula: Mg(x) = (g1 * L * x / 2) - (g1 * x^2 / 2)
            // Units: g1 (kN/cm), L (cm), x (cm) -> Mg (kN*cm)
            const g1_kN_cm = 18 / 100;
            const L_cm = 1500;

            // At x = 0m (start)
            expect(mg.values[0]).toBeCloseTo(0, 2);

            // At x = 7.5m (mid-span)
            const x_mid_cm = 750;
            const expected_mg_mid = (g1_kN_cm * L_cm * x_mid_cm / 2) - (g1_kN_cm * x_mid_cm**2 / 2); // 50625 kN*cm
            expect(mg.values[5]).toBeCloseTo(expected_mg_mid, 2);

            // At x = 15m (end)
            expect(mg.values[10]).toBeCloseTo(0, 2);
        });
    });

    describe('calculateAlphap', () => {
        it('should calculate the modular ratio correctly', () => {
            const alphap = elasticLoss.calculateAlphap();
            // αp = Ep / Ecs = 195 / 29.403
            expect(alphap).toBeCloseTo(6.632, 3);
        });
    });

    describe('calculateSigmacp', () => {
        it('should calculate the stress in concrete at the cable level correctly', () => {
            const sigmacp = elasticLoss.calculateSigmacp();

            // Log the object to the console for inspection
            //console.log('Calculated values to sigmacp:', sigmacp);

            // --- Manual Calculation for Verification ---
            // Formula: σ_cp(x) = Panc(x) * (1/Ac + ep(x)² / Ic) (Panc is negative for compression)
            // Units: Panc (kN), Ac (cm²), ep (cm), Ic (cm⁴) -> σ_cp (kN/cm²)
            const Ac = 7200;
            const Ic = 8640000;

            // At x = 0 cm
            const panc_0 = -2167.976;
            const ep_0 = 0;
            const expected_sigmacp_0 = panc_0 * (1 / Ac + ep_0**2 / Ic); // -0.3011 kN/cm²
            expect(sigmacp.values[0]).toBeCloseTo(expected_sigmacp_0, 4);

            // At x = 750 cm (mid-span)
            const panc_mid = -2267.06;
            const ep_mid = -48;
            const expected_sigmacp_mid = panc_mid * (1 / Ac + ep_mid**2 / Ic); // -0.9194 kN/cm²
            expect(sigmacp.values[5]).toBeCloseTo(expected_sigmacp_mid, 4);

            // At x = 1500 cm (end)
            const panc_end = -2167.976;
            const ep_end = 0;
            const expected_sigmacp_end = panc_end * (1 / Ac + ep_end**2 / Ic); // -0.3011 kN/cm²
            expect(sigmacp.values[10]).toBeCloseTo(expected_sigmacp_end, 4);
        });
    });

    describe('calculateSigmacg', () => {
        it('should calculate the stress in concrete due to self-weight correctly', () => {
            const sigmacg = elasticLoss.calculateSigmacg();
            //console.log(sigmacg)

            // --- Manual Calculation for Verification ---
            // Formula: σ_cg = Mg(x) * ep(x) / Ic
            // Units: Mg (kN*m), ep (cm), Ic (cm⁴) -> σ_cg (kN/cm²)
            const Ic = 8640000;

            // At x = 0 cm (start)
            // Mg(0) = 0, ep(0) = 0 -> σ_cg(0) = 0
            expect(sigmacg.values[0]).toBeCloseTo(0, 4);

            // At x = 750 cm (mid-span)
            const mg_mid_kNm = 506.25; // From calculateMg test
            const mg_mid_kNcm = mg_mid_kNm * 100;
            const ep_mid = -48;
            const expected_sigmacg_mid = -(mg_mid_kNcm * ep_mid) / Ic; // -(50625 * -48) / 8640000 = 0.28125 kN/cm²
            expect(sigmacg.values[5]).toBeCloseTo(expected_sigmacg_mid, 4);

            // At x = 1500 cm (end)
            // Mg(1500) = 0, ep(1500) = 0 -> σ_cg(1500) = 0
            expect(sigmacg.values[10]).toBeCloseTo(0, 4);
        });
    });

    describe('calculateSigmac', () => {
        it('should calculate the total stress by summing sigmacp and sigmacg', () => {
            const sigmac = elasticLoss.calculateSigmac();
            //console.log(sigmac)

            // --- Manual Calculation for Verification ---
            // Values are the sum of the expected values from sigmacp and sigmacg tests.

            // At x = 0 cm (start)
            // sigmac(0) = sigmacp(0) + sigmacg(0) = -0.3011 + 0 = -0.3011
            expect(sigmac.values[0]).toBeCloseTo(-0.3011, 4);

            // At x = 750 cm (mid-span)
            // sigmac(mid) = sigmacp(mid) + sigmacg(mid) = -0.9194 + 0.28125 = -0.63815
            expect(sigmac.values[5]).toBeCloseTo(-0.6382, 4);

            // At x = 1500 cm (end)
            // sigmac(end) = sigmacp(end) + sigmacg(end) = -0.3011 + 0 = -0.3011
            expect(sigmac.values[10]).toBeCloseTo(-0.3011, 4);
        });
    });

    describe('calculateDeltaSigmaP', () => {
        it('should calculate the prestress loss due to elastic shortening correctly', () => {
            const deltaSigmaP = elasticLoss.calculateDeltaSigmaP();

            // --- Manual Calculation for Verification ---
            // Formula: Δσ_p = αp * σ_c * (n-1)/(2n)
            const alphap = 6.632; // From calculateAlphap test
            const ncable = 3;
            const sequentialFactor = (ncable - 1) / (2 * ncable); // (3-1)/(2*3) = 1/3

            // At x = 0 cm (start)
            const sigmac_0 = -0.3011; // From calculateSigmac test (now correctly negative)
            const expected_deltaSigmaP_0 = alphap * sigmac_0 * sequentialFactor;
            // Expected: 6.632 * -0.3011 * (1/3) ≈ -0.6656
            expect(deltaSigmaP.values[0]).toBeCloseTo(expected_deltaSigmaP_0, 4);

            // At x = 750 cm (mid-span)
            const sigmac_mid = -0.63815; // From calculateSigmac test
            const expected_deltaSigmaP_mid = alphap * sigmac_mid * sequentialFactor;
            // Expected: 6.632 * -0.63815 * (1/3) ≈ -1.4107
            expect(deltaSigmaP.values[5]).toBeCloseTo(expected_deltaSigmaP_mid, 4);

            // At x = 1500 cm (end)
            const sigmac_end = -0.3011; // From calculateSigmac test
            const expected_deltaSigmaP_end = alphap * sigmac_end * sequentialFactor;
            expect(deltaSigmaP.values[10]).toBeCloseTo(expected_deltaSigmaP_end, 4);
        });
    });

    describe('calculateP0', () => {
        it('should calculate the final prestressing force after elastic shortening loss', () => {
            const p0 = elasticLoss.calculateP0();
            //console.log(p0)
            /*
            Expected values: [
              -2156.1141784511788,
              -2174.2800804709227,
              -2190.5704516339397,
              -2206.5471277860474,
              -2223.402791516337,
              -2241.920017845118,
              -2223.402791516337,
              -2206.5471277860474,
              -2190.5704516339397,
              -2174.2800804709227,
              -2156.1141784511788
            ]
            */

            // --- Manual Calculation for Verification ---
            // Formula: P0 = Panc - (Δσ_p * Ap)
            // Panc is negative (compressive force). Δσ_p is negative (reduction in steel tension, or increase in steel compression).
            // So, ΔP_enc = Δσ_p * Ap will be negative.
            // P0 = Panc - (negative value) = Panc + (positive value).
            // This means P0 will be less negative (smaller magnitude of compressive force) than Panc, representing a loss.

            // At x = 0 cm (start)
            // Panc_0 = -2167.976
            // ΔP_enc(0) = Δσ_p(0) * Ap = -0.6656 * 17.82 = -11.859 kN
            // P0(0) = Panc(0) - ΔP_enc(0) = -2167.976 - (-11.859) = -2156.117 kN
            const expected_p0_0 = -2156.114;
            expect(p0.values[0]).toBeCloseTo(expected_p0_0, 2);

            // At x = 750 cm (mid-span)
            // Panc(mid) = -2267.06
            // ΔP_enc(mid) = Δσ_p(mid) * Ap = -1.4107 * 17.82 = -25.139 kN
            // P0(mid) = Panc(mid) - ΔP_enc(mid) = -2267.06 - (-25.139) = -2241.921 kN
            expect(p0.values[5]).toBeCloseTo(-2241.92, 2);

            // At x = 1500 cm (end)
            const expected_p0_end = expected_p0_0; // Symmetric
            expect(p0.values[10]).toBeCloseTo(expected_p0_end, 2);
        });
    });
});

describe('ElasticShorteningLoss - T-Beam', () => {
    let elasticLoss: ElasticShorteningLoss;

    // --- Input Data for T-Beam case ---
    const width: ValueUnit = { value: 2000, unit: 'cm' }; // 20m
    const numSections = 10; // To get 11 points from 0 to 20m

    // Generate x points from 0 to 20m
    const x_values_cm = Array.from({ length: numSections + 1 }, (_, i) => (width.value) * i / numSections);

    // Generate parabolic eccentricity ep(x)
    const epmax_cm = -92;
    const ep_values_cm = x_values_cm.map(x_i => {
        const L = width.value;
        // Parabolic formula: y(x) = -(4*e/L^2)*x^2 + (4*e/L)*x
        return (-(4 * epmax_cm) / (L ** 2)) * (x_i ** 2) + ((4 * epmax_cm) / L) * x_i;
    });

    // Panc values for the full symmetric beam
    const panc_half = [-5806.995, -5880.953, -5954.91, -6028.868, -6102.826, -6176.784];
    const panc_full = [...panc_half, ...panc_half.slice(0, -1).reverse()];

    const x: Distances = { values: x_values_cm, unit: 'cm' };

    beforeAll(() => {
        elasticLoss = new ElasticShorteningLoss({
            Ecs: { value: 24.15, unit: 'GPa' }, // For fck = 25 MPa
            Ep: { value: 195, unit: 'GPa' },
            ep: { values: ep_values_cm, unit: 'cm' },
            g1: { value: 62, unit: 'kN/m' }, // 0.62 kN/cm -> 62 kN/m
            Ac: { value: 12000, unit: 'cm²' }, // 1.2 m²
            //Foi utilizado o valor aproximado de 20100000
            Ic: { value: 20100000, unit: 'cm⁴' }, // 0.201 m⁴
            width: width,
            x: x,
            Panc: { values: panc_full, unit: 'kN' },
            Ap: { value: 48.48, unit: 'cm²' }, // From Losses.test.ts T-Beam case
            ncable: 4
        });
    });

    it('should be instantiated correctly for T-Beam', () => {
        expect(elasticLoss).toBeInstanceOf(ElasticShorteningLoss);
        expect(elasticLoss.Panc.values.length).toBe(11);
        expect(elasticLoss.ep.values.length).toBe(11);
    });

    it('should calculate the modular ratio (alphap) correctly', () => {
        const alphap = elasticLoss.calculateAlphap();
        // αp = Ep / Ecs = 195 / 24.15
        expect(alphap).toBeCloseTo(8.0745, 4);
    });

    it('should calculate sigmacp correctly for T-Beam', () => {
        const sigmacp = elasticLoss.calculateSigmacp();
        // Values from user, divided by 10 for kN/cm² and made symmetric
        const expectedSigmacp_half = [-0.4839, -0.811, -1.5233, -2.2937, -2.877, -3.1157];
        const expectedSigmacp = [...expectedSigmacp_half, ...expectedSigmacp_half.slice(0, -1).reverse()];

        sigmacp.values.forEach((val, i) => {
            expect(val).toBeCloseTo(expectedSigmacp[i], 3);
        });
    });

    it('should calculate sigmacg correctly for T-Beam', () => {
        const sigmacg = elasticLoss.calculateSigmacg();
        // Values from user, divided by 10 for kN/cm² and made symmetric
        const expectedSigmacg_half = [0, 0.1839, 0.5812, 1.0012, 1.3077, 1.4189];
        const expectedSigmacg = [...expectedSigmacg_half, ...expectedSigmacg_half.slice(0, -1).reverse()];

        expect(sigmacg.values.length).toBe(expectedSigmacg.length);
        sigmacg.values.forEach((val, i) => {
            expect(val).toBeCloseTo(expectedSigmacg[i], 4);
        });
    });

    it('should calculate total stress (sigmac) correctly', () => {
        const sigmac = elasticLoss.calculateSigmac();

        // Expected values calculated manually by the user
        const expectedSigmac = {
            values: [-0.4839, -0.6271, -0.9422, -1.2925, -1.5693, -1.6968, -1.5693, -1.2925, -0.9422, -0.6271, -0.4839],
            unit: 'kN/cm²'
        };

        expect(sigmac.unit).toBe(expectedSigmac.unit);
        sigmac.values.forEach((calculatedValue, i) => {
            expect(calculatedValue).toBeCloseTo(expectedSigmac.values[i], 2);
        });
    });

    it('should calculate elastic shortening force loss (deltaP_el) correctly', () => {
        const deltaSigmaP = elasticLoss.calculateDeltaSigmaP();
        const Ap = elasticLoss.Ap.value;
        const deltaP_el = deltaSigmaP.values.map(stress_loss => stress_loss * Ap);

        const expected_deltaP_el_half = [-71.0, -92.1, -138.3, -189.7, -230.4, -249.1];
        const expected_deltaP_el = [...expected_deltaP_el_half, ...expected_deltaP_el_half.slice(0, -1).reverse()];

        expect(deltaP_el.length).toBe(expected_deltaP_el.length);

        deltaP_el.forEach((force_loss, i) => {
            // The loss is a reduction in tension, so the value is negative
            expect(force_loss).toBeCloseTo(expected_deltaP_el[i], 0);
        });
    });

    it('should calculate the final prestressing force (P0) correctly', () => {
        const p0 = elasticLoss.calculateP0();

        // --- Manual Calculation for Verification at mid-span ---
        // 1. Δσ_p
        const alphap = 8.074536223602484; // More precise value
        const sigmac_mid = -1.6968; // Correct value from previous test
        const ncable = 4;
        const sequentialFactor = (ncable - 1) / (2 * ncable); // (4-1)/(2*4) = 3/8 = 0.375
        const deltaSigmaP_mid = alphap * sigmac_mid * sequentialFactor; // ~ -5.138 kN/cm²

        // 2. ΔP_enc
        const Ap = 48.48; // cm²
        const deltaP_enc_mid = deltaSigmaP_mid * Ap; // ~ -249.09 kN

        // 3. P0
        const panc_mid = -6176.784; // kN
        const p0_mid = panc_mid - deltaP_enc_mid; // -6176.784 - (-249.09) = -5927.694 kN

        // Expected values for the full beam
        const expectedP0 = [
            -5736.0, -5788.9, -5816.6, -5839.1, -5872.5, -5927.7,
            -5872.5, -5839.1, -5816.6, -5788.9, -5736.0
        ];

        // Check mid-span value
        expect(p0.values[5]).toBeCloseTo(p0_mid, 1);

        // Check all values
        p0.values.forEach((force, i) => {
            expect(force).toBeCloseTo(expectedP0[i], 0);
        });
    });
});
