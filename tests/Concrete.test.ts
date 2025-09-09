import Concrete from "Concrete"
import AgregateConcrete from "Agregate"

describe('C-20 and granite aggregate', () => {
    it('should be instantiated correctly with given properties', () => {
        // Arrange: Crie as instâncias necessárias
        const aggregateGranite = new AgregateConcrete("granite")
        const concrete = new Concrete(20, aggregateGranite)

        // Assert: Verifique se as propriedades foram definidas corretamente
        expect(concrete.fck.value).toBe(20)
        expect(concrete.agregate).toBe(aggregateGranite)
        expect(concrete.e0.value).toBe(2)
        expect(concrete.eu.value).toBe(3.5)
        expect(concrete.Ecs.value).toBeCloseTo(0.85 * concrete.Ec.value)
        expect(concrete.fctk_inf.value).toBeCloseTo(0.7 * concrete.fctm.value)
        expect(concrete.fctk_sup.value).toBeCloseTo(1.3 * concrete.fctm.value)
        expect(concrete.Ec.value).toBeCloseTo(25040, -1)
        expect(concrete.Ecs.value).toBeCloseTo(21290, -1)
    });
});

describe('C-25 and granite aggregate', () => {
    it('should be instantiated correctly with given properties', () => {
        // Arrange: Crie as instâncias necessárias
        const aggregateGranite = new AgregateConcrete("granite")
        const concrete = new Concrete(25, aggregateGranite)

        // Assert: Verifique se as propriedades foram definidas corretamente
        expect(concrete.fck.value).toBe(25)
        expect(concrete.agregate).toBe(aggregateGranite)
        expect(concrete.e0.value).toBe(2)
        expect(concrete.eu.value).toBe(3.5)
        expect(concrete.Ec.value).toBeCloseTo(28000, -1)
        expect(concrete.Ecs.value).toBeCloseTo(24150, -1)
        
    });
});

describe('C-30 and granite aggregate', () => {
    it('should be instantiated correctly with given properties', () => {
        // Arrange: Crie as instâncias necessárias
        const aggregateGranite = new AgregateConcrete("granite")
        const concrete = new Concrete(30, aggregateGranite)

        // Assert: Verifique se as propriedades foram definidas corretamente
        expect(concrete.fck.value).toBe(30);
        expect(concrete.agregate).toBe(aggregateGranite);
        expect(concrete.e0.value).toBe(2);
        expect(concrete.eu.value).toBe(3.5)
        expect(concrete.Ec.value).toBeCloseTo(30670, -1)
        expect(concrete.Ecs.value).toBeCloseTo(26840, -1)
    });
});

describe('C-35 and granite aggregate', () => {
    it('should be instantiated correctly with given properties', () => {
        // Arrange: Crie as instâncias necessárias
        const aggregateGranite = new AgregateConcrete("granite")
        const concrete = new Concrete(35, aggregateGranite)

        // Assert: Verifique se as propriedades foram definidas corretamente
        expect(concrete.fck.value).toBe(35);
        expect(concrete.agregate).toBe(aggregateGranite)
        expect(concrete.e0.value).toBe(2)
        expect(concrete.eu.value).toBe(3.5)
        expect(concrete.fctk_inf.value).toBeCloseTo(3.37/1.5, 3)
        expect(concrete.Ec.value).toBeCloseTo(33130, -1)
        expect(concrete.Ecs.value).toBeCloseTo(29400, -1)
    });
});

describe('C-40 and granite aggregate', () => {
    it('should be instantiated correctly with given properties', () => {
        // Arrange: Crie as instâncias necessárias
        const aggregateGranite = new AgregateConcrete("granite")
        const concrete = new Concrete(40, aggregateGranite);

        // Assert: Verifique se as propriedades foram definidas corretamente
        expect(concrete.fck.value).toBe(40)
        expect(concrete.agregate).toBe(aggregateGranite)
        expect(concrete.e0.value).toBe(2)
        expect(concrete.eu.value).toBe(3.5)
        expect(concrete.Ec.value).toBeCloseTo(35420, -1)
        expect(concrete.Ecs.value).toBeCloseTo(31880, -1)
    });
});

describe('C-45 and granite aggregate', () => {
    it('should be instantiated correctly with given properties', () => {
        // Arrange: Crie as instâncias necessárias
        const aggregateGranite = new AgregateConcrete("granite")
        const concrete = new Concrete(45, aggregateGranite)

        // Assert: Verifique se as propriedades foram definidas corretamente
        expect(concrete.fck.value).toBe(45);
        expect(concrete.agregate).toBe(aggregateGranite)
        expect(concrete.e0.value).toBe(2);
        expect(concrete.eu.value).toBe(3.5)
        expect(concrete.Ec.value).toBeCloseTo(37570, -1)
        expect(concrete.Ecs.value).toBeCloseTo(34280, -1)
    });
});

describe('C-50 and granite aggregate', () => {
    it('should be instantiated correctly with given properties', () => {
        // Arrange: Crie as instâncias necessárias
        const aggregateGranite = new AgregateConcrete("granite")
        const concrete = new Concrete(50, aggregateGranite);

        // Assert: Verifique se as propriedades foram definidas corretamente
        expect(concrete.fck.value).toBe(50)
        expect(concrete.agregate).toBe(aggregateGranite)
        expect(concrete.e0.value).toBe(2);
        expect(concrete.eu.value).toBe(3.5)
        expect(concrete.Ec.value).toBeCloseTo(39600, -1)
        expect(concrete.Ecs.value).toBeCloseTo(36630, -1)
    });
});

describe('C-55 and granite aggregate', () => {
    it('should be instantiated correctly with given properties', () => {
        // Arrange: Crie as instâncias necessárias
        const aggregateGranite = new AgregateConcrete("granite");
        const concrete = new Concrete(55, aggregateGranite);

        // Assert: Verifique se as propriedades foram definidas corretamente
        expect(concrete.fck.value).toBe(55)
        expect(concrete.agregate).toBe(aggregateGranite)
        expect(concrete.e0.value).toBeCloseTo(2.2, 1)
        expect(concrete.eu.value).toBeCloseTo(3.1, 1)
        expect(concrete.Ec.value).toBeCloseTo(40630, -1)
        expect(concrete.Ecs.value).toBeCloseTo(38090, -1)
    });
});

describe('C-60 and granite aggregate', () => {
    it('should be instantiated correctly with given properties', () => {
        // Arrange: Crie as instâncias necessárias
        const aggregateGranite = new AgregateConcrete("granite");
        const concrete = new Concrete(60, aggregateGranite);

        // Assert: Verifique se as propriedades foram definidas corretamente
        expect(concrete.fck.value).toBe(60);
        expect(concrete.agregate).toBe(aggregateGranite)
        expect(concrete.e0.value).toBeCloseTo(2.3, 1)
        expect(concrete.eu.value).toBeCloseTo(2.9, 1)
        expect(concrete.Ec.value).toBeCloseTo(41610, -1)
        expect(concrete.Ecs.value).toBeCloseTo(39530, -1)
    });
});

describe('C-65 and granite aggregate', () => {
    it('should be instantiated correctly with given properties', () => {
        // Arrange: Crie as instâncias necessárias
        const aggregateGranite = new AgregateConcrete("granite");
        const concrete = new Concrete(65, aggregateGranite);

        // Assert: Verifique se as propriedades foram definidas corretamente
        expect(concrete.fck.value).toBe(65);
        expect(concrete.agregate).toBe(aggregateGranite);
        expect(concrete.Ec.value).toBeCloseTo(42550, -1)
        expect(concrete.Ecs.value).toBeCloseTo(40950, -1)
    });
});


describe('C-70 and granite aggregate', () => {
    it('should be instantiated correctly with given properties', () => {
        // Arrange: Crie as instâncias necessárias
        const aggregateGranite = new AgregateConcrete("granite");
        const concrete = new Concrete(70, aggregateGranite);

        // Assert: Verifique se as propriedades foram definidas corretamente
        expect(concrete.fck.value).toBe(70);
        expect(concrete.agregate).toBe(aggregateGranite)
        expect(concrete.e0.value).toBeCloseTo(2.4, 1)
        expect(concrete.eu.value).toBeCloseTo(2.7, 1)
        expect(concrete.Ec.value).toBeCloseTo(43440, -1)
        expect(concrete.Ecs.value).toBeCloseTo(42360, -1)
        
    });
});

describe('C-80 and granite aggregate', () => {
    it('should be instantiated correctly with given properties', () => {
        // Arrange: Crie as instâncias necessárias
        const aggregateGranite = new AgregateConcrete("granite");
        const concrete = new Concrete(80, aggregateGranite);

        // Assert: Verifique se as propriedades foram definidas corretamente
        expect(concrete.fck.value).toBe(80);
        expect(concrete.agregate).toBe(aggregateGranite)
        expect(concrete.e0.value).toBeCloseTo(2.5, 1)
        expect(concrete.eu.value).toBeCloseTo(2.6, 1)
        expect(concrete.Ec.value).toBeCloseTo(45130, -1)
        expect(concrete.Ecs.value).toBeCloseTo(45130, -1)
        
    });
});