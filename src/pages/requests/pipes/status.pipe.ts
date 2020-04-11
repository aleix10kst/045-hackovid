import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: 'status'
})
export class StatusPipe implements PipeTransform {

  transform(value: any, ...args): any {
    switch (value) {
      case 'pending':
        return 'Pendent d\'acceptació';
      case 'accepted':
        return 'Acceptada';
      case 'completed':
        return 'Completada';
    }
  }

}
