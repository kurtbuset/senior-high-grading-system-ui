import { Role } from './role';

export class Account {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    isActive: boolean
    jwtToken?: string;
    lrn_number: string
    school_year: string
}