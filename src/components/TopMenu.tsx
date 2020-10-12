import React, { useState } from "react";
import { Menu, Input, Segment, Icon } from "semantic-ui-react";
import Devices from "./devices/Devices";
import RemoteControlEmulatorsScanner from "./RemoteControlEmulatorsScanner";
import { IBonjourServiceWithLastSeen, IDictionary } from "./Types";

export default function TopMenu() {
  const defaultActiveTabName = "remoteEmulators";
  const [menuActiveItem, setMenuActiveItem] = useState(defaultActiveTabName);

  const handleMenuClick = (e: { preventDefault: () => void }, menuItemProps: { name?: string }) => {
    e.preventDefault();
    const { name } = menuItemProps;
    setMenuActiveItem(name || defaultActiveTabName);
  }

  const renderActiveTab = () => {
    switch(menuActiveItem) {
      case "remoteEmulators":
        return <RemoteControlEmulatorsScanner />;
      case "devices":
        return <Devices />;
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