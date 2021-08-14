#!/usr/bin/env node
import AppServer from './server/AppServer';
import {createServer, Server} from 'http'
import e from 'express';
import Config from './config/Config';

let config: Config = Config.getInstance();
let appServer: e.Application = new AppServer(config).express;

let server: Server = createServer(appServer);

// TODO add some more meaningful below
server.on('error', e => console.log(e));
server.on('listening', () => console.log(server.address()));

server.listen(config.server.port);
