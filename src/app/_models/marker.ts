export class Marker {
    constructor(
        public lat: number,
        public lng: number,
        public label: string,
        public tooltip: any,
        public draggable: boolean
    ){}
  }