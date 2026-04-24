import { SetMetadata } from '@nestjs/common';

export interface OperationLogOptions {
  action: string;
  resourceType: string;
  getResourceId?: (args: any[]) => string;
  getDetails?: (args: any[], result: any) => any;
}

export const OPERATION_LOG_KEY = 'operation_log';

export const OperationLog = (options: OperationLogOptions) =>
  SetMetadata(OPERATION_LOG_KEY, options);
