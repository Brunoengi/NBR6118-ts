import AggregateConcrete from "../../src/buildingElements/Aggregate.js"


describe('AggregateConcrete', () => {
    it('should correctly calculate alpha_e for basalt', () => {
        const aggregate = new AggregateConcrete('basalt');
        expect(aggregate.type).toBe('basalt');
        expect(aggregate.alpha_e).toBe(1.2);
    });

    it('should correctly calculate alpha_e for granite', () => {
        const aggregate = new AggregateConcrete('granite');
        expect(aggregate.type).toBe('granite');
        expect(aggregate.alpha_e).toBe(1.0);
    });

    it('should correctly calculate alpha_e for gneiss', () => {
        const aggregate = new AggregateConcrete('gneiss');
        expect(aggregate.type).toBe('gneiss');
        expect(aggregate.alpha_e).toBe(1.0);
    });

    it('should correctly calculate alpha_e for limestone', () => {
        const aggregate = new AggregateConcrete('limestone');
        expect(aggregate.type).toBe('limestone');
        expect(aggregate.alpha_e).toBe(0.9);
    });

    it('should correctly calculate alpha_e for sandstone', () => {
        const aggregate = new AggregateConcrete('sandstone');
        expect(aggregate.type).toBe('sandstone');
        expect(aggregate.alpha_e).toBe(0.7);
    });

    it('should throw an error for an invalid aggregate type', () => {
        // This test assumes that the constructor will throw an error for unknown types.
        // We cast to 'any' to bypass TypeScript's type checking for the test.
        const invalidType: any = 'mudstone';
        // The exact error message might differ based on your implementation.
        expect(() => new AggregateConcrete(invalidType)).toThrow();
    });
});
