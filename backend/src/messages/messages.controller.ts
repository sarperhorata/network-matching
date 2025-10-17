import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('userId') userId: string) {
    return this.messagesService.findUserConversations(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: Request, @Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create({ ...createMessageDto, senderId: (req as any).user.id });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.update(id, updateMessageDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversation/:userId1/:userId2')
  async getConversation(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
  ) {
    return this.messagesService.findConversation(userId1, userId2);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count/:userId')
  async getUnreadCount(@Param('userId') userId: string) {
    return this.messagesService.getUnreadCount(userId);
  }
}

