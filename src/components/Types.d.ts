export interface IBonjourServiceWithLastSeen extends  IBonjourService {
  lastSeenInMillis: number;
}

export interface IDictionary<T> {
  [key: string]: T;
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