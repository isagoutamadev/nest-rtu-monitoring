import { BaseEntity } from "src/interfaces/base-entity.interface";
import { Md } from "../../md/entities/md.entity";
import { Location } from "src/resources/administration/location/entities/location.entity";
import { RtuPort } from "../../rtu-port/entities/rtu-port.entity";
import { Organization } from "src/resources/administration/organization/entities/organization.entity";
import { PortMode } from "../../port/entities/port.entity";

type RtuStatus = 'normal' | 'alert' | 'off' | 'pending';

export class Rtu extends BaseEntity {
    id_m_regional?: number;
    regional?: Organization;
    id_m_witel?: number;
    witel?: Organization;
    id_m_datel?: number;
    datel?: Organization;
    id_m_md: number;
    md?: Md 
    id_m_location: number
    location?: Location;
    ip_address: string;
    name: string;
    sname: string;
    status: RtuStatus;
    description?: string;
    is_config_update_required?: boolean;
    config_telegraf_updated_at: number;
    config_alert_port_updated_at: number;
    config_alert_formula_updated_at: number;
    last_required_telegraf_config_update: number;
    last_required_alert_port_config_update: number;
    last_required_alert_formula_config_update: number;
    ports?: RtuPort[]
}

export class RtuTelegrafConfigData {
    id: number;
    uuid: string;
    ip_address: string;
    sname: string;
    id_m_regional: number;
    id_m_witel: number;
    id_m_datel: number;
    id_m_location: number;
    ports?: {
        identifier: string,
        mode: PortMode;
        metrics: string,
        no_port: string,
        calibration_value: number,
    }[]
}

export class RtuPrometheusAlertConfigData {
    id: number;
    sname: string;
    treshold_ports?: {
        id_m_rtu_port: number,
        id_m_port: number;
        id_m_port_treshold: number,
        id_m_severity: number,
        rule: string,
        metrics: string,
        duration: number,
    }[];
    treshold_formulas?: {
        uuid_m_rtu_formula: string,
        id_m_formula_trehold: number,
        id_m_severity: number,
        rule: string,
        metrics: string,
        duration: number,
    }[];
    treshold_formula_ports?: {
        uuid_m_rtu_port_formula: string,
        id_m_formula_trehold: number,
        id_m_severity: number,
        rule: string,
        metrics: string,
        duration: number,
    }[];
}

export const conditionsRequireUpdateConfig = [
    'rtu.last_required_telegraf_config_update >= rtu.config_telegraf_updated_at',
    'rtu.last_required_alert_port_config_update >= rtu.config_alert_port_updated_at',
    'rtu.last_required_alert_formula_config_update >= rtu.config_alert_formula_updated_at',
];
