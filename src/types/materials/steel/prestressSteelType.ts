import { ValueUnit } from "../../index.js";

export type PrestressingDesignType = "Limited" | "Complete" 

export interface IPrestressingSteelOption {
    label: 'CP 190 RB 9.5' | 'CP 190 RB 12.7' | 'CP 190 RB 15.2'| 'CP 200 RB 9.5' | 'CP 200 RB 12.7' | 'CP 200 RB 15.2' | 'CP 210 RB 9.5' | 'CP 210 RB 12.7' | 'CP 210 RB 15.2'| 'CP 220 RB 9.5' | 'CP 220 RB 12.7' | 'CP 220 RB 15.2' | 'CP 230 RB 9.5' | 'CP 230 RB 12.7' | 'CP 230 RB 15.2'| 'CP 240 RB 9.5' | 'CP 240 RB 12.7' | 'CP 240 RB 15.2';
    fptk: ValueUnit;
    area_min_cordage: ValueUnit;
}

export type AnchoringType = 'active-active' | 'active-passive' | 'passive-active';