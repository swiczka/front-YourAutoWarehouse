import { Service, signal } from '@angular/core';
import { Forklift } from '../components/forklift/forklift';
import { ForkliftLocationEvent } from '../events/ForkliftLocationEvent';
import { ForkliftData } from '../helpers/forklift.helpers';

@Service()
export class ForkliftService {
    forklifts = signal<Map<number, ForkliftData>>(new Map());

    handleLocationEvent(event: ForkliftLocationEvent){
        const forkliftsMap = this.forklifts();
        let forklift = forkliftsMap.get(event.forkliftId);
        if(!forklift){
            forklift = { id: event.forkliftId, 
                            x: event.x, 
                            y: event.y };
            forkliftsMap.set(event.forkliftId, forklift);
        } else {
            forklift.x = event.x;
            forklift.y = event.y;
        }
        this.forklifts.set(new Map(forkliftsMap));}
}
