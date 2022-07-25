import { Module } from '@nestjs/common';
import { CacheConfigService } from './cache.service';

@Module({
  providers: [CacheConfigService],
})
export class CacheConfigModule {}
