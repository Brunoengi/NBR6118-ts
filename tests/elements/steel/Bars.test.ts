import Bars from '../../../src/utils/elements/steel/Bars'
import { A } from '../../../src/types/sectionsType'

describe('Bars', () => {
  describe('constructor and necessaryBars calculation', () => {
    it('should calculate the correct number of necessary bars for a given steel area', () => {
      // Área de aço necessária
      const As: A = { value: 5, unit: 'cm²' }

      // Instancia a classe Bars
      const bars = new Bars({ As })

      // Valores esperados (Math.ceil(As.value / bar.sectionArea.value))
      const expectedNecessaryBars = {
        '5': 26, // Math.ceil(5 / 0.196)
        '6.3': 17, // Math.ceil(5 / 0.312)
        '8': 10, // Math.ceil(5 / 0.503)
        '10': 7, // Math.ceil(5 / 0.785)
        '12.5': 5, // Math.ceil(5 / 1.227)
        '16': 3, // Math.ceil(5 / 2.011)
        '20': 2, // Math.ceil(5 / 3.142)
        '22': 2, // Math.ceil(5 / 3.801)
        '25': 2, // Math.ceil(5 / 4.909)
        '32': 1, // Math.ceil(5 / 8.042)
        '40': 1, // Math.ceil(5 / 12.566)
      }

      expect(bars.necessaryBars).toEqual(expectedNecessaryBars)
    })

    it('should calculate correctly when As.value is 10', () => {
      const As: A = { value: 10, unit: 'cm²' }
      const bars = new Bars({ As })

      const expectedNecessaryBars = {
        '5': 52,
        '6.3': 33,
        '8': 20,
        '10': 13,
        '12.5': 9,
        '16': 5,
        '20': 4,
        '22': 3,
        '25': 3,
        '32': 2,
        '40': 1,
      }

      expect(bars.necessaryBars).toEqual(expectedNecessaryBars)
    })

    it('should have access to static property possibleBar', () => {
      // Verifica se a propriedade estática com os dados das barras está acessível
      expect(Bars.possibleBar['10'].sectionArea.value).toBe(0.785)
      expect(Bars.possibleBar['25'].linearMass.value).toBe(3.853)
    })
  })
})