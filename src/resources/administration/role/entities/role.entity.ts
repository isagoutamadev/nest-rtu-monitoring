import { BaseEntity } from "src/interfaces/base-entity.interface";

export class Role extends BaseEntity {
    name: string;
    description: string;
}
