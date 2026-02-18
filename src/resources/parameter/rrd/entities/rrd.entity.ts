import { BaseEntity } from "src/interfaces/base-entity.interface";
import { RtuPrometheusAlertConfigData } from "../../rtu/entities/rtu.entity";

export class Rrd extends BaseEntity {
    ip_address: string;
    name: string;
    is_active: number;
}

export class RrdConfigData {
    id: number;
    ip_address: string;
    name: string;
    is_active: number;
    rtus: RtuPrometheusAlertConfigData[]
}
