import { BaseEntity } from "src/interfaces/base-entity.interface";

export class Location extends BaseEntity{
    name: string;
    sname: string;
    pic: number;
    id_m_organization: number;
    latitude: number;
    longitude: number;
    address: string;
}
