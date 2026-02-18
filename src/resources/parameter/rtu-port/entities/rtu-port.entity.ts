import { BaseEntity } from "src/interfaces/base-entity.interface";
import { Rtu } from "../../rtu/entities/rtu.entity";
import { Port } from "../../port/entities/port.entity";
import { Tank } from "../../tank/entities/tank.entity";

export class RtuPort extends BaseEntity{
    id_m_device_topology?: number;
    id_m_rtu: number;
    rtu?: Rtu;
    id_m_port: number;
    port?: Port;
    is_monitored: number;
    is_notified: number;
    no_port: string;
    description: string;
    metrics: string;
    tank?: Tank;
}
