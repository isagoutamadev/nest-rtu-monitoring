import { Severity } from "src/interfaces/base-entity.interface";

export type RecordRtuStatus = Record<number, {
    id: number,
    status: 'alert' | 'normal' | 'off',
}>;

export type RecordRtuPortFormulaSeverity = Record<number, {
    severity: Severity
}>;

export type RtuPortAndFormula = {
    id_m_rtu?: number,
    id_m_rtu_port?: number,
    id_m_rtu_port_formula?: number,
}
