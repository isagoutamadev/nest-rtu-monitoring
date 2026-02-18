import { BaseEntity } from "src/interfaces/base-entity.interface";
import { Organization } from "../../organization/entities/organization.entity";
import { Exclude } from "class-transformer";
import { Role } from "../../role/entities/role.entity";

export class User extends BaseEntity {
    id_m_organization: number;
    organization?: Organization;
    id_m_api?: number;
    username: string;
    name: string;
    email: string;
    phone: string;
    telegram_id?: number;
    telegram_username?: string;
    description?: string;
    is_ldap: number;
    is_active: number;
    is_telegram_verfied: number;
    is_telegram_approved: number;
    is_email_verified: number;
    profile_picture?: string;
    password: string;
    permissions?: string[]
    roles?: Role[]
}

export class SerializedUser extends User{
    @Exclude()
    password: string;
    constructor (partial: Partial<SerializedUser>) {
        super();
        Object.assign(this, partial);
    }
}