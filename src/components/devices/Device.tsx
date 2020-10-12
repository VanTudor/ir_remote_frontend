import axios from "axios";
import React, { useState } from "react";
import { Accordion, Button, ButtonGroup, Icon, List, Menu, Segment } from "semantic-ui-react";
import { serverHost } from "../../config";
import { IDevice, IDictionary, IIRCommand, IPaginatedResponse } from "../Types";
import IRCommandsList from "./IRCommandsList";


function Device({ device, itemIndex, handleOpenDeletePanelClick }: {
  device: IDevice,
  itemIndex: number,
  handleOpenDeletePanelClick: (device: IDevice) => () => void
}) {
  const [availableCommands, setAvailableCommands]: [IIRCommand[], any] = useState([]);
  const [commandsAccordionOpenMap, setCommandsAccordionOpenMap]: [IDictionary<boolean>, any] = useState({});

  async function getCommands(deviceId: string): Promise<IIRCommand[]> {
    const res = await axios.get<IPaginatedResponse<IIRCommand>>(`${serverHost}/commands?deviceId=${deviceId}&skipFirst=0&maxResultsLength=100`);
    return res.data.rows;
  }
  const handleCommandsAccordionClick = (deviceId: string) => async (e: { preventDefault: () => void; }, data: any) => {
    setCommandsAccordionOpenMap({
      ...commandsAccordionOpenMap,
      [deviceId]: !commandsAccordionOpenMap[deviceId]
    });
    const irCommands: IIRCommand[] = await getCommands(deviceId);
    setAvailableCommands(irCommands);
  }


  return (
    <Segment key={itemIndex}>
      <List>
        <List.Item>
          <List.Content>
            <List.Header>Name: {device.name}</List.Header>
            <ButtonGroup floated={"right"}>
              <Button
                color={"blue"}>Edit</Button>
              <Button
                color={"red"}
                onClick={handleOpenDeletePanelClick(device)}
              >Delete</Button>
            </ButtonGroup>
            <List.Description>Description: {device.description}</List.Description>
            <List.Description>Commands:

              <Accordion>
                <div>
                  <Accordion.Title
                    active={commandsAccordionOpenMap[device.id]}
                    content={<span><Icon name='rss' />Available commands</span>}
                    onClick={handleCommandsAccordionClick(device.id)}
                  />
                  <Accordion.Content
                    active={commandsAccordionOpenMap[device.id]}
                    content={IRCommandsList(availableCommands)}
                  />
                </div>
              </Accordion>

            </List.Description>
          </List.Content>
        </List.Item>
      </List>
      {/*{stringBoolToBool(espDevice.txt.registered) && <Button color="red">Delete</Button>}*/}
    </Segment>
  );
}

export default Device;