import Concrete from "Concrete";
import AgregateConcrete from "Agregate";

describe('C-20 and granite aggregate', () => {
    it('should be instantiated correctly with given properties', () => {
        // Arrange: Crie as instâncias necessárias
        const aggregateGranite = new AgregateConcrete("granite");
        const concrete = new Concrete(20, aggregateGranite);

        // Assert: Verifique se as propriedades foram definidas corretamente
        expect(concrete.fck.value).toBe(20);
        expect(concrete.agregate).toBe(aggregateGranite);
        expect(concrete.e0.value).toBe(2);
        expect(concrete.eu.value).toBe(3.5)
        expect(concrete.Ecs.value).toBeCloseTo(0.85 * concrete.Ec.value)
    });
});

describe('C-25 and granite aggregate', () => {
    it('should be instantiated correctly with given properties', () => {
        // Arrange: Crie as instâncias necessárias
        const aggregateGranite = new AgregateConcrete("granite");
        const concrete = new Concrete(25, aggregateGranite);

        // Assert: Verifique se as propriedades foram definidas corretamente
        expect(concrete.fck.value).toBe(25);
        expect(concrete.agregate).toBe(aggregateGranite);
        expect(concrete.e0.value).toBe(2);
        expect(concrete.eu.value).toBe(3.5)
        expect(concrete.Ecs.value).toBeCloseTo(0.85 * concrete.Ec.value)
        
    });
});
