import React, { useEffect, useState } from "react";
import { Accordion, Button, Form, List, Menu, Segment } from "semantic-ui-react";
import socketIOClient from "socket.io-client";
import { IBonjourServiceWithLastSeen, IDictionary } from "./Types";

const SocketIOEndpoint = "http://127.0.0.1:3001";

function validateForm() {

}

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
              console.log(e.target.value);
              console.log(formDeviceState)
            }}/>
          <Form.Input
            fluid
            label='Description'
            placeholder='Description'
            error={formDeviceState.description ? false : "Please enter a description"}
            onChange={(e) => {
              console.log(e.target.value);
              formDeviceState.description = e.target.value;
              registerDeviceFormState[deviceId] = formDeviceState;
              setRegisterDeviceFormState(registerDeviceFormState);
            }}
          />
        </Form.Group>
        <Form.Button fluid>Submit</Form.Button>
      </Form>
    );
  }

  return(
    <Segment loading={!Boolean(Object.keys(espDevicesAvailable).length)}>
      <h2>List of devices unregistered devices</h2>
        {Object.keys(espDevicesAvailable).map((key, emulatorIndex) =>
          <Segment>
            <List>
              <List.Item>
                <List.Content>
                  <List.Header>Name: {espDevicesAvailable[key].name}</List.Header>
                  <List.Description>Host: {espDevicesAvailable[key].host}</List.Description>
                  <List.Description>Chip ID: {espDevicesAvailable[key].txt.chipid}</List.Description>
                </List.Content>
              </List.Item>
            </List>
            <Accordion vertical>
              <div>
                <Accordion.Title
                  active={accordionActiveIndex === emulatorIndex}
                  content='Register remote control emulator'
                  index={emulatorIndex}
                  onClick={handleAccordionClick}
                />
                <Accordion.Content
                  active={accordionActiveIndex === emulatorIndex}
                  content={SizeForm(espDevicesAvailable[key].name, espDevicesAvailable[key].txt.chipid)}
                />
              </div>
            </Accordion>
          </Segment>
        )}
    </Segment>
  );
}

export default RemoteControlEmulatorsScanner;