import { BaseEntity } from "src/interfaces/base-entity.interface";
import { Formula } from "../../formula/entities/formula.entity";

export class TankForm extends BaseEntity{
    name: string;
    formula?: Formula;
}
