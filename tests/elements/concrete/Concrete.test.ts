import Concrete from "../../../src/utils/elements/concrete/Concrete.js";

describe('Concrete with granite aggregate', () => {

    const aggregateType =  "granite"

    it('should be instantiated correctly with given properties', () => {
        // Arrange: Crie as instâncias necessárias

        const concrete = new Concrete({fck:{value: 2.0, unit: 'kN/cm²'}, aggregate: aggregateType})

        // Assert: Verifique se as propriedades foram definidas corretamente
        expect(concrete.fck.value).toBe(2.0) // kN/cm²
        expect(concrete.aggregate?.type).toBe("granite")
        expect(concrete.e0.value).toBe(2)
        expect(concrete.eu.value).toBe(3.5)
        expect(concrete.fctk_inf.value).toBeCloseTo(0.7 * concrete.fctm.value)
        expect(concrete.fctk_sup.value).toBeCloseTo(1.3 * concrete.fctm.value)
        expect(concrete.Ec.value).toBeCloseTo(2504.0, 0) // kN/cm²
        expect(concrete.Ecs.value).toBeCloseTo(2129.0, 0) // kN/cm²
    });

    it('C-25 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck:{value: 2.5, unit: 'kN/cm²'}, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(2.5); // kN/cm²
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBe(2);
    expect(concrete.eu.value).toBe(3.5);
    expect(concrete.fctk_inf.value).toBeCloseTo(0.7 * concrete.fctm.value);
    expect(concrete.fctk_sup.value).toBeCloseTo(1.3 * concrete.fctm.value);
    expect(concrete.Ec.value).toBeCloseTo(2800.0, 0); // kN/cm²
    expect(concrete.Ecs.value).toBeCloseTo(2415.0, 0); // kN/cm²
  });

  it('C-30 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck:{value: 3.0, unit: 'kN/cm²'}, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(3.0); // kN/cm²
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBe(2);
    expect(concrete.eu.value).toBe(3.5);
    expect(concrete.fctk_inf.value).toBeCloseTo(0.7 * concrete.fctm.value);
    expect(concrete.fctk_sup.value).toBeCloseTo(1.3 * concrete.fctm.value);
    expect(concrete.Ec.value).toBeCloseTo(3067.0, 0); // kN/cm²
    expect(concrete.Ecs.value).toBeCloseTo(2684.0, 0); // kN/cm²
  });

  it('C-35 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck:{value: 3.5, unit: 'kN/cm²'}, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(3.5); // kN/cm²
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBe(2);
    expect(concrete.eu.value).toBe(3.5);
    expect(concrete.fctk_inf.value).toBeCloseTo(0.7 * concrete.fctm.value);
    expect(concrete.fctk_sup.value).toBeCloseTo(1.3 * concrete.fctm.value);
    expect(concrete.Ec.value).toBeCloseTo(3313.0, 0); // kN/cm²
    expect(concrete.Ecs.value).toBeCloseTo(2940.0, 0); // kN/cm²
  });

  it('C-40 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck:{value: 4.0, unit: 'kN/cm²'}, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(4.0); // kN/cm²
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBe(2);
    expect(concrete.eu.value).toBe(3.5);
    expect(concrete.fctk_inf.value).toBeCloseTo(0.7 * concrete.fctm.value);
    expect(concrete.fctk_sup.value).toBeCloseTo(1.3 * concrete.fctm.value);
    expect(concrete.Ec.value).toBeCloseTo(3542.0, 0); // kN/cm²
    expect(concrete.Ecs.value).toBeCloseTo(3188.0, 0); // kN/cm²
  });

  it('C-45 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck:{value: 4.5, unit: 'kN/cm²'}, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(4.5); // kN/cm²
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBe(2);
    expect(concrete.eu.value).toBe(3.5);
    expect(concrete.fctk_inf.value).toBeCloseTo(0.7 * concrete.fctm.value);
    expect(concrete.fctk_sup.value).toBeCloseTo(1.3 * concrete.fctm.value);
    expect(concrete.Ec.value).toBeCloseTo(3757.0, 0); // kN/cm²
    expect(concrete.Ecs.value).toBeCloseTo(3428.0, 0); // kN/cm²
  });

  it('C-50 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck:{value: 5.0, unit: 'kN/cm²'}, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(5.0); // kN/cm²
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBe(2);
    expect(concrete.eu.value).toBe(3.5);
    expect(concrete.fctk_inf.value).toBeCloseTo(0.7 * concrete.fctm.value);
    expect(concrete.fctk_sup.value).toBeCloseTo(1.3 * concrete.fctm.value);
    expect(concrete.Ec.value).toBeCloseTo(3960.0, 0); // kN/cm²
    expect(concrete.Ecs.value).toBeCloseTo(3663.0, 0); // kN/cm²
  });

  it('C-55 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck:{value: 5.5, unit: 'kN/cm²'}, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(5.5); // kN/cm²
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBeCloseTo(2.2, 1);
    expect(concrete.eu.value).toBeCloseTo(3.1, 1);
    expect(concrete.Ec.value).toBeCloseTo(4063.0, 0); // kN/cm²
    expect(concrete.Ecs.value).toBeCloseTo(3809.0, 0); // kN/cm²
  });

  it('C-60 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck:{value: 6.0, unit: 'kN/cm²'}, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(6.0); // kN/cm²
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBeCloseTo(2.3, 1);
    expect(concrete.eu.value).toBeCloseTo(2.9, 1);
    expect(concrete.Ec.value).toBeCloseTo(4161.0, 0); // kN/cm²
    expect(concrete.Ecs.value).toBeCloseTo(3953.0, 0); // kN/cm²
  });

  it('C-65 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck:{value: 6.5, unit: 'kN/cm²'}, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(6.5); // kN/cm²
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.Ec.value).toBeCloseTo(4255.0, 0); // kN/cm²
    expect(concrete.Ecs.value).toBeCloseTo(4095.0, 0); // kN/cm²
  });

  it('C-70 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck:{value: 7.0, unit: 'kN/cm²'}, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(7.0); // kN/cm²
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBeCloseTo(2.4, 1);
    expect(concrete.eu.value).toBeCloseTo(2.7, 1);
    expect(concrete.Ec.value).toBeCloseTo(4344.0, 0); // kN/cm²
    expect(concrete.Ecs.value).toBeCloseTo(4236.0, 0); // kN/cm²
  });

  it('C-80 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck:{value: 8.0, unit: 'kN/cm²'}, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(8.0); // kN/cm²
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBeCloseTo(2.5, 1);
    expect(concrete.eu.value).toBeCloseTo(2.6, 1);
    expect(concrete.Ec.value).toBeCloseTo(4513.0, 0); // kN/cm²
    expect(concrete.Ecs.value).toBeCloseTo(4513.0, 0); // kN/cm²
  });
});

describe('Concrete time-dependent properties', () => {
  const concrete = new Concrete({ fck:{value: 2.5, unit: 'kN/cm²'}, aggregate: 'granite' });

  describe('calculate_fckj', () => {

    it('should calculate fckj correctly for j < 28 days', () => {
          // At 5 days
          const fckj_7 = concrete.calculate_fckj(5);
          const expected_fckj_7_MPa = 25 * (Math.E ** (0.2 * (1 - Math.sqrt(28 / 5)))); // ~19.02 MPa
          expect(fckj_7.value).toBeCloseTo(expected_fckj_7_MPa / 10); // ~1.902 kN/cm²
          expect(fckj_7.unit).toBe('kN/cm²');
      });

      it('should calculate fckj correctly for j < 28 days', () => {
          // At 7 days
          const fckj_7 = concrete.calculate_fckj(7);
          const expected_fckj_7_MPa = 25 * (Math.E ** (0.2 * (1 - Math.sqrt(28 / 7)))); // ~20.47 MPa
          expect(fckj_7.value).toBeCloseTo(expected_fckj_7_MPa / 10); // ~2.047 kN/cm²
          expect(fckj_7.unit).toBe('kN/cm²');
      });

      it('should return fck when j = 28 days', () => {
          // At 28 days, fckj should be equal to fck
          const fckj_28 = concrete.calculate_fckj(28);
          expect(fckj_28.value).toBeCloseTo(2.5); // 2.5 kN/cm²
          expect(fckj_28.unit).toBe('kN/cm²');
      });

      it('should calculate fckj correctly for j > 28 days', () => {
          // At 56 days
          const fckj_56 = concrete.calculate_fckj(56);
          const expected_fckj_56_MPa = 25 * (Math.E ** (0.2 * (1 - Math.sqrt(28 / 56)))); // ~26.5 MPa
          expect(fckj_56.value).toBeCloseTo(expected_fckj_56_MPa / 10); // ~2.65 kN/cm²
          expect(fckj_56.unit).toBe('kN/cm²');
      });

      it('should calculate fckj correctly for j = 30 days', () => {
        // At 30 days
        const fckj_30 = concrete.calculate_fckj(30);
        const expected_fckj_30_MPa = 25 * (Math.E ** (0.2 * (1 - Math.sqrt(28 / 30)))); // ~25.17 MPa
        expect(fckj_30.value).toBeCloseTo(expected_fckj_30_MPa / 10); // ~2.517 kN/cm²
        expect(fckj_30.unit).toBe('kN/cm²');
      });

      it('should calculate fckj correctly for fck=35 and j = 30 days', () => {
        const concrete35 = new Concrete({ fck: { value: 3.5, unit: 'kN/cm²' }, aggregate: 'granite' });
        const fckj_30 = concrete35.calculate_fckj(30);
        const expected_fckj_30_MPa = 35 * (Math.E ** (0.2 * (1 - Math.sqrt(28 / 30)))); // ~35.24 MPa
        expect(fckj_30.value).toBeCloseTo(expected_fckj_30_MPa / 10); // ~3.524 kN/cm²
        expect(fckj_30.unit).toBe('kN/cm²');
      });
  });

  describe('calculate_fctj', () => {
      it('should calculate fctj correctly for j < 28 days', () => {
          // At 7 days
          const fctj_7 = concrete.calculate_fctmj(7);
          const fckj_7_MPa = concrete.calculate_fckj(7).value * 10;
          const expected_fctj_7_MPa = 0.3 * (fckj_7_MPa ** (2/3)); // ~2.25 MPa
          expect(fctj_7.value).toBeCloseTo(expected_fctj_7_MPa / 10); // ~0.225 kN/cm²
          expect(fctj_7.unit).toBe('kN/cm²');
      });

      it('should return fctm when j = 28 days', () => {
          // At 28 days, fctj should be equal to fctm
          const fctj_28 = concrete.calculate_fctmj(28);
          expect(fctj_28.value).toBeCloseTo(concrete.fctm.value);
          expect(fctj_28.unit).toBe('kN/cm²');
      });

      it('should calculate fctj correctly for j = 30 days', () => {
        // At 30 days
        const fctj_30 = concrete.calculate_fctmj(30);
        const fckj_30_MPa = concrete.calculate_fckj(30).value * 10;
        const expected_fctj_30_MPa = 0.3 * (fckj_30_MPa ** (2/3)); // ~2.58 MPa
        expect(fctj_30.value).toBeCloseTo(expected_fctj_30_MPa / 10); // ~0.258 kN/cm²
        expect(fctj_30.unit).toBe('kN/cm²');
      });
  });
});

describe('Concrete rectangular diagram properties', () => {
  it('should calculate lambda, alphac, and nc correctly for fck <= 50 MPa', () => {
    const concrete = new Concrete({ fck: { value: 3.5, unit: 'kN/cm²' } }); // 35 MPa

    // For fck <= 50 MPa: lambda = 0.8
    expect(concrete.lambda.value).toBe(0.8);

    // For fck <= 50 MPa: alphac = 0.85
    expect(concrete.alphac).toBe(0.85);

    // For fck <= 40 MPa: nc = 1
    expect(concrete.nc).toBe(1);
  });

  it('should calculate lambda, alphac, and nc correctly for fck > 50 MPa', () => {
    const concrete = new Concrete({ fck: { value: 6.0, unit: 'kN/cm²' } }); // 60 MPa

    // For fck > 50 MPa: lambda = 0.8 - (fck - 50) / 400
    const expectedLambda = 0.8 - (60 - 50) / 400; // 0.775
    expect(concrete.lambda.value).toBeCloseTo(expectedLambda);

    // For fck > 50 MPa: alphac = 0.85 * (1 - (fck - 50) / 200)
    const expectedAlphac = 0.85 * (1 - (60 - 50) / 200); // 0.8075
    expect(concrete.alphac).toBeCloseTo(expectedAlphac);

    // For fck > 40 MPa: nc = (40 / fck)^(1/3)
    const expectedNc = (40 / 60) ** (1 / 3); // ~0.87358
    expect(concrete.nc).toBeCloseTo(expectedNc);
  });

  it('should calculate maxStress_rectangularDiagram correctly', () => {
    const concrete = new Concrete({ fck: { value: 3.5, unit: 'kN/cm²' } }); // 35 MPa
    // fcd = (35 / 1.4) / 10 = 2.5 kN/cm²
    // alphac = 0.85
    // nc = 1
    // maxStress = 0.85 * 1 * 2.5 = 2.125 kN/cm²
    const expectedStress = 0.85 * 1 * (3.5 / 1.4);
    expect(concrete.maxStress_rectangularDiagram.value).toBeCloseTo(expectedStress);
    expect(concrete.maxStress_rectangularDiagram.unit).toBe('kN/cm²');
  });

  it('should calculate maxStress_rectangularDiagram correctly when section is reduced', () => {
    const concrete = new Concrete({
      fck: { value: 3.5, unit: 'kN/cm²' },
      is_section_reduced: true
    }); // 35 MPa

    // fcd = 2.5 kN/cm²
    // alphac = 0.85
    // nc = 1
    // maxStress = 0.9 * 0.85 * 1 * 2.5 = 1.9125 kN/cm²
    const expectedStress = 0.9 * 0.85 * 1 * (3.5 / 1.4);
    expect(concrete.maxStress_rectangularDiagram.value).toBeCloseTo(expectedStress);
    expect(concrete.maxStress_rectangularDiagram.unit).toBe('kN/cm²');
  });
});
