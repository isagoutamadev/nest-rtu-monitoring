import { BaseEntity, BooleanNumber } from "src/interfaces/base-entity.interface";
import { PortMode } from "../../port/entities/port.entity";

export class Formula extends BaseEntity {
    identifier: string;
    name: string;
    mode: PortMode;
    formula: string;
    unit: string;
    is_specific_port: BooleanNumber;
    description?: string;
}
