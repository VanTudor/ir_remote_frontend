import React, { useState } from "react";
import { Accordion, Button, Form, List, Segment, Grid } from "semantic-ui-react";

import { createRemoteControl, deleteRemoteControl } from "../../requests/requests";
import { stringBoolToBool } from "../../utils";
import { IBonjourServiceWithLastSeen, IDictionary } from "../Types";

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

function RemoteControlEmulators({ registeredRCEAvailable, unregisteredRCEAvailable }: {
  registeredRCEAvailable: IDictionary<IBonjourServiceWithLastSeen>,
  unregisteredRCEAvailable: IDictionary<IBonjourServiceWithLastSeen>
}) {
  const [accordionActiveIndex, setAccordionActiveIndex] = useState(null);
  const [registerDeviceFormState, setRegisterDeviceFormState]: [IDictionary<IRegisterDeviceFormState>, any] = useState({});

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
            {Object.values(registeredRCEAvailable).map(generateDevice)}
          </Grid.Column>
          <Grid.Column>
            <h2>List of unregistered devices</h2>
            {Object.values(unregisteredRCEAvailable).map(generateDevice)}
          </Grid.Column>
        </Grid>

      </Segment>
    </div>
  );
}

export default RemoteControlEmulators;
