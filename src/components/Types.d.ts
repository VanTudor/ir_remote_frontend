export interface IBonjourServiceWithLastSeen extends  IBonjourService {
  lastSeenInMillis: number;
}

export interface IDictionary<T> {
  [key: string]: T;
}

export interface IPaginatedResponse<T> {
  rows: T[];
  total: number;
}

export interface IRCE {
  id: string;
  hostAddress: string;
  description: string;
  name: string;
}

export interface IBonjourService {
  addresses: string[];
  name: string;
  fqdns: string;
  host: string;
  referer: IBonjourReferer;
  port: number;
  type: 'http';
  protocol: 'tcp' | 'udp';
  subtypes: string[];
  rawTxt: Buffer;
  txt: {
    chipid: string;
    type: "esp8266RemoteEmulator" | string;
    registered: string; // should be boolean but mdns only lets us store strings here
  };
}

export interface IRegisteredRCE extends IBonjourServiceWithLastSeen {
  id: string;
}

export interface IIRCommand {
  name: string;
  irCodeHex: string;
  description: string;
}

export interface IDevice {
  name: string;
  description: string;
  commands: IIRCommand[];
  state: Dictionary<any>; // TODO: make this better
}