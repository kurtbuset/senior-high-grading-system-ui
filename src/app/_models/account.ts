import { Role } from './role';

export class Account {
    id: string;
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    isActive: boolean
    jwtToken?: string;
    phone?: string;
    address?: string;
    password?: string;
}