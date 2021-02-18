import React, { Dispatch, SetStateAction, useState } from "react";
import { Accordion, Button, ButtonGroup, Icon, List, Segment } from "semantic-ui-react";

import { deleteDevice, getCommands } from "../../requests/requests";
import DeleteByIdButtonWithConfirm from "../common/DeleteByIdButtonWithConfirm";
import { IDevice, IDictionary, IIRCodeDetectedEvent, IIRCommand, IPaginatedResponse } from "../Types";
import CreateIrCommandForm from "./createIrCommandForm";
import IRCommandsList from "./IRCommandsList";

const fetchAndUpdateCommandsList = async (deviceId: string, setAvailableCommands: Dispatch<SetStateAction<{}>>): Promise<void> => {
  const irCommands: IIRCommand[] = (await getCommands(deviceId)).data.rows;
  setAvailableCommands(irCommands);
}

function Device({ device, itemIndex, RCEIdDetectedCodeMap, deleteConfirmCallback, reachable = true}: {
  device: IDevice;
  itemIndex: number;
  RCEIdDetectedCodeMap: { [k: string]: string };
  deleteConfirmCallback: () => Promise<any>;
  reachable?: boolean;
}) {

  const [availableCommands, setAvailableCommands]: [IIRCommand[], any] = useState([]);
  const [commandsAccordionOpenMap, setCommandsAccordionOpenMap]: [IDictionary<boolean>, Dispatch<SetStateAction<{}>>] = useState({});
  const [irCodesAccordionMap, setIrCodesAccordionMap]: [IDictionary<boolean>, Dispatch<SetStateAction<{}>>] = useState({});

  const handleIrAccordionClick = (devideId: string) => (_e: { preventDefault: () => void; }, _data: any) => {
    setIrCodesAccordionMap({
      ...irCodesAccordionMap,
      [devideId]: !irCodesAccordionMap[devideId]
    })
  };
  const handleCommandsAccordionClick = (deviceId: string) => async (_e: { preventDefault: () => void; }, _data: any) => {
    setCommandsAccordionOpenMap({
      ...commandsAccordionOpenMap,
      [deviceId]: !commandsAccordionOpenMap[deviceId]
    });
    // don't call if the accordion is being closed
    if (!commandsAccordionOpenMap[deviceId]) {
      await fetchAndUpdateCommandsList(deviceId, setAvailableCommands);
    }
  }

  return (
    <Segment key={itemIndex}>
      <List>
        <List.Item>
          <List.Content>
            <List.Header>Name: {device.name}</List.Header>
            <ButtonGroup floated={"right"}>
              <Button color={"blue"}
                      disabled={!reachable}>
                Edit
              </Button>
              {/*<Button*/}
              {/*  color={"red"}*/}
              {/*  onClick={handleOpenDeletePanelClick(device)}*/}
              {/*>Delete</Button>*/}
              <DeleteByIdButtonWithConfirm
                entityName="device"
                extraConfirmText="Deleting this will also remove all associated IR commands."
                deleteMethod={() => deleteDevice(device.id)}
                deleteConfirmCallback={deleteConfirmCallback}
                disabled={!reachable}
              />
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
                    content={IRCommandsList(device.id, availableCommands, () => fetchAndUpdateCommandsList(device.id, setAvailableCommands))}
                  />
                </div>
              </Accordion>

            </List.Description>
            <List.Description>
              RCE:
              {device.remoteControlEmulator ?
               (<span>
                  <List.Item>Name: {device.remoteControlEmulator.name}</List.Item>
                  <List.Item>Description: {device.remoteControlEmulator.description}</List.Item>
                  <List.Item>
                    <Accordion>
                      <div>
                        <Accordion.Title
                          active={irCodesAccordionMap[device.id]}
                          content={"Last detected IR Code: " + (RCEIdDetectedCodeMap[device.remoteControlEmulator.id] || "null")}
                          onClick={handleIrAccordionClick(device.id)}
                        />
                        <Accordion.Content
                          active={irCodesAccordionMap[device.id]}
                          content={
                            <CreateIrCommandForm
                              irCodeHex={RCEIdDetectedCodeMap[device.remoteControlEmulator.id]}
                              deviceId={device.id}
                              fetchCommands={() => fetchAndUpdateCommandsList(device.id, setAvailableCommands)}
                            />
                          }
                        />
                      </div>
                    </Accordion>
                  </List.Item>
                 </span>)
              : "No RCE assigned"}
            </List.Description>
          </List.Content>
        </List.Item>
      </List>
      {/*{stringBoolToBool(espDevice.txt.registered) && <Button color="red">Delete</Button>}*/}
    </Segment>
  );
}

export default Device;