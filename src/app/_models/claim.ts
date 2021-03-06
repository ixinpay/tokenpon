import { Vote } from "./vote";
import { Tokenpon } from "./tokenpon";

export class Claim {
    constructor(
        public name: String,
        public businessName: String,
        public street: String,
        public city: String ,
        public state: String ,
        public zip: String ,
        public country: String ,
        public email: String ,
        public phone: String ,
        public webPage: String ,
        public service: String ,
        public servicingArea: String ,
        public businessHour: String ,
        public businessMainCategory: String ,
        public businessSubCategory: String ,
        public postedBy: String ,
        public postedTime: Number ,
        public comments: Comment[],
        public votes: Vote[]
    ) {}
}