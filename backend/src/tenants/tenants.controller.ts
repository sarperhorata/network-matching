import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantsService, CreateTenantDto, UpdateTenantDto } from './tenants.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { TenantGuard } from './middleware/tenant.middleware';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  @ApiResponse({ status: 409, description: 'Subdomain already exists' })
  async create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all tenants (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all tenants' })
  async findAll() {
    return this.tenantsService.findAll();
  }

  @Get('current')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get current tenant info' })
  @ApiResponse({ status: 200, description: 'Current tenant information' })
  async getCurrentTenant(@Request() req) {
    return req.tenant;
  }

  @Get('current/theme')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get current tenant theme' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tenant theme configuration',
    schema: {
      example: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
        fontFamily: 'Inter',
        borderRadius: '0.5rem'
      }
    }
  })
  async getCurrentTheme(@Request() req) {
    return req.tenant?.theme || {};
  }

  @Get('current/statistics')
  @UseGuards(TenantGuard, JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current tenant statistics' })
  @ApiResponse({ status: 200, description: 'Tenant usage statistics' })
  async getCurrentStatistics(@Request() req) {
    return this.tenantsService.getStatistics(req.tenant.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get tenant by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Tenant details' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update tenant (Admin only)' })
  @ApiResponse({ status: 200, description: 'Tenant updated successfully' })
  async update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Put(':id/theme')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update tenant theme' })
  @ApiResponse({ status: 200, description: 'Theme updated successfully' })
  async updateTheme(
    @Param('id') id: string,
    @Body()
    theme: {
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      fontFamily?: string;
      borderRadius?: string;
    },
  ) {
    return this.tenantsService.updateTheme(id, theme);
  }

  @Put(':id/branding')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update tenant branding' })
  @ApiResponse({ status: 200, description: 'Branding updated successfully' })
  async updateBranding(
    @Param('id') id: string,
    @Body() branding: { logoUrl?: string; faviconUrl?: string },
  ) {
    return this.tenantsService.updateBranding(id, branding);
  }

  @Post(':id/upgrade')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upgrade tenant plan (Admin only)' })
  @ApiResponse({ status: 200, description: 'Plan upgraded successfully' })
  async upgradePlan(@Param('id') id: string, @Body() body: { plan: string }) {
    return this.tenantsService.upgradePlan(id, body.plan as any);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete tenant (Admin only)' })
  @ApiResponse({ status: 200, description: 'Tenant deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}

