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

/** 
 * const retangulo = ({b, h}: Isectionretangulo) => {
    const points = [
                    {'x':-b/2, 'y':0},           //point 1
                    {'x':b/2, 'y':0},          //point 2
                    {'x':b/2, 'y':h},         //point 3
                    {'x':-b/2, 'y':h},          //point 4
                    {'x':-b/2, 'y':0}            //point 5
                ]
    
    return points
}

const t = ({bf, hf, bw, h}: Isectiont) => {
    const points = [
        {'x':-bw/2, 'y':0},                           //point 1
        {'x':bw/2, 'y':0},                            //point 2
        {'x':bw/2, 'y':h-hf},                         //point 3
        {'x':bf/2, 'y':h-hf},                         //point 4
        {'x':bf/2, 'y':h},                            //point 5
        {'x':-bf/2, 'y':h},                           //point 6
        {'x':-bf/2, 'y':h-hf},                        //point 7
        {'x':-bw/2, 'y':h-hf},                        //point 8 
        {'x':-bw/2, 'y':0}                            //point 9          
    ]
    return points
}

const tmisulatriangular = ({bf, hf, bw, h, bmis, hmis}: Isectiontmisulatriangular) => {
    const points = [
        {'x':-bw/2, 'y':0},                           //point 1
        {'x':bw/2, 'y':0},                            //point 2
        {'x':bw/2, 'y':h-hf-hmis},                    //point 3
        {'x':bw/2 + bmis, 'y':h-hf},                  //point 4
        {'x':bf/2, 'y':h-hf},                         //point 5
        {'x':bf/2, 'y':h},                            //point 6
        {'x':-bf/2, 'y':h},                           //point 7
        {'x':-bf/2, 'y':h-hf},                        //point 8
        {'x':-bw/2 - bmis, 'y':h-hf},                 //point 9
        {'x':-bw/2, 'y':h-hf-hmis},                   //point 10
        {'x':-bw/2, 'y':0}                            //point 11
    ]
    return points
}

const i = ({bf, hf, bw, h, bi, hi}: Isectioni) => {
    const points = [
        {'x':-bi/2, 'y':0},                           //point 1
        {'x':bi/2, 'y':0},                            //point 2 
        {'x':bi/2, 'y':hi},                           //point 3
        {'x':bw/2, 'y':hi},                           //point 4
        {'x':bw/2, 'y':h-hf},                         //point 5
        {'x':bf/2, 'y':h-hf},                         //point 6
        {'x':bf/2, 'y':h},                            //point 7
        {'x':-bf/2, 'y':h},                           //point 8
        {'x':-bf/2, 'y':h-hf},                        //point 9
        {'x':-bw/2, 'y':h-hf},                        //point 10
        {'x':-bw/2, 'y':hi},                          //point 11
        {'x':-bi/2, 'y':hi},                          //point 12
        {'x':-bi/2, 'y':0}                            //point 13
    ]
    return points
}

const imisulatriangular = ({bf, hf, bw, h, bi, hi, bmissup, hmissup, bmisinf, hmisinf}: Isectionimisulatriangular) => {
    const points = [
        {'x':-bi/2, 'y':0},                          
        {'x':bi/2, 'y':0},                           
        {'x':bi/2, 'y':hi},   
        {'x':bw/2 + bmisinf, 'y':hi},       
        {'x':bw/2, 'y':hi + hmisinf},  
        {'x':bw/2, 'y':h-hf-hmissup},
        {'x':bw/2 + bmissup, 'y':h-hf},
        {'x':bf/2, 'y':h-hf},
        {'x':bf/2, 'y':h},
        {'x':-bf/2, 'y':h},
        {'x':-bf/2, 'y':h-hf},
        {'x':-bw/2 - bmissup, 'y':h-hf},
        {'x':-bw/2, 'y':h-hf-hmissup},
        {'x':-bw/2, 'y':hi + hmisinf},
        {'x':-bw/2 - bmisinf, 'y':hi},
        {'x':-bi/2, 'y':hi},
        {'x':-bi/2, 'y':0}                         
    ]
    return points
}
 * 
*/