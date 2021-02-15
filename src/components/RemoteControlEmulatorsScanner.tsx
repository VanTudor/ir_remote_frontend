import React, { useEffect, useState } from "react";
import { Accordion, Button, Form, List, Segment, Grid } from "semantic-ui-react";
import { io } from "socket.io-client";
import { SocketIOEndpoint } from "../config";
import { createRemoteControl, deleteRemoteControl } from "../requests/requests";
import { stringBoolToBool } from "../utils";
import { IBonjourService, IBonjourServiceWithLastSeen, IDictionary, IIRCodeDetectedEvent } from "./Types";

interface IRegisterDeviceFormState {
  name: string;
  description: string;
}

const handleRegisterRemoteEmulatorClick = (name: string, description: string, host: string) => async (e: { preventDefault: () => void; }, _data: any) => {
  e.preventDefault();
  await createRemoteControl(name, description, host);
}

const handleDeregisterRemoteEmulatorClick = (rceId: string) => async (e: { preventDefault: () => void; }, _data: any) => {
  e.preventDefault();
  await deleteRemoteControl(rceId);
}

const socket = io(SocketIOEndpoint, {
  transports: ["polling", "websocket"],
  withCredentials: true,
  extraHeaders: {
    "Access-Control-Allow-Origin": "*"
  },
  auth: { clientType: "FE" }
});

const bonjourDevicesAvailableHandler = (visibleRCEDeviceDictionary: IDictionary<IBonjourServiceWithLastSeen>, registeredRCEAvailable: IDictionary<IBonjourServiceWithLastSeen>, setRegisteredRCEAvailable: any, unregisteredRCEAvailable: IDictionary<IBonjourServiceWithLastSeen>, setUnregisteredRCEAvailable: any) => {
  let newRegisteredRCEAvailable: IDictionary<IBonjourServiceWithLastSeen> = {};
  let newUnregisteredRCEAvailable: IDictionary<IBonjourServiceWithLastSeen> = {};
  Object.keys(visibleRCEDeviceDictionary).forEach(k => {
    if (stringBoolToBool(visibleRCEDeviceDictionary[k].txt.registered)) {
      newRegisteredRCEAvailable[k] = visibleRCEDeviceDictionary[k];
      console.log(registeredRCEAvailable);
      // setRegisteredRCEAvailable({
      //   ...registeredRCEAvailable,
      //   [k]: visibleRCEDeviceDictionary[k]
      // });
      // console.log(registeredRCEAvailable);
      delete unregisteredRCEAvailable[k];
    } else {
      newUnregisteredRCEAvailable[k] = visibleRCEDeviceDictionary[k]
      // setUnregisteredRCEAvailable({
      //   ...unregisteredRCEAvailable,
      //   [k]: visibleRCEDeviceDictionary[k]
      // });
      delete registeredRCEAvailable[k];
    }
    // console.log(registeredRCEAvailable, unregisteredRCEAvailable);
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

function RemoteControlEmulatorsScanner() {
  const [accordionActiveIndex, setAccordionActiveIndex] = useState(null);
  const [registerDeviceFormState, setRegisterDeviceFormState]: [IDictionary<IRegisterDeviceFormState>, any] = useState({});

  const [registeredRCEAvailable, setRegisteredRCEAvailable]: [IDictionary<IBonjourServiceWithLastSeen>, any] = useState({});
  const [unregisteredRCEAvailable, setUnregisteredRCEAvailable]: [IDictionary<IBonjourServiceWithLastSeen>, any] = useState({});

  const registeredRCEAvailableRef = React.useRef(registeredRCEAvailable);
  const unregisteredRCEAvailableRef = React.useRef(unregisteredRCEAvailable);
  useEffect(() => {
      console.log(registeredRCEAvailable);
    registeredRCEAvailableRef.current = registeredRCEAvailable;
    unregisteredRCEAvailableRef.current = registeredRCEAvailable;
  });

  useEffect(() => {
    console.log(registeredRCEAvailable);

    const bonjourDevicesAvailableWrappedHandler = (message: IDictionary<IBonjourServiceWithLastSeen>) => {
      bonjourDevicesAvailableHandler(message, registeredRCEAvailableRef.current, setRegisteredRCEAvailable, unregisteredRCEAvailableRef.current, setUnregisteredRCEAvailable);
  };
    // @ts-ignore
    socket.on("BonjourDevicesAvailable", bonjourDevicesAvailableWrappedHandler);
    return () => { socket.off('BonjourDevicesAvailable', bonjourDevicesAvailableWrappedHandler); };
  }, []);

  const handleAccordionClick = (e: { preventDefault: () => void; }, titleProps: { index?: any; }) => {
    e.preventDefault();
    const { index } = titleProps;
    const newIndex = accordionActiveIndex === index ? -1 : index
    setAccordionActiveIndex(newIndex);
  };

  const RegisterRCEForm = (deviceName: string, deviceId: string, host: string) => {
    const formDeviceState = registerDeviceFormState[deviceId] || {};
    return (
      <Form>
        <Form.Group widths='equal'>
          <Form.Input
            fluid
            label='Name'
            placeholder={deviceName}
            error={formDeviceState.name ? false : "Please enter a name"}
            onChange={(e) => {
              formDeviceState.name = e.target.value;
              registerDeviceFormState[deviceId] = formDeviceState;
              setRegisterDeviceFormState(registerDeviceFormState);
            }}/>
          <Form.Input
            fluid
            label='Description'
            placeholder='Description'
            error={formDeviceState.description ? false : "Please enter a description"}
            onChange={(e) => {
              formDeviceState.description = e.target.value;
              registerDeviceFormState[deviceId] = formDeviceState;
              setRegisterDeviceFormState(registerDeviceFormState);
            }}
          />
        </Form.Group>
        <Form.Button fluid onClick={handleRegisterRemoteEmulatorClick(formDeviceState.name, formDeviceState.description, host)}>Submit</Form.Button>
      </Form>
    );
  }

  function generateDevice(rce: IBonjourServiceWithLastSeen, itemIndex: number) {
    return (
      <Segment key={itemIndex}>
        <List>
          <List.Item>
            <List.Content>
              <List.Header>Name: {rce.name}</List.Header>
              <List.Description>Host: {rce.host}</List.Description>
              <List.Description>Ip addresses: <ul>{rce.addresses.map((addr, index) => (<li key={index}>{addr}</li>))}</ul></List.Description>
              <List.Description>Chip ID: {rce.txt.chipid}</List.Description>
              <List.Description>Registered: {rce.txt.registered}</List.Description>
              <List.Description>ID: {rce.txt.id}</List.Description>
            </List.Content>
          </List.Item>
        </List>
        <Accordion>
          <div>
            <Accordion.Title
              active={accordionActiveIndex === itemIndex}
              content={(stringBoolToBool(rce.txt.registered) ? 'Edit' : 'Register') + ' remote control emulator'}
              index={itemIndex}
              onClick={handleAccordionClick}
            />
            <Accordion.Content
              active={accordionActiveIndex === itemIndex}
              content={RegisterRCEForm(rce.name, rce.txt.chipid, rce.host)}
            />
          </div>
        </Accordion>
        {stringBoolToBool(rce.txt.registered) && <Button color="red" onClick={handleDeregisterRemoteEmulatorClick(rce.txt.id)}>Delete</Button>}
      </Segment>
    );
  }
  return(
    <div>
      <Segment loading={Object.keys(registeredRCEAvailable).length + Object.keys(unregisteredRCEAvailable).length === 0}>
        <Grid columns={2} relaxed="very">
          <Grid.Column>
            <h2>List of registered devices</h2>
            {Object.keys(registeredRCEAvailable).map((k, index) => {
              // console.log(registeredRCEAvailableRef);
              return generateDevice(registeredRCEAvailable[k], index);
            })}
          </Grid.Column>
          <Grid.Column>
            <h2>List of unregistered devices</h2>
            {Object.keys(unregisteredRCEAvailable).map((k, index) => generateDevice(unregisteredRCEAvailable[k], index))}
          </Grid.Column>
        </Grid>

      </Segment>
    </div>
  );
}

export default RemoteControlEmulatorsScanner;