import { BaseEntity } from "src/interfaces/base-entity.interface";

export enum TankType {
    BULANAN = 'bulanan',
    HARIAN = 'harian',
};

export class Tank extends BaseEntity {
    id_m_rtu_port: number;
    id_m_tank_form: number;
    name: number;
    type: TankType;
    tank_capacity: number;
    tank_length: number;
    tank_height: number;
    tank_wide: number;
    engine_capacity: number;
    power: number;
    fuel_consumption: number;
}
