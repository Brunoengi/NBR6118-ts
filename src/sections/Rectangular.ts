import { Distance } from "types/index.js";
import AbstractSection from "./AbstractSection.js";



class Rectangular extends AbstractSection {

    constructor({ base, height }: { base: Distance; height: Distance }) {

        const b = base.value
        const h = height.value

        super([
            { 'x': b / 2, 'y': 0 },
            { 'x': b / 2, 'y': h },
            { 'x': -b / 2, 'y': h },
            { 'x': -b / 2, 'y': 0 },
            { 'x': b / 2, 'y': 0 }
        ])
    }
}

export default Rectangular
