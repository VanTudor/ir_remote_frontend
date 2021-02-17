import { io } from "socket.io-client";
import { Socket } from "socket.io-client/build/socket";
import { SocketIOEndpoint } from "../config";
import { stringBoolToBool } from "../utils";
import { IBonjourServiceWithLastSeen, IDictionary } from "../components/Types";


export class SocketCommsService {
  public socket: Socket;
  constructor() {
    this.socket = io(SocketIOEndpoint, {
      transports: ["polling", "websocket"],
      withCredentials: true,
      extraHeaders: {
        "Access-Control-Allow-Origin": "*"
      },
      auth: { clientType: "FE" }
    });
  }

  public bonjourDevicesAvailableHandler(visibleRCEDeviceDictionary: IDictionary<IBonjourServiceWithLastSeen>, registeredRCEAvailable: IDictionary<IBonjourServiceWithLastSeen>, setRegisteredRCEAvailable: any, unregisteredRCEAvailable: IDictionary<IBonjourServiceWithLastSeen>, setUnregisteredRCEAvailable: any) {
    let newRegisteredRCEAvailable: IDictionary<IBonjourServiceWithLastSeen> = {};
    let newUnregisteredRCEAvailable: IDictionary<IBonjourServiceWithLastSeen> = {};
    Object.keys(visibleRCEDeviceDictionary).forEach(k => {
      if (stringBoolToBool(visibleRCEDeviceDictionary[k].txt.registered)) {
        newRegisteredRCEAvailable[k] = visibleRCEDeviceDictionary[k];

        delete unregisteredRCEAvailable[k];
      } else {
        newUnregisteredRCEAvailable[k] = visibleRCEDeviceDictionary[k]
        delete registeredRCEAvailable[k];
      }
    });
    setRegisteredRCEAvailable({
      ...registeredRCEAvailable,
      ...newRegisteredRCEAvailable
    });
    setUnregisteredRCEAvailable({
      ...unregisteredRCEAvailable,
      ...newUnregisteredRCEAvailable
    });
  }
}