import { Distance } from "types/index.js";
import AbstractSection from "./AbstractSection.js";

class T_triangularCorbel extends AbstractSection {
    constructor ({ bf, hf, bw, h, bmis, hmis } : { bf: Distance, hf: Distance, bw: Distance, h: Distance, bmis: Distance, hmis: Distance}){
        super([
        {'x':-bw.value/2, 'y':0},                           //point 1
        {'x':bw.value/2, 'y':0},                            //point 2
        {'x':bw.value/2, 'y':h.value-hf.value-hmis.value},                    //point 3
        {'x':bw.value/2 + bmis.value, 'y':h.value-hf.value},                  //point 4
        {'x':bf.value/2, 'y':h.value-hf.value},                         //point 5
        {'x':bf.value/2, 'y':h.value},                            //point 6
        {'x':-bf.value/2, 'y':h.value},                           //point 7
        {'x':-bf.value/2, 'y':h.value-hf.value},                        //point 8
        {'x':-bw.value/2 - bmis.value, 'y':h.value-hf.value},                 //point 9
        {'x':-bw.value/2, 'y':h.value-hf.value-hmis.value},                   //point 10
        {'x':-bw.value/2, 'y':0}                            //point 11
    ])
    }
}

export default T_triangularCorbel
