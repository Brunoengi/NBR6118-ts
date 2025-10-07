import AnchorageLoss from "./AnchorageLoss.js";
import ElasticShorteningLoss from "./ElasticShorteningLoss.js";
import FrictionLoss from "./FrictionLoss.js";
import TimeDependentLoss from "./TimeDependentLoss.js";
import { ValueUnit, ValuesUnit } from "types/index.js";
import { AnchoringType } from "./AnchorageLoss.js";
import { CableGeometry } from "../CableGeometry.js";


class Losses {
    // Immediate Losses
    public anchorageLoss: AnchorageLoss;
    public elasticShorteningLoss: ElasticShorteningLoss;
    public frictionLoss: FrictionLoss;

    // Time-Dependent Losses
    public timeDependentLoss: TimeDependentLoss;

    constructor({ Pi, apparentFrictionCoefficient, anchoring, cableGeometry, Ap, Ep, cableReturn, Ecs, ep, g1, x, width, Ac, Ic, ncable, phi, g2, alphap }: {
        Pi: ValueUnit,
        apparentFrictionCoefficient: number,
        anchoring: AnchoringType,
        cableGeometry: CableGeometry,
        Ap: ValueUnit,
        Ep: ValueUnit,
        cableReturn: ValueUnit,
        Ecs: ValueUnit,
        ep: ValuesUnit,
        g1: ValueUnit,
        x: ValuesUnit,
        width: ValueUnit,
        Ac: ValueUnit,
        Ic: ValueUnit,
        ncable: number,
        phi: number,
        g2: ValueUnit
        alphap: number
    }) {

        this.frictionLoss = new FrictionLoss({ Pi, apparentFrictionCoefficient, anchoring, cableGeometry });
        this.anchorageLoss = new AnchorageLoss({ Patr: this.frictionLoss.Patr, Ap, Ep, cableReturn, tangBeta: this.frictionLoss.beta, anchoring, cableGeometry });
        this.elasticShorteningLoss = new ElasticShorteningLoss({ Ecs, Ep, ep, g1, x, width, Panc: this.anchorageLoss.Panc, Ac, Ic, ncable, Ap })      
        this.timeDependentLoss = new TimeDependentLoss({ phi, x, width, Ac, Ic, ep, g2, P0: this.elasticShorteningLoss.P0, g1, alphap });
    }
}

export default Losses
export type LossesType = InstanceType<typeof Losses>