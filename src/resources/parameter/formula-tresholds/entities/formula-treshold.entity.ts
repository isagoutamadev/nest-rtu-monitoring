import { BaseEntity } from "src/interfaces/base-entity.interface";

export class FormulaTreshold extends BaseEntity {
    id_m_severity: number;
    id_m_formula: number;
    rule: string;
    label: string;
    duration: number;
    description?: string;
}
