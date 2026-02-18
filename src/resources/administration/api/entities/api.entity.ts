import { BaseEntity } from "src/interfaces/base-entity.interface";
import { Role } from "../../role/entities/role.entity";

export class Api extends BaseEntity {
    name: string;
    token: string;
    expired_at: EpochTimeStamp;
    roles: Role[];
}
