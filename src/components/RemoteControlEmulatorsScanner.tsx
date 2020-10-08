import React, { useEffect, useState } from "react";
import { Accordion, Button, Form, List, Segment, Grid } from "semantic-ui-react";
import socketIOClient from "socket.io-client";
import { SocketIOEndpoint } from "../config";
import { createRemoteControl } from "../requests/requests";
import { stringBoolToBool } from "../utils";
import { IBonjourServiceWithLastSeen, IDictionary } from "./Types";

interface IRegisterDeviceFormState {
  name: string;
  description: string;
}

const handleRegisterRemoteEmulatorClick = (name: string, description: string, host: string) => async (e: { preventDefault: () => void; }, _data: any) => {
  e.preventDefault();
  await createRemoteControl(name, description, host);
}

function RemoteControlEmulatorsScanner() {
  const [accordionActiveIndex, setAccordionActiveIndex] = useState(null);
  const [registerDeviceFormState, setRegisterDeviceFormState]: [IDictionary<IRegisterDeviceFormState>, any] = useState({});

  const [registeredRCEAvailable, setRegisteredRCEAvailable]: [IBonjourServiceWithLastSeen[], any] = useState([]);
  const [unregisteredRCEAvailable, setUnregisteredRCEAvailable]: [IBonjourServiceWithLastSeen[], any] = useState([]);
  useEffect(() => {
    const socket = socketIOClient(SocketIOEndpoint);
    // @ts-ignore
    socket.on("BonjourDevicesAvailable", visibleRCEDeviceDictionary => {
      Object.keys(visibleRCEDeviceDictionary).forEach(k => {
        if (stringBoolToBool(visibleRCEDeviceDictionary[k].txt.registered)) {
          registeredRCEAvailable.push(visibleRCEDeviceDictionary[k]);
          setRegisteredRCEAvailable(registeredRCEAvailable);
        } else {
          unregisteredRCEAvailable.push(visibleRCEDeviceDictionary[k]);
          setUnregisteredRCEAvailable(unregisteredRCEAvailable);
        }
      })
    });
    return () => { socket.disconnect() };
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
        <Form.Button fluid onClick={handleRegisterRemoteEmulatorClick(deviceName, deviceId, host)}>Submit</Form.Button>
      </Form>
    );
  }

  function generateDevice(rce: IBonjourServiceWithLastSeen, itemIndex: number) {
    return (
      <Segment>
        <List>
          <List.Item>
            <List.Content>
              <List.Header>Name: {rce.name}</List.Header>
              <List.Description>Host: {rce.host}</List.Description>
              <List.Description>Ip addresses: <ul>{rce.addresses.map(addr => (<li>{addr}</li>))}</ul></List.Description>
              <List.Description>Chip ID: {rce.txt.chipid}</List.Description>
              <List.Description>Registered: {rce.txt.registered}</List.Description>
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
        {stringBoolToBool(rce.txt.registered) && <Button color="red">Delete</Button>}
      </Segment>
    );
  }

  return(
    <Segment loading={registeredRCEAvailable.length + unregisteredRCEAvailable.length === 0}>
      <Grid columns={2} relaxed="very">
        <Grid.Column>
          <h2>List of registered devices</h2>
          {registeredRCEAvailable.map((rRCE, index) => generateDevice(rRCE, index))}
        </Grid.Column>
        <Grid.Column>
          <h2>List of unregistered devices</h2>
          {unregisteredRCEAvailable.map((rRCE, index) => generateDevice(rRCE, index))}
        </Grid.Column>
      </Grid>

    </Segment>
  );
}

export default RemoteControlEmulatorsScanner;