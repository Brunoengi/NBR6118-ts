import { ValueUnit, Steel as SteelInterface } from "types/index.js";


export const options: readonly {
  label: SteelInterface['name'];
  fyk: { value: number; unit: string };
}[] = [
  { label: 'CA-50', fyk: { value: 50, unit: 'kN/cm²' } },
  { label: 'CA-60', fyk: { value: 60, unit: 'kN/cm²' } }
];

// Automatically generate the label type from the options array.
// This ensures that if 'options' is updated, this type updates automatically.
export type SteelLabel = typeof options[number]['label'];

class Steel {
    public readonly label: SteelLabel;
    public readonly fyk: ValueUnit;
    public readonly fyd: ValueUnit;

    constructor(label: SteelLabel) {
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
    }
}

export default Steel;