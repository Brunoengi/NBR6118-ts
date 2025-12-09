import { Stress } from "types/index.js";
import { Steel as ISteel } from "types/materials/steel/index.js";


export const options: readonly {
    label: ISteel['name'];
    fyk: Stress
}[] = [
        { label: 'CA-25', fyk: { value: 25, unit: 'kN/cm²' } },
        { label: 'CA-50', fyk: { value: 50, unit: 'kN/cm²' } },
        { label: 'CA-60', fyk: { value: 60, unit: 'kN/cm²' } }
    ];

// Automatically generate the label type from the options array.
// This ensures that if 'options' is updated, this type updates automatically.
export type SteelLabel = ISteel['name'];

class Steel {
    public readonly label: SteelLabel;
    public readonly fyk: Stress;
    public readonly fyd: Stress;
    public readonly E: Stress;

    constructor(label: ISteel['name']) {
        this.label = label;
        const selectedOption = options.find(option => option.label === label);

        // This check is mostly for type safety, as the SteelLabel type should prevent invalid labels.
        if (selectedOption) {
            this.fyk = selectedOption.fyk;
            this.fyd = {
                value: this.fyk.value / 1.15,
                unit: this.fyk.unit
            };
        } else {
            // This error is now theoretically unreachable if using the SteelLabel type.
            throw new Error("Invalid steel label");
        }
        this.E = this.calculate_E()
    }

    calculate_E(E: Stress = { value: 20000, unit: 'kN/cm²' }): Stress {
        return {
            value: E.value,
            unit: E.unit
        }
    }
}

export default Steel;