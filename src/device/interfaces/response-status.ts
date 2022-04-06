import { HttpStatus } from '@nestjs/common';

export interface ResponseStatus {
  status: HttpStatus;
  topic: string;
  message: string;
  data?: any;
}
