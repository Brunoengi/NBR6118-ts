import AbstractSection from "./AbstractSection.js";
import { Distance } from "types/index.js";

class I extends AbstractSection {

    constructor({bf, hf, bw, h, bi, hi}: {bf: Distance, hf: Distance, bw: Distance, h: Distance, bi: Distance, hi: Distance}) {
        super([
        {'x':-bi.value/2, 'y':0},                           //point 1
        {'x':bi.value/2, 'y':0},                            //point 2 
        {'x':bi.value/2, 'y':hi.value},                           //point 3
        {'x':bw.value/2, 'y':hi.value},                           //point 4
        {'x':bw.value/2, 'y':h.value-hf.value},                         //point 5
        {'x':bf.value/2, 'y':h.value-hf.value},                         //point 6
        {'x':bf.value/2, 'y':h.value},                            //point 7
        {'x':-bf.value/2, 'y':h.value},                           //point 8
        {'x':-bf.value/2, 'y':h.value-hf.value},                        //point 9
        {'x':-bw.value/2, 'y':h.value-hf.value},                        //point 10
        {'x':-bw.value/2, 'y':hi.value},                          //point 11
        {'x':-bi.value/2, 'y':hi.value},                          //point 12
        {'x':-bi.value/2, 'y':0}                            //point 13
    ])

    }
}

export default I