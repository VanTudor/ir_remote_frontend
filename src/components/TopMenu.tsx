import React, { useEffect, useState } from "react";
import { Menu, Input, Segment, Icon } from "semantic-ui-react";
import Devices from "./devices/Devices";
import RemoteControlEmulators from "./remoteControlEmulators/RemoteControlEmulators";
import { SocketCommsService } from "../services/SocketComms";
import { IBonjourServiceWithLastSeen, IDictionary } from "./Types";

export default function TopMenu() {
  const defaultActiveTabName = "remoteEmulators";
  const [menuActiveItem, setMenuActiveItem] = useState(defaultActiveTabName);
  const [registeredRCEAvailable, setRegisteredRCEAvailable]: [IDictionary<IBonjourServiceWithLastSeen>, any] = useState({});
  const [unregisteredRCEAvailable, setUnregisteredRCEAvailable]: [IDictionary<IBonjourServiceWithLastSeen>, any] = useState({});

  const registeredRCEAvailableRef = React.useRef(registeredRCEAvailable);
  const unregisteredRCEAvailableRef = React.useRef(unregisteredRCEAvailable);
  const socketCommsService = new SocketCommsService();

  const bonjourDevicesAvailableWrappedHandler = (message: IDictionary<IBonjourServiceWithLastSeen>) => {
    socketCommsService.bonjourDevicesAvailableHandler(message, registeredRCEAvailableRef.current, setRegisteredRCEAvailable, unregisteredRCEAvailableRef.current, setUnregisteredRCEAvailable);
  };
  useEffect(() => {
    // @ts-ignore
    socketCommsService.socket.on("BonjourDevicesAvailable", bonjourDevicesAvailableWrappedHandler);
    return () => { socketCommsService.socket.off('BonjourDevicesAvailable', bonjourDevicesAvailableWrappedHandler); };
  }, []);

  useEffect(() => {
    registeredRCEAvailableRef.current = registeredRCEAvailable;
    unregisteredRCEAvailableRef.current = registeredRCEAvailable;
  });

  const handleMenuClick = (e: { preventDefault: () => void }, menuItemProps: { name?: string }) => {
    e.preventDefault();
    const { name } = menuItemProps;
    setMenuActiveItem(name || defaultActiveTabName);
  }

  const renderActiveTab = () => {
    switch(menuActiveItem) {
      case "remoteEmulators":
        return <RemoteControlEmulators
          registeredRCEAvailable={registeredRCEAvailable}
          unregisteredRCEAvailable={unregisteredRCEAvailable}
        />;
      case "devices":
        return <Devices socketCommsService={socketCommsService} onlineRCEIdsList={Object.keys(registeredRCEAvailable)} />;
      // case Devices:
      //   return "Not yet.";
      default:
        return "What.";
    }
  }

  return (
    <div>
      <Menu attached='top' tabular>
        <Menu.Item
          name='remoteEmulators'
          active={menuActiveItem === 'remoteEmulators'}
          onClick={handleMenuClick}
        >
        <Icon name='microchip' />Remote Emulators
        </Menu.Item>
        <Menu.Item
          name='devices'
          active={menuActiveItem === 'devices'}
          onClick={handleMenuClick}
        >
        <Icon name='th' />Devices
        </Menu.Item>
        <Menu.Item
          name='deviceCommands'
          active={menuActiveItem === 'deviceCommands'}
          onClick={handleMenuClick}
        >
        <Icon name='rss' />Device commands
        </Menu.Item>
        <Menu.Menu position='right'>
          <Menu.Item>
            {"Made with <3"}
          </Menu.Item>
        </Menu.Menu>
      </Menu>

      <Segment attached='bottom'>
        {renderActiveTab()}
      </Segment>
    </div>
  );
}