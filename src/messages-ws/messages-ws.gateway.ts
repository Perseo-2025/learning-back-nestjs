import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';


@WebSocketGateway({cors: true,namespace: ''})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect{
  
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly JwtService: JwtService
  ) {}

  //leyendo un token
  async handleConnection(client: Socket) {
    const token = client.handshake.headers.autentication as string;
    let payload: JwtPayload;

    try {
      payload = this.JwtService.verify(token)
      await this.messagesWsService.registerClient(client, payload.id);   
    } catch (error) {
        client.disconnect();
        return
    }
    // console.log({payload});
      // console.log('Cliente conectado', client.id);
      

      this.wss.emit('clients-updated', this.messagesWsService.getConnectedClient() )
      
  }

  handleDisconnect(client: Socket) {
    // console.log('Cliente desconectado', client.id);
    this.messagesWsService.removeClient(client.id);
    // console.log({conectados: this.messagesWsService.getConnectedClient()});
  }

  //Escuchar al cliente
  @SubscribeMessage('message-from-client')
  onMessageFromClient( client: Socket, payload: NewMessageDto ){
    
    //message-from-server
    //Emite únicamente al cliente
    // client.emit('message-from-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message!!'
    // });

    //Emitir a todos menos al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy Yo!',
    // message: payload.message || 'no-message!!'
    // });


    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'no-message!!'
    });

  }

  
 
}
