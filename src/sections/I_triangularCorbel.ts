import AbstractSection from "./AbstractSection.js";
import { Distance } from "types/index.js";
import { IBidimensionalPoint } from "geometric-props";

class I_triangularCorbel extends AbstractSection {

    constructor ({ bf, hf, bw, h, bi, hi, bmissup, hmissup, bmisinf, hmisinf}: { bf: Distance, hf: Distance, bw: Distance, h: Distance, bi: Distance, hi: Distance, bmissup: Distance, hmissup: Distance, bmisinf: Distance, hmisinf: Distance}) {
        const points: IBidimensionalPoint[] = [];

        // Bottom-left corner
        points.push({ x: -bi.value / 2, y: 0 });
        points.push({ x: bi.value / 2, y: 0 });
        points.push({ x: bi.value / 2, y: hi.value });

        // Bottom corbel (right side)
        if (bmisinf.value > 0 && hmisinf.value > 0) {
            points.push({ x: bw.value / 2 + bmisinf.value, y: hi.value });
            points.push({ x: bw.value / 2, y: hi.value + hmisinf.value });
        } else {
            points.push({ x: bw.value / 2, y: hi.value });
        }

        // Web (right side)
        if (bmissup.value > 0 && hmissup.value > 0) {
            points.push({ x: bw.value / 2, y: h.value - hf.value - hmissup.value });
            points.push({ x: bw.value / 2 + bmissup.value, y: h.value - hf.value });
        } else {
            points.push({ x: bw.value / 2, y: h.value - hf.value });
        }

        // Top flange
        points.push({ x: bf.value / 2, y: h.value - hf.value });
        points.push({ x: bf.value / 2, y: h.value });
        points.push({ x: -bf.value / 2, y: h.value });
        points.push({ x: -bf.value / 2, y: h.value - hf.value });

        // Top corbel (left side)
        if (bmissup.value > 0 && hmissup.value > 0) {
            points.push({ x: -bw.value / 2 - bmissup.value, y: h.value - hf.value });
            points.push({ x: -bw.value / 2, y: h.value - hf.value - hmissup.value });
        } else {
            points.push({ x: -bw.value / 2, y: h.value - hf.value });
        }

        // Web and bottom corbel (left side)
        if (bmisinf.value > 0 && hmisinf.value > 0) {
            points.push({ x: -bw.value / 2, y: hi.value + hmisinf.value });
            points.push({ x: -bw.value / 2 - bmisinf.value, y: hi.value });
        } else {
            points.push({ x: -bw.value / 2, y: hi.value });
        }

        // Close polygon
        points.push({ x: -bi.value / 2, y: hi.value });
        points.push({ x: -bi.value / 2, y: 0 });

        super(points);

    }
}

export default I_triangularCorbel