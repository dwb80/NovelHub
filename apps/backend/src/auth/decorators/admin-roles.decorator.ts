import { SetMetadata } from '@nestjs/common';
import { ADMIN_ROLES_KEY } from '../guards/admin-roles.guard';

export const AdminRoles = (...roles: string[]) => SetMetadata(ADMIN_ROLES_KEY, roles);
