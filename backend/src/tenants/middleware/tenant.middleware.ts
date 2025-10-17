import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';

// Extend Express Request to include tenant
declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
      tenantId?: string;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenant = await this.resolveTenant(req);

    if (tenant) {
      req.tenant = tenant;
      req.tenantId = tenant.id;

      // Add tenant ID to response headers for debugging
      res.setHeader('X-Tenant-Id', tenant.id);
      res.setHeader('X-Tenant-Subdomain', tenant.subdomain);
    }

    next();
  }

  private async resolveTenant(req: Request): Promise<Tenant | null> {
    // 1. Try to get tenant from subdomain
    const host = req.get('host') || '';
    const subdomain = this.extractSubdomain(host);

    if (subdomain) {
      const tenant = await this.tenantRepository.findOne({
        where: { subdomain, isActive: true },
      });

      if (tenant) {
        return tenant;
      }
    }

    // 2. Try to get tenant from custom domain
    const customDomain = this.extractCustomDomain(host);
    if (customDomain) {
      const tenant = await this.tenantRepository.findOne({
        where: { customDomain, isActive: true },
      });

      if (tenant) {
        return tenant;
      }
    }

    // 3. Try to get tenant from header (for API clients)
    const tenantHeader = req.get('X-Tenant-Id') || req.get('X-Tenant-Subdomain');
    if (tenantHeader) {
      const tenant = await this.tenantRepository.findOne({
        where: [
          { id: tenantHeader, isActive: true },
          { subdomain: tenantHeader, isActive: true },
        ],
      });

      if (tenant) {
        return tenant;
      }
    }

    // 4. Default tenant for development (optional)
    if (process.env.NODE_ENV === 'development' && !subdomain) {
      return this.tenantRepository.findOne({
        where: { subdomain: 'default' },
      });
    }

    return null;
  }

  private extractSubdomain(host: string): string | null {
    // Remove port if present
    const hostname = host.split(':')[0];

    // Split by dots
    const parts = hostname.split('.');

    // Check if it's a subdomain (e.g., client1.oniki.net)
    // Minimum 3 parts for subdomain: [subdomain, domain, tld]
    if (parts.length >= 3) {
      const subdomain = parts[0];

      // Ignore common non-tenant subdomains
      const ignoreList = ['www', 'api', 'app', 'admin', 'localhost'];
      if (!ignoreList.includes(subdomain)) {
        return subdomain;
      }
    }

    return null;
  }

  private extractCustomDomain(host: string): string | null {
    // Remove port if present
    const hostname = host.split(':')[0];

    // Skip if it's our main domain or localhost
    if (
      hostname.includes('oniki.net') ||
      hostname === 'localhost' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('127.0.0.')
    ) {
      return null;
    }

    return hostname;
  }
}

/**
 * Tenant Guard - Ensures request has a valid tenant
 */
import { CanActivate, ExecutionContext, Injectable as GuardInjectable } from '@nestjs/common';

@GuardInjectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.tenant) {
      throw new NotFoundException('Tenant not found. Please check your subdomain or custom domain.');
    }

    return true;
  }
}

