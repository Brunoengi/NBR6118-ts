import Concrete from "../../src/buildingElements/Concrete.js";


describe('Concrete with granite aggregate', () => {

    const aggregateType =  "granite"

    it('should be instantiated correctly with given properties', () => {
        // Arrange: Crie as instâncias necessárias

        const concrete = new Concrete({fck: 20, aggregate: aggregateType})

        // Assert: Verifique se as propriedades foram definidas corretamente
        expect(concrete.fck.value).toBe(20)
        expect(concrete.aggregate?.type).toBe("granite")
        expect(concrete.e0.value).toBe(2)
        expect(concrete.eu.value).toBe(3.5)
        expect(concrete.fctk_inf.value).toBeCloseTo(0.7 * concrete.fctm.value)
        expect(concrete.fctk_sup.value).toBeCloseTo(1.3 * concrete.fctm.value)
        expect(concrete.Ec.value).toBeCloseTo(25040, -1)
        expect(concrete.Ecs.value).toBeCloseTo(21290, -1)
    });

    it('C-25 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck: 25, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(25);
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBe(2);
    expect(concrete.eu.value).toBe(3.5);
    expect(concrete.fctk_inf.value).toBeCloseTo(0.7 * concrete.fctm.value);
    expect(concrete.fctk_sup.value).toBeCloseTo(1.3 * concrete.fctm.value);
    expect(concrete.Ec.value).toBeCloseTo(28000, -1);
    expect(concrete.Ecs.value).toBeCloseTo(24150, -1);
  });

  it('C-30 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck: 30, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(30);
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBe(2);
    expect(concrete.eu.value).toBe(3.5);
    expect(concrete.fctk_inf.value).toBeCloseTo(0.7 * concrete.fctm.value);
    expect(concrete.fctk_sup.value).toBeCloseTo(1.3 * concrete.fctm.value);
    expect(concrete.Ec.value).toBeCloseTo(30670, -1);
    expect(concrete.Ecs.value).toBeCloseTo(26840, -1);
  });

  it('C-35 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck: 35, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(35);
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBe(2);
    expect(concrete.eu.value).toBe(3.5);
    expect(concrete.fctk_inf.value).toBeCloseTo(0.7 * concrete.fctm.value);
    expect(concrete.fctk_sup.value).toBeCloseTo(1.3 * concrete.fctm.value);
    expect(concrete.Ec.value).toBeCloseTo(33130, -1);
    expect(concrete.Ecs.value).toBeCloseTo(29400, -1);
  });

  it('C-40 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck: 40, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(40);
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBe(2);
    expect(concrete.eu.value).toBe(3.5);
    expect(concrete.fctk_inf.value).toBeCloseTo(0.7 * concrete.fctm.value);
    expect(concrete.fctk_sup.value).toBeCloseTo(1.3 * concrete.fctm.value);
    expect(concrete.Ec.value).toBeCloseTo(35420, -1);
    expect(concrete.Ecs.value).toBeCloseTo(31880, -1);
  });

  it('C-45 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck: 45, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(45);
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBe(2);
    expect(concrete.eu.value).toBe(3.5);
    expect(concrete.fctk_inf.value).toBeCloseTo(0.7 * concrete.fctm.value);
    expect(concrete.fctk_sup.value).toBeCloseTo(1.3 * concrete.fctm.value);
    expect(concrete.Ec.value).toBeCloseTo(37570, -1);
    expect(concrete.Ecs.value).toBeCloseTo(34280, -1);
  });

  it('C-50 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck: 50, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(50);
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBe(2);
    expect(concrete.eu.value).toBe(3.5);
    expect(concrete.fctk_inf.value).toBeCloseTo(0.7 * concrete.fctm.value);
    expect(concrete.fctk_sup.value).toBeCloseTo(1.3 * concrete.fctm.value);
    expect(concrete.Ec.value).toBeCloseTo(39600, -1);
    expect(concrete.Ecs.value).toBeCloseTo(36630, -1);
  });

  it('C-55 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck: 55, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(55);
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBeCloseTo(2.2, 1);
    expect(concrete.eu.value).toBeCloseTo(3.1, 1);
    expect(concrete.Ec.value).toBeCloseTo(40630, -1);
    expect(concrete.Ecs.value).toBeCloseTo(38090, -1);
  });

  it('C-60 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck: 60, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(60);
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBeCloseTo(2.3, 1);
    expect(concrete.eu.value).toBeCloseTo(2.9, 1);
    expect(concrete.Ec.value).toBeCloseTo(41610, -1);
    expect(concrete.Ecs.value).toBeCloseTo(39530, -1);
  });

  it('C-65 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck: 65, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(65);
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.Ec.value).toBeCloseTo(42550, -1);
    expect(concrete.Ecs.value).toBeCloseTo(40950, -1);
  });

  it('C-70 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck: 70, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(70);
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBeCloseTo(2.4, 1);
    expect(concrete.eu.value).toBeCloseTo(2.7, 1);
    expect(concrete.Ec.value).toBeCloseTo(43440, -1);
    expect(concrete.Ecs.value).toBeCloseTo(42360, -1);
  });

  it('C-80 should be instantiated correctly', () => {
    const concrete = new Concrete({ fck: 80, aggregate: aggregateType });

    expect(concrete.fck.value).toBe(80);
    expect(concrete.aggregate?.type).toBe(aggregateType);
    expect(concrete.e0.value).toBeCloseTo(2.5, 1);
    expect(concrete.eu.value).toBeCloseTo(2.6, 1);
    expect(concrete.Ec.value).toBeCloseTo(45130, -1);
    expect(concrete.Ecs.value).toBeCloseTo(45130, -1);
  });
});

describe('Concrete time-dependent properties', () => {
  const concrete = new Concrete({ fck: 25, aggregate: 'granite' });

  describe('calculate_fckj', () => {

    it('should calculate fckj correctly for j < 28 days', () => {
          // At 5 days
          const fckj_7 = concrete.calculate_fckj(5);
          const expected_fckj_7 = 25 * (Math.E ** (0.2 * (1 - Math.sqrt(28 / 5)))); // ~19.02 MPa
          expect(fckj_7.value).toBeCloseTo(expected_fckj_7);
          console.log(fckj_7.value)
          expect(fckj_7.unit).toBe('MPa');
      });

      it('should calculate fckj correctly for j < 28 days', () => {
          // At 7 days
          const fckj_7 = concrete.calculate_fckj(7);
          const expected_fckj_7 = 25 * (Math.E ** (0.2 * (1 - Math.sqrt(28 / 7)))); // ~20.47 MPa
          expect(fckj_7.value).toBeCloseTo(expected_fckj_7);
          expect(fckj_7.unit).toBe('MPa');
      });

      it('should return fck when j = 28 days', () => {
          // At 28 days, fckj should be equal to fck
          const fckj_28 = concrete.calculate_fckj(28);
          expect(fckj_28.value).toBeCloseTo(25);
          expect(fckj_28.unit).toBe('MPa');
      });

      it('should calculate fckj correctly for j > 28 days', () => {
          // At 56 days
          const fckj_56 = concrete.calculate_fckj(56);
          const expected_fckj_56 = 25 * (Math.E ** (0.2 * (1 - Math.sqrt(28 / 56)))); // ~26.5 MPa
          expect(fckj_56.value).toBeCloseTo(expected_fckj_56);
          expect(fckj_56.unit).toBe('MPa');
      });

      it('should calculate fckj correctly for j = 30 days', () => {
        // At 30 days
        const fckj_30 = concrete.calculate_fckj(30);
        const expected_fckj_30 = 25 * (Math.E ** (0.2 * (1 - Math.sqrt(28 / 30)))); // ~25.17 MPa
        expect(fckj_30.value).toBeCloseTo(expected_fckj_30);
        expect(fckj_30.unit).toBe('MPa');
      });

      it('should calculate fckj correctly for fck=35 and j = 30 days', () => {
        const concrete35 = new Concrete({ fck: 35, aggregate: 'granite' });
        const fckj_30 = concrete35.calculate_fckj(30);
        const expected_fckj_30 = 35 * (Math.E ** (0.2 * (1 - Math.sqrt(28 / 30)))); // ~35.24 MPa
        expect(fckj_30.value).toBeCloseTo(expected_fckj_30);
        expect(fckj_30.unit).toBe('MPa');
      });
  });

  describe('calculate_fctj', () => {
      it('should calculate fctj correctly for j < 28 days', () => {
          // At 7 days
          const fctj_7 = concrete.calculate_fctj(7);
          const fckj_7 = concrete.calculate_fckj(7).value;
          const expected_fctj_7 = 0.3 * (fckj_7 ** (2/3)); // ~2.25 MPa
          expect(fctj_7.value).toBeCloseTo(expected_fctj_7);
          expect(fctj_7.unit).toBe('MPa');
      });

      it('should return fctm when j = 28 days', () => {
          // At 28 days, fctj should be equal to fctm
          const fctj_28 = concrete.calculate_fctj(28);
          expect(fctj_28.value).toBeCloseTo(concrete.fctm.value);
          expect(fctj_28.unit).toBe('MPa');
      });

      it('should calculate fctj correctly for j = 30 days', () => {
        // At 30 days
        const fctj_30 = concrete.calculate_fctj(30);
        const fckj_30 = concrete.calculate_fckj(30).value;
        const expected_fctj_30 = 0.3 * (fckj_30 ** (2/3)); // ~2.58 MPa
        expect(fctj_30.value).toBeCloseTo(expected_fctj_30);
        expect(fctj_30.unit).toBe('MPa');
      });
  });
});
