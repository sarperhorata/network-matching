import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { Tenant } from './entities/tenant.entity';
import { TenantMiddleware } from './middleware/tenant.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  controllers: [TenantsController],
  providers: [TenantsService, TenantMiddleware],
  exports: [TenantsService, TenantMiddleware],
})
export class TenantsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply tenant middleware to all routes
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}

