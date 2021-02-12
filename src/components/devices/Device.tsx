import axios from "axios";
import React, { useEffect, useState } from "react";
import { Accordion, Button, ButtonGroup, Form, Icon, List, Segment } from "semantic-ui-react";
import { io } from "socket.io-client";
import { serverHost, SocketIOEndpoint } from "../../config";
import { deleteDevice } from "../../requests/requests";
import { stringBoolToBool } from "../../utils";
import DeleteByIdButtonWithConfirm from "../DeleteByIdButtonWithConfirm";
import { IDevice, IDictionary, IIRCodeDetectedEvent, IIRCommand, IPaginatedResponse } from "../Types";
import CreateIrCommandForm from "./createIrCommandForm";
import IRCommandsList from "./IRCommandsList";


function Device({ device, deleteConfirmCallback, itemIndex }: {
  device: IDevice,
  itemIndex: number,
  deleteConfirmCallback: () => Promise<any>
}) {
  console.log('AAA', device);
  const [availableCommands, setAvailableCommands]: [IIRCommand[], any] = useState([]);
  const [commandsAccordionOpenMap, setCommandsAccordionOpenMap]: [IDictionary<boolean>, any] = useState({});
  const [irCodesAccordionMap, setIrCodesAccordionMap]: [IDictionary<boolean>, any] = useState({});

  async function getCommands(deviceId: string): Promise<IIRCommand[]> {
    const res = await axios.get<IPaginatedResponse<IIRCommand>>(`${serverHost}/commands?deviceId=${deviceId}&skipFirst=0&maxResultsLength=100`);
    return res.data.rows;
  }
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
      const irCommands: IIRCommand[] = await getCommands(deviceId);
      setAvailableCommands(irCommands);
    }
  }

  let RCEIdDetectedCodeMap: { [k: string]: string }, setRCEIdDetectedCodeMap: any;
  [RCEIdDetectedCodeMap, setRCEIdDetectedCodeMap] = useState({});
  useEffect(() => {
    const socket = io(SocketIOEndpoint, {
      transports: ["polling", "websocket"],
      withCredentials: true,
      extraHeaders: {
        "Access-Control-Allow-Origin": "*"
      },
      auth: { clientType: "FE" }
    });
    socket.on("IRCodeDetected", (IRCodeDetectedEvent: IIRCodeDetectedEvent) => {
      console.log(IRCodeDetectedEvent);
      setRCEIdDetectedCodeMap({
        ...RCEIdDetectedCodeMap,
        [IRCodeDetectedEvent.RCEId]: parseInt(IRCodeDetectedEvent.IRCode, 10).toString(16)
      })
    })
    return () => { socket.disconnect() };
  }, []);


  return (
    <Segment key={itemIndex}>
      <List>
        <List.Item>
          <List.Content>
            <List.Header>Name: {device.name}</List.Header>
            <ButtonGroup floated={"right"}>
              <Button
                color={"blue"}>Edit</Button>
              {/*<Button*/}
              {/*  color={"red"}*/}
              {/*  onClick={handleOpenDeletePanelClick(device)}*/}
              {/*>Delete</Button>*/}
              <DeleteByIdButtonWithConfirm
                entityName="device"
                extraConfirmText="Deleting this will also remove all associated IR commands."
                deleteMethod={() => deleteDevice(device.id)}
                deleteConfirmCallback={deleteConfirmCallback}
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
                    content={IRCommandsList(device.id, availableCommands)}
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