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
