import AbstractSection from "./AbstractSection.js";
import { Distance } from "types/index.js";

class T extends AbstractSection {

    constructor({ bf, hf, bw, h }: { bf: Distance, hf: Distance, bw: Distance, h: Distance }) {
        super([
            { 'x': -bw.value / 2, 'y': 0 },                           
            { 'x': bw.value / 2, 'y': 0 },                            
            { 'x': bw.value / 2, 'y': h.value - hf.value },           
            { 'x': bf.value / 2, 'y': h.value - hf.value },           
            { 'x': bf.value / 2, 'y': h.value },                      
            { 'x': -bf.value / 2, 'y': h.value },                     
            { 'x': -bf.value / 2, 'y': h.value - hf.value },            
            { 'x': -bw.value / 2, 'y': h.value - hf.value },             
            { 'x': -bw.value / 2, 'y': 0 }                                     
        ])
    }
}

export default T
