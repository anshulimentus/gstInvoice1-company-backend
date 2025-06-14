export class UpdateItcDto {
    status: 'pending' | 'claimed' | 'rejected';
    approvedBy?: string;
    remarks?: string;
  }
  