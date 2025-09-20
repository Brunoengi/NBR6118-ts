
import { CreepConcrete } from "../../../src/structuralDesign/Concrete/Creep.js";

describe('CreepConcrete', () => {
  let creep: CreepConcrete;

  beforeAll(() => {
    creep = new CreepConcrete();
  });

  describe('getValue', () => {
    // Test Case 1: Exact match from the table
    it('should return the exact value when parameters match a table point', () => {
      const value = creep.getValue({ concreteClass: 'C20_C45', parameter: 'phi', t0: 30, humidity: 55, thickness: 20 });
      expect(value).toBe(2.9);
    });

    // Test Case 2: Interpolation on thickness only
    it('should interpolate correctly on thickness', () => {
      // For t0=30, humidity=55: thickness=20 -> 2.9; thickness=60 -> 2.6
      // For thickness=40, expected is the midpoint: (2.9 + 2.6) / 2 = 2.75
      const value = creep.getValue({ concreteClass: 'C20_C45', parameter: 'phi', t0: 30, humidity: 55, thickness: 40 });
      expect(value).toBeCloseTo(2.75);
    });

    // Test Case 3: Interpolation on humidity only
    it('should interpolate correctly on humidity', () => {
      // For t0=30, thickness=20: humidity=55 -> 2.9; humidity=75 -> 2.2
      // For humidity=65, expected is the midpoint: (2.9 + 2.2) / 2 = 2.55
      const value = creep.getValue({ concreteClass: 'C20_C45', parameter: 'phi', t0: 30, humidity: 65, thickness: 20 });
      expect(value).toBeCloseTo(2.55);
    });

    // Test Case 4: Interpolation on t0 only
    it('should interpolate correctly on t0', () => {
      // For humidity=75, thickness=20: t0=5 -> 2.8; t0=30 -> 2.2
      // For t0=15, expected is: 2.8 + (15-5)*(2.2-2.8)/(30-5) = 2.8 - 0.24 = 2.56
      const value = creep.getValue({ concreteClass: 'C20_C45', parameter: 'phi', t0: 15, humidity: 75, thickness: 20 });
      expect(value).toBeCloseTo(2.56);
    });

    // Test Case 5: Trilinear (3D) interpolation
    it('should perform trilinear interpolation correctly', () => {
      // Interpolate for t0=15, humidity=65, thickness=40
      // Step 1: Get value at t0=5, humidity=65, thickness=40 -> 3.1
      // Step 2: Get value at t0=30, humidity=65, thickness=40 -> 2.425
      // Step 3: Interpolate between these two for t0=15
      // Expected: 3.1 + (15-5)*(2.425-3.1)/(30-5) = 3.1 - 0.27 = 2.83
      const value = creep.getValue({ concreteClass: 'C20_C45', parameter: 'phi', t0: 15, humidity: 65, thickness: 40 });
      expect(value).toBeCloseTo(2.83);
    });

    // Test Case 6: Extrapolation (out of bounds)
    it('should return the boundary value when inputs are out of range', () => {
      // t0 < 5 should use t0 = 5
      const value_t0_low = creep.getValue({ concreteClass: 'C50_C90', parameter: 'phi', t0: 1, humidity: 40, thickness: 20 });
      expect(value_t0_low).toBe(2.7);

      // t0 > 60 should use t0 = 60
      const value_t0_high = creep.getValue({ concreteClass: 'C50_C90', parameter: 'phi', t0: 100, humidity: 40, thickness: 20 });
      expect(value_t0_high).toBe(1.7);

      // humidity < 40 should use humidity = 40
      const value_h_low = creep.getValue({ concreteClass: 'C20_C45', parameter: 'phi', t0: 30, humidity: 30, thickness: 20 });
      expect(value_h_low).toBe(3.4);

      // thickness > 60 should use thickness = 60
      const value_t_high = creep.getValue({ concreteClass: 'C20_C45', parameter: 'phi', t0: 30, humidity: 55, thickness: 80 });
      expect(value_t_high).toBe(2.6);
    });

    it('should return undefined if no points exist for a given t0 in the private method', () => {
      // This is an internal check, but good to ensure robustness
      // We can't test the private method directly, but we can test a case that would fail if not handled
      const value = creep.getValue({ concreteClass: 'C20_C45', parameter: 'phi', t0: 999, humidity: 50, thickness: 50 }); // t0=999 doesn't exist
      expect(value).toBeDefined(); // It should extrapolate to the nearest t0, not return undefined.
    });
  });
});
