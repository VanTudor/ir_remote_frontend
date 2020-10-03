import React, { useEffect, useState } from "react";
import { Accordion, Button, Form, List, Menu, Segment, Grid } from "semantic-ui-react";
import socketIOClient from "socket.io-client";
import { createRemoteControl } from "../requests/requests";
import { stringBoolToBool } from "../utils";
import { IBonjourServiceWithLastSeen, IDictionary } from "./Types";

const SocketIOEndpoint = "http://127.0.0.1:3001";

interface IRegisterDeviceFormState {
  name: string;
  description: string;
}

function RemoteControlEmulatorsScanner() {
  const [espDevicesAvailable, setEspDevicesAvailable]: [IDictionary<IBonjourServiceWithLastSeen>, any] = useState({});
  const [accordionActiveIndex, setAccordionActiveIndex] = useState(null);
  const [registerDeviceFormState, setRegisterDeviceFormState]: [IDictionary<IRegisterDeviceFormState>, any] = useState({});
  useEffect(() => {
  const socket = socketIOClient(SocketIOEndpoint);
  // @ts-ignore
  socket.on("BonjourDevicesAvailable", data => {
    setEspDevicesAvailable(data);
  });
    return () => { socket.disconnect() };
  }, []);


  const handleAccordionClick = (e: { preventDefault: () => void; }, titleProps: { index?: any; }) => {
    e.preventDefault();
    const { index } = titleProps;
    const newIndex = accordionActiveIndex === index ? -1 : index
    setAccordionActiveIndex(newIndex);
  };

  const handleRegisterRemoteEmulatorClick = (deviceId: string) => async (e: { preventDefault: () => void; }, data: any) => {
    e.preventDefault();
    console.log(espDevicesAvailable[deviceId]);
    console.log(registerDeviceFormState[deviceId]);
    await createRemoteControl(registerDeviceFormState[deviceId].name, registerDeviceFormState[deviceId].description, espDevicesAvailable[deviceId].host);
  }

  function generateDevice(espDevice: IBonjourServiceWithLastSeen, itemIndex: number) {
    return (
      <Segment>
        <List>
          <List.Item>
            <List.Content>
              <List.Header>Name: {espDevice.name}</List.Header>
              <List.Description>Host: {espDevice.host}</List.Description>
              <List.Description>Ip addresses: <ul>{espDevice.addresses.map(addr => (<li>{addr}</li>))}</ul></List.Description>
              <List.Description>Chip ID: {espDevice.txt.chipid}</List.Description>
              <List.Description>Registered: {espDevice.txt.registered}</List.Description>
            </List.Content>
          </List.Item>
        </List>
        <Accordion vertical>
          <div>
            <Accordion.Title
              active={accordionActiveIndex === itemIndex}
              content={(stringBoolToBool(espDevice.txt.registered) ? 'Edit' : 'Register') + ' remote control emulator'}
              index={itemIndex}
              onClick={handleAccordionClick}
            />
            <Accordion.Content
              active={accordionActiveIndex === itemIndex}
              content={SizeForm(espDevice.name, espDevice.txt.chipid)}
            />
          </div>
        </Accordion>
        {stringBoolToBool(espDevice.txt.registered) && <Button color="red">Delete</Button>}
      </Segment>
    );
  }

  const SizeForm = (deviceName: string, deviceId: string) => {

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
        <Form.Button fluid onClick={handleRegisterRemoteEmulatorClick(deviceId)}>Submit</Form.Button>
      </Form>
    );
  }

  return(
    <Segment loading={!Boolean(Object.keys(espDevicesAvailable).length)}>
      <Grid columns={2} relaxed="very">
        <Grid.Column>
          <h2>List of registered devices</h2>
          {Object.keys(espDevicesAvailable)
                 .filter(key => stringBoolToBool(espDevicesAvailable[key].txt.registered))
                 .map((key, emulatorIndex) => generateDevice(espDevicesAvailable[key], emulatorIndex))}
        </Grid.Column>
        <Grid.Column>
          <h2>List of unregistered devices</h2>
          {Object.keys(espDevicesAvailable)
                 .filter(key => !stringBoolToBool(espDevicesAvailable[key].txt.registered))
                 .map((key, emulatorIndex) => generateDevice(espDevicesAvailable[key], emulatorIndex))}
        </Grid.Column>
      </Grid>

    </Segment>
  );
}

export default RemoteControlEmulatorsScanner;