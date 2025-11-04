import { PrestressingDesignType } from "types/prestressSteelType.js";
import { AbstractELS, IELS } from "./AbstractELS.js";
import { ValueUnit, VerificationResult } from "types/index.js";

interface IELSF extends IELS {
    type: PrestressingDesignType;
}

export class ELSF extends AbstractELS {
    public readonly type: PrestressingDesignType;
    public readonly verification_sigma1: VerificationResult;
    public readonly verification_sigma2: VerificationResult;
    public readonly limit_tensions: {
        sigma1: ValueUnit;
        sigma2: ValueUnit;
    };

    constructor(inputs: IELSF) {
        super(inputs);
        this.type = inputs.type;

        if (this.type === 'Limited') {
            this.limit_tensions = {
                sigma1: { value: this.concrete.fctf.value, unit: 'kN/cm²' },
                sigma2: { value: -0.6 * this.concrete.fck.value, unit: 'kN/cm²' }
            };
        } else if (this.type === 'Complete') {
            this.limit_tensions = {
                sigma1: { value: 0, unit: 'kN/cm²' }, // For Complete, it's decompression check under Rare combination
                sigma2: { value: -0.6 * this.concrete.fck.value, unit: 'kN/cm²' }
            };
        } else {
            throw new Error('Invalid type. Must be "Limited" or "Complete".');
        }

        // Verification for crack formation (tension limit)
        this.verification_sigma1 = this.verification_sigma({
            sigma: this.sigma1,
            limit: this.limit_tensions.sigma1,
            operator: (stressValue, limitValue) => stressValue <= limitValue // stress must be <= fctf
        });

        // Verification for excessive compression
        this.verification_sigma2 = this.verification_sigma({
            sigma: this.sigma2,
            limit: this.limit_tensions.sigma2,
            operator: (stressValue, limitValue) => stressValue >= limitValue // stress must be >= limit
        });
    }
}

export default ELSF;
