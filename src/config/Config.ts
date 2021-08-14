import path from 'path'
import {readFileSync} from 'fs';

export default class Config extends Object {
  feeds: Feeds
  server: ConfigServer
  log: string
  private static instance: Config;
  private constructor() {
    let environment = process.env['NODE_ENV'] || 'dev';
    let configPath = process.env['CONFIG_PATH'] || `./env/${environment}.config.json`;
    let configContents = readFileSync(path.resolve(configPath), {encoding: 'utf-8'});
    let configObject = JSON.parse(configContents);
    super();
    this.feeds = {
      user: "user",
      password: "changeit",
      port: 3001,
      host: "http://127.0.0.1/",
      keepAlive: true,
      ssl: false,
      path: "./feeds"
    };
    this.server = {
      port: 3000,
      version: '0'
    };
    this.log = configObject.log;
    Object.assign(this.feeds, configObject.feeds);
    Object.assign(this.server, configObject.server);
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new Config();
    }
    return this.instance;
  }
}

export interface ConfigServer {
  port: number;
  version: string
}

export interface Feeds {
  user: string;
  password: string;
  port: number;
  host: string;
  keepAlive: boolean;
  ssl: boolean;
  path: string;
}
