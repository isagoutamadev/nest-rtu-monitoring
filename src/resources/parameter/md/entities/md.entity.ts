import { BaseEntity, BooleanNumber } from "src/interfaces/base-entity.interface";
import { Rrd } from "../../rrd/entities/rrd.entity";
import { Location } from "src/resources/administration/location/entities/location.entity";
import { Rtu, RtuTelegrafConfigData } from "../../rtu/entities/rtu.entity";

export enum MdStatus {
    NORMAL = 'normal',
    OFF = 'off',
    ERROR = 'error',
}

export class Md extends BaseEntity {
    id_m_rrd: number;
    rrd?: Rrd;
    id_m_location?: number;
    location?: Location;
    id_m_md_backup?: number;
    md_backup?: Md;
    ip_address: string;
    port: number;
    name: string;
    sname: string;
    is_virtual: BooleanNumber;
    is_backup: BooleanNumber;
    status: MdStatus;
}

export class MdConfigData {
    id: number;
    rrd?: {
        ip_address: string,
    }
    id_m_rrd: number;
    ip_address: string;
    port: number;
    name: string;
    sname: string;
    is_virtual: BooleanNumber;
    telegraf_rtus: RtuTelegrafConfigData[]
}
