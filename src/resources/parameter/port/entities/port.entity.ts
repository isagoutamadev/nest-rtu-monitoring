import { BaseEntity, BooleanNumber } from "src/interfaces/base-entity.interface";
import { DeviceType } from "../../device-type/entities/device-type.entity";

export type PortMode = 'digital' | 'analog';

export class Port extends BaseEntity {
    id_m_device_type: number;
    device_type: DeviceType;
    name: string;
    identifier: string;
    mode: PortMode;
    calibration_value: number;
    unit: string;
    description: string;
    is_config_update_required?: boolean;
}
