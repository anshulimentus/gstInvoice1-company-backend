import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { InvoiceStatus } from '../enum/invoice-status.enum';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsEnum(InvoiceStatus, {
    message: `status must be one of: ${Object.values(InvoiceStatus).join(', ')}`,
  })
  status?: InvoiceStatus;

  @IsOptional()
  @IsBoolean()
  isClaimedForITC?: boolean;
}
