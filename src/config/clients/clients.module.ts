import { Module } from '@nestjs/common';
import { ClientsMQTTConfigService } from './clients.mqtt.service';

@Module({
  providers: [ClientsMQTTConfigService],
})
export class ClientsConfigModule {}
