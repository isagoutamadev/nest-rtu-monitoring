import { UUID } from "crypto";
import { User } from "src/resources/administration/user/entities/user.entity";

export class BaseEntity {
    id: number;
    uuid: UUID;
    created_at: EpochTimeStamp;
    created_by: number;
    creator?: User;
    updated_at: EpochTimeStamp;
    updated_by: number;
    updater?: User;
    is_deleted?: BooleanNumber;
}

export class Severity {
    id: number;
    title: string;
}

export type BooleanNumber = 1 | 0;
export type BooleanString = 'true' | 'false';