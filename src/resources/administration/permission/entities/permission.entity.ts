import { BaseEntity } from "src/interfaces/base-entity.interface";

export class Permission extends BaseEntity{
    name: string;
    description: string;
}
