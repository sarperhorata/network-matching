import { Controller, Get, Put, Param, Body, UseGuards, Request, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { FileUploadService } from '../common/services/file-upload.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'No file provided' };
    }

    try {
      const fileUrl = await this.fileUploadService.uploadFile(file);

      // Update user's profile photo based on photoType (if provided in body)
      // For MVP, we'll just return the URL
      return { url: fileUrl };
    } catch (error) {
      return { error: 'Failed to upload file' };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/matches')
  async getMatches(@Param('id') id: string) {
    return this.usersService.getUserMatches(id);
  }

  // Admin only endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.update(id, updateUserDto);
  }
}

