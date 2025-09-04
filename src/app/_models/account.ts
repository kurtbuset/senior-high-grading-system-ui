import { Role } from './role';

export class Account {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    isActive: boolean;
    school_id?: string; // For students - their student number like '2025-00001'
    jwtToken?: string;
}