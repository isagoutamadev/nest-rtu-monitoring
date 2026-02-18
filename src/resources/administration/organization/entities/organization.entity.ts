import { BaseEntity } from "src/interfaces/base-entity.interface";

export class Organization extends BaseEntity {
    name: string;
    sname: string;
    address: string;
    level: number;
}
