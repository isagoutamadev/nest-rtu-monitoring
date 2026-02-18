import { BaseEntity } from "src/interfaces/base-entity.interface";

export class Tag extends BaseEntity {
    name: string;
    description?: string;
}
