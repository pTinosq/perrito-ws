import { IncomingMessage } from 'http';
import { ipcActionMessage } from 'src/ipc/IpcMessageTypes';
import { WebSocket, WebSocketServer } from 'ws';
import { PerritoClientType, PerritoServerType } from './PerritoTypes';

export interface DaemonResponse {
  name: string;
  message: string;
}

class PerritoDaemon {
  private servers: PerritoServerType[];

  constructor() {
    this.servers = [];
    process.parentPort.on('message', this.handleMessage.bind(this));
    console.info('PerritoDaemon started');
  }

  private handleMessage(e: { data: ipcActionMessage & { correlationId: string } }) {
    const message = e.data;

    switch (message.action) {
      case 'start':
        this.startServer(message.id, message.name, message.host, message.port)
          .then((data) =>
            process.parentPort.postMessage({
              correlationId: message.correlationId,
              data,
              error: null,
            }),
          )
          .catch((error) =>
            process.parentPort.postMessage({
              correlationId: message.correlationId,
              data: null,
              error: error.message,
            }),
          );
        break;
      case 'stop':
        this.stopServer(message.id)
          .then((data) =>
            process.parentPort.postMessage({
              correlationId: message.correlationId,
              data,
              error: null,
            }),
          )
          .catch((error) =>
            process.parentPort.postMessage({
              correlationId: message.correlationId,
              data: null,
              error: error.message,
            }),
          );
        break;
      case 'get-servers':
        process.parentPort.postMessage({
          correlationId: message.correlationId,
          data: this.servers?.map((server) => ({
            id: server.id,
            name: server.name,
            host: server.host,
            port: server.port,
            clients: server.clients.map((client) => ({
              id: client.id,
              request: client.request,
              readyState: client.socket.readyState,
              messages: client.messages,
            })),
          })),
        });
        break;
      case 'send-message':
        this.sendToClient(message.serverId, message.clientId, message.message)
          .then((data) =>
            process.parentPort.postMessage({
              correlationId: message.correlationId,
              data,
              error: null,
            }),
          )
          .catch((error) =>
            process.parentPort.postMessage({
              correlationId: message.correlationId,
              data: null,
              error: error.message,
            }),
          );
        break;
      case 'disconnect-client':
        this.disconnectClient(message.serverId, message.clientId)
          .then((data) =>
            process.parentPort.postMessage({
              correlationId: message.correlationId,
              data,
              error: null,
            }),
          )
          .catch((error) =>
            process.parentPort.postMessage({
              correlationId: message.correlationId,
              data: null,
              error: error.message,
            }),
          );
        break;
      case "restart":
        this.restartServer(message.id)
          .then((data) => {
            process.parentPort.postMessage({
              correlationId: message.correlationId,
              data,
              error: null,
            });
          })
          .catch((error) => {
            process.parentPort.postMessage({
              correlationId: message.correlationId,
              data: null,
              error: error.message,
            });
          });
    }
  }

  private sendRendererUpdate() {
    // Omit the server instance from the data sent to the renderer
    const serversData = this.servers.map((server) => ({
      id: server.id,
      name: server.name,
      host: server.host,
      port: server.port,
      clients: server.clients.map((client) => ({
        id: client.id,
        request: client.request,
        readyState: client.socket.readyState,
        messages: client.messages,
      })), // Omit the socket from the client data
    }));

    process.parentPort.postMessage({ action: 'update-renderer', data: serversData });
  }

  private async disconnectClient(serverId: string, clientId: string): Promise<DaemonResponse> {
    return new Promise((resolve, reject) => {
      const server = this.servers.find((server) => server.id === serverId);
      if (!server) {
        return reject(new Error(`Server with id ${serverId} not found`));
      }

      const client = server.clients.find((client) => client.id === clientId);
      if (!client) {
        return reject(new Error(`Client with id ${clientId} not found`));
      }

      client.socket.close();
      this.sendRendererUpdate();

      resolve({
        name: 'SUCCESS',
        message: `Client with id ${clientId} disconnected from server with id ${serverId}`,
      });
    });
  }

  private async sendToClient(
    serverId: string,
    clientId: string,
    message: string,
  ): Promise<DaemonResponse> {
    return new Promise((resolve, reject) => {
      const server = this.servers.find((server) => server.id === serverId);
      if (!server) {
        return reject(new Error(`Server with id ${serverId} not found`));
      }

      const client = server.clients.find((client) => client.id === clientId);
      if (!client) {
        return reject(new Error(`Client with id ${clientId} not found`));
      }

      if (client.socket.readyState !== WebSocket.OPEN) {
        return reject(new Error(`Client with id ${clientId} is not connected`));
      }

      client.messages.push({ timestamp: Date.now(), data: message, direction: 'outbound' });
      client.socket.send(message);
      this.sendRendererUpdate();
      resolve({
        name: 'SUCCESS',
        message: `Message sent to client with id ${clientId} on server with id ${serverId}`,
      });
    });
  }

  private startServer(
    id: string,
    name: string,
    host: string,
    port: number,
  ): Promise<DaemonResponse> {
    return new Promise((resolve, reject) => {
      if (this.servers.find((server) => server.id === id)) {
        console.error(`Server with id ${id} already exists.`);
        throw new Error(`Server with id ${id} already exists.`);
      }

      // Validate the id, name, host, and port
      if (!id || !name || !host || !port) {
        console.error('Invalid server configuration.');
        throw new Error('Invalid server configuration.');
      }

      const isIdValid = /^[a-z0-9-]+$/.test(id);
      if (!isIdValid) throw new Error('Invalid server id.');

      const isNameValid = /^[a-zA-Z0-9\s]+$/.test(name);
      if (!isNameValid) throw new Error('Invalid server name.');

      const isHostValid = /^[a-zA-Z0-9.-]+$/.test(host);
      if (!isHostValid) throw new Error('Invalid server host.');

      if (port < 0 || port > 65535) {
        throw new Error('Invalid server port.');
      }

      const server = new WebSocketServer({ host, port });

      server.on('error', (error) => {
        console.error(`Error on server ${id}:`, error);
        reject(error); // Reject the promise if there's an error starting the server
      });

      // Resolve the promise once the server starts listening
      server.once('listening', () => {
        this.servers.push({ id, name, host, port, clients: [], server });
        this.sendRendererUpdate();
        console.info(`WebSocket Server with id ${id} started on ws://${host}:${port}`);
        resolve({
          name: 'SUCCESS',
          message: `Server started successfully on ws://${host}:${port} with id ${id}`,
        } as DaemonResponse);
      });

      // Connection handling remains unchanged
      server.on('connection', (ws: WebSocket, req: IncomingMessage) => {
        // const clientData = { id: `Client_${this.servers[id].clients.length + 1}`, socket: ws, request: req }
        const server = this.servers.find((server) => server.id === id);
        const clientData = {
          id: `Client_${server.clients.length + 1}`,
          request: {
            headers: req.headers,
            path: req.url || '/',
            host: server.host,
            port: server.port,
          },
          socket: ws,
          readyState: ws.readyState,
          messages: [],
        } as PerritoClientType;

        server.clients.push(clientData);

        ws.on('message', (message) => {
          const timestamp = Date.now();

          clientData.messages.push({ timestamp, data: message.toString(), direction: 'inbound' });
          this.sendRendererUpdate();
        });

        ws.on('close', () => {
          clientData.readyState = ws.readyState;
          this.sendRendererUpdate();
        });

        this.sendRendererUpdate();
      });

      server.on('close', () => {
        console.info(`WebSocket Server with id ${id} closed`);
        this.servers = this.servers.filter((server) => server.id !== id);
      });
    });
  }

  private stopServer(id: string): Promise<DaemonResponse> {
    return new Promise((resolve, reject) => {
      const serverInstance = this.servers.find((server) => server.id === id);
      if (!serverInstance) {
        return reject(new Error(`Server with id ${id} does not exist.`));
      }

      // Close all client connections
      serverInstance.clients.forEach((client) => {
        client.socket.close();
      });

      serverInstance.server.close((err) => {
        if (err) {
          return reject(err); // Reject the promise if there's an error closing the server
        }
        this.servers = this.servers.filter((server) => server.id !== id);

        console.info(`Stopped WebSocket Server with id ${id}`);
        this.sendRendererUpdate();
        resolve({
          name: 'SUCCESS',
          message: `Server with id ${id} stopped successfully`,
        });
      });
    });
  }

  private restartServer(id: string): Promise<DaemonResponse> {
    return new Promise((resolve, reject) => {
      console.info(`Restarting server with id ${id}`);
      const serverToRestart = this.servers.find((server) => server.id === id);

      this.stopServer(id)
        .then(() => {
          this.startServer(id, serverToRestart.name, serverToRestart.host, serverToRestart.port)
            .then(() => {
              console.info(`Server with id ${id} restarted successfully`);
              resolve({
                name: "SUCCESS",
                message: `Server with id ${id} restarted successfully`,
              });
            })
            .catch((error) => reject(error));
        })
        .catch((error) => reject(error));
    });
  }
}

new PerritoDaemon();
