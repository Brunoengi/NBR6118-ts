import { ValueUnit } from "types/index.js"

const options = [{
        label: 'CP 190 RB 9.5',
        fptk: {
            value: 1900,
            unit: 'MPa'
        },
        area_min_cordage: {
            value: 0.55,
            unit: 'cm²'
        }
    },
    {
        label: 'CP 190 RB 12.7',
        fptk: {
            value: 1900,
            unit: 'MPa'
        },
        area_min_cordage: {
            value: 0.99,
            unit: 'cm²'
        }
    },
    {
        label: 'CP 190 RB 15.2',
        fptk: {
            value: 1900,
            unit: 'MPa'
        },
        area_min_cordage: {
            value: 1.40,
            unit: 'cm²'
        }
    },
    {
        label: 'CP 210 RB 9.5',
        fptk: {
            value: 2100,
            unit: 'MPa'
        },
        area_min_cordage: {
            value: 0.55,
            unit: 'cm²'
        }
    },
    {
        label: 'CP 210 RB 12.7',
        fptk: {
            value: 2100,
            unit: 'MPa'
        },
        area_min_cordage: {
            value: 0.99,
            unit: 'cm²'
        }
    },
    {
        label: 'CP 210 RB 15.2',
        fptk: {
            value: 2100,
            unit: 'MPa'
        },
        area_min_cordage: {
            value: 1.40,
            unit: 'cm²'
        }
    },
    {
        label: 'CP 220 RB 9.5',
        fptk: {
            value: 2200,
            unit: 'MPa'
        },
        area_min_cordage: {
            value: 0.55,
            unit: 'cm²'
        }
    },
    {
        label: 'CP 220 RB 12.7',
        fptk: {
            value: 2200,
            unit: 'MPa'
        },
        area_min_cordage: {
            value: 0.99,
            unit: 'cm²'
        }
    },
    {
        label: 'CP 220 RB 15.2',
        fptk: {
            value: 2200,
            unit: 'MPa'
        },
        area_min_cordage: {
            value: 1.40,
            unit: 'cm²'
        }
    },
    {
        label: 'CP 230 RB 9.5',
        fptk: {
            value: 2300,
            unit: 'MPa'
        },
        area_min_cordage: {
            value: 0.55,
            unit: 'cm²'
        }
    },
    {
        label: 'CP 230 RB 12.7',
        fptk: {
            value: 2300,
            unit: 'MPa'
        },
        area_min_cordage: {
            value: 0.99,
            unit: 'cm²'
        }
    },
    {
        label: 'CP 230 RB 15.2',
        fptk: {
            value: 2300,
            unit: 'MPa'
        },
        area_min_cordage: {
            value: 1.40,
            unit: 'cm²'
        }
    },
    {
        label: 'CP 240 RB 9.5',
        fptk: {
            value: 2400,
            unit: 'MPa'
        },
        area_min_cordage: {
            value: 0.55,
            unit: 'cm²'
        }
    },
    {
        label: 'CP 240 RB 12.7',
        fptk: {
            value: 2400,
            unit: 'MPa'
        },
        area_min_cordage: {
            value: 0.99,
            unit: 'cm²'
        }
    },
    {
        label: 'CP 240 RB 15.2',
        fptk: {
            value: 2400,
            unit: 'MPa'
        },
        area_min_cordage: {
            value: 1.40,
            unit: 'cm²'
        }
    }
]

// Gera um tipo com todos os labels disponíveis para ter um autocompletar mais robusto
export type PrestressingSteelLabel = typeof options[number]['label'];
export type RelaxationType = "RB" | "RN";

interface IPrestressingSteel {
    relaxation: RelaxationType
    nominalDiameter: ValueUnit
    area_min_cordage: ValueUnit
    fptk: ValueUnit
}

class PrestressingSteel implements IPrestressingSteel {
    public label: PrestressingSteelLabel;
    public fptk: ValueUnit;
    public relaxation: RelaxationType;
    public nominalDiameter: ValueUnit;
    public area_min_cordage: ValueUnit;

    constructor({label}: {label: PrestressingSteelLabel}) {
        this.validate(label);
        this.label = label;

        const steelData = options.find(opt => opt.label === this.label);

        if (!steelData) {
            // Este erro não deve ocorrer se PrestressingSteelLabel for usado corretamente
            throw new Error(`Aço de protensão com o label "${this.label}" não encontrado.`);
        }

        this.fptk = steelData.fptk;
        this.area_min_cordage = steelData.area_min_cordage;

        // Extrai informações do label
        const parts = this.label.split(' ');
        this.relaxation = parts[2] as RelaxationType;
        this.nominalDiameter = { value: parseFloat(parts[3]), unit: 'mm' };
    }

    /**
     * Valida o formato do nome do aço de protensão.
     * Ex: 'CP 190 RB 9.5'
     * @param name O nome/label do aço a ser validado.
     */
    private validate(name: string): void {
        const regex = /^CP\s\d{3}\s(RB|RN)\s\d+(\.\d+)?$/;
        if (!regex.test(name)) {
            throw new Error(`Nome do aço de protensão inválido: "${name}". O formato esperado é 'CP XXX (RB|RN) D.D'.`);
        }
    }
}

export default PrestressingSteel;