import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Verify JWT token from auth
      const token = client.handshake.auth?.token;
      if (token) {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get('JWT_SECRET', 'your-secret-key'),
        });
        (client as any).userId = payload.sub;
        this.logger.log(`Client connected: ${client.id} (User: ${payload.sub})`);
      } else {
        this.logger.warn(`Client connected without token: ${client.id}`);
      }
    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}:`, error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);
  }

  emitTimeLogUpdate(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('time-log-update', data);
  }

  emitAppUsageUpdate(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('app-usage-update', data);
  }

  emitScreenshotUpdate(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('screenshot-update', data);
  }
}

