import PrestressingSteel from '../../src/structuralElements/PrestressingSteel.js'

describe('PrestressingSteel', () => {
    it('should correctly initialize all properties for label "CP 190 RB 9.5"', () => {
        const steel = new PrestressingSteel({ label: 'CP 190 RB 9.5' });

        expect(steel.label).toBe('CP 190 RB 9.5');
        
        expect(steel.fptk.value).toBe(1900);
        expect(steel.fptk.unit).toBe('MPa');

        expect(steel.fpyk.value).toBe(0.9 * 1900);
        expect(steel.fpyk.unit).toBe('MPa');

        expect(steel.area_min_cordage.value).toBe(0.55);
        expect(steel.area_min_cordage.unit).toBe('cm²');

        expect(steel.relaxation).toBe('RB');

        expect(steel.nominalDiameter.value).toBe(9.5);
        expect(steel.nominalDiameter.unit).toBe('mm');
    });

    it('should correctly initialize all properties for label "CP 210 RB 12.7"', () => {
        const steel = new PrestressingSteel({ label: 'CP 210 RB 12.7' });

        expect(steel.label).toBe('CP 210 RB 12.7');
        
        expect(steel.fptk.value).toBe(2100);
        expect(steel.fpyk.value).toBe(0.9 * 2100);
        expect(steel.area_min_cordage.value).toBe(0.99);
        expect(steel.relaxation).toBe('RB');
        expect(steel.nominalDiameter.value).toBe(12.7);
    });

    it('should correctly initialize all properties for label "CP 240 RB 15.2"', () => {
        const steel = new PrestressingSteel({ label: 'CP 240 RB 15.2' });

        expect(steel.label).toBe('CP 240 RB 15.2');
        expect(steel.fptk.value).toBe(2400);
        expect(steel.fpyk.value).toBe(0.9 * 2400);
        expect(steel.area_min_cordage.value).toBe(1.40);
        expect(steel.nominalDiameter.value).toBe(15.2);
    });

    it('should throw an error for an invalid label format', () => {
        // We cast to 'any' to bypass TypeScript's compile-time check for this test case
        const invalidLabel: any = 'CP 190-RB-9.5';
        expect(() => new PrestressingSteel({ label: invalidLabel })).toThrow(`Nome do aço de protensão inválido: "${invalidLabel}". O formato esperado é 'CP XXX (RB|RN) D.D'.`);
    });
});
