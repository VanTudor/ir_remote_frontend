import React, { useEffect, useState } from "react";
import { Accordion, Button, Form, List, Menu, Segment, Grid, Dropdown } from "semantic-ui-react";
import socketIOClient from "socket.io-client";
import { serverHost } from "../config";
import { createDevice, createRemoteControl } from "../requests/requests";
import { stringBoolToBool } from "../utils";
import { IBonjourServiceWithLastSeen, IDevice, IDictionary, IPaginatedResponse, IRCE, IRegisteredRCE } from "./Types";
import axios from 'axios';

const SocketIOEndpoint = "http://127.0.0.1:3001";

interface IRegisterDeviceFormState {
  name: string;
  description: string;
  remoteControlEmulatorId: string;
}


// (key, emulatorIndex) => generateDevice(espDevicesAvailable[key], emulatorIndex)
async function getDevices(rceId?: string): Promise<IDevice[]> {
    if (typeof rceId !== undefined) {
      // TODO: add rceId based filtering in BE and here
    }
    const res = await axios.get<IPaginatedResponse<IDevice>>(`${serverHost}/devices?skipFirst=${0}&maxResultsLength=100`);
    console.log(res.data);
    return res.data.rows;
}

async function getRCEs(): Promise<IRCE[]> {
  const res = await axios.get<IPaginatedResponse<IRCE>>(`${serverHost}/remoteControlEmulators?skipFirst=${0}&maxResultsLength=100`);
  console.log(res.data);
  return res.data.rows;
}


function Devices() {
  const [createAccordionActive, setCreateAccordionActive]: [boolean, any] = useState(false);
  const [devicesAvailable, setDevicesAvailable]: [IDevice[], any] = useState([]);
  const [RCEsAvailable, setRCEsAvailable]: [IRCE[], any] = useState([]);
  const [accordionActiveIndex, setAccordionActiveIndex] = useState(null);
  const [registerDeviceFormState, setRegisterDeviceFormState]: [IRegisterDeviceFormState, any] = useState({} as IRegisterDeviceFormState);

  useEffect(() => {
    async function fetchData() {
      const devices = await getDevices();
      const rces = await getRCEs();
      setRCEsAvailable(rces);
      setDevicesAvailable(devices);
    }
    fetchData();
  }, []);

  const handleCreateDeviceClick = (name: string, description: string, rceId: string) => async (e: { preventDefault: () => void; }, data: any) => {
    e.preventDefault();
    console.log('[handleCreateDeviceClick]', name, description, rceId);
    await createDevice(name, description, rceId);
  };

  const handleAccordionClick = (e: { preventDefault: () => void; }, data: any) => {
    setCreateAccordionActive(!createAccordionActive);
  }


  function generateDevice(device: IDevice, itemIndex: number) {
    return (
      <Segment>
        <List>
          <List.Item>
            <List.Content>
              <List.Header>Name: {device.name}</List.Header>
              <List.Description>Description: {device.description}</List.Description>
              {/*<List.Description>Ip addresses: <ul>{device.addresses.map(addr => (<li>{addr}</li>))}</ul></List.Description>*/}
              {/*<List.Description>Chip ID: {device.txt.chipid}</List.Description>*/}
              {/*<List.Description>Registered: {device.txt.registered}</List.Description>*/}
            </List.Content>
          </List.Item>
        </List>
        {/*{stringBoolToBool(espDevice.txt.registered) && <Button color="red">Delete</Button>}*/}
      </Segment>
    );
  }

  const CreateDeviceForm = () => {
    const formDeviceState = registerDeviceFormState || {};
    return (
      <Form>
        <Form.Group widths='equal'>
          <Form.Input
            fluid
            label='Name'
            placeholder={'Name'}
            error={registerDeviceFormState.name ? false : "Please enter a name"}
            onChange={(e) => {
              setRegisterDeviceFormState({
                ...registerDeviceFormState,
                name: e.target.value
              });
            }}/>
          <Form.Input
            fluid
            label='Description'
            placeholder='Description'
            error={registerDeviceFormState.description ? false : "Please enter a description"}
            onChange={(e) => {
              setRegisterDeviceFormState({
                ...registerDeviceFormState,
                description: e.target.value
              });
            }}
          />
        </Form.Group>
        <Form.Group widths='equal'>

          <Dropdown
            fluid
            // labeled='Remote control emulator'
            labeled
            placeholder='Select remote control emulator to be associated to'
            search
            selection
            error={!Boolean(registerDeviceFormState.remoteControlEmulatorId)}
            options={RCEsAvailable.map((rce, i) => ({
              key: i,
              value: rce.id,
              text: rce.name
            }))}
            onChange={(e: any, {name, value}) => {
              console.log('ID!!!', name, value);
              console.log(e.target.name);
              console.log(e.target.textContent);
              setRegisterDeviceFormState({
                ...registerDeviceFormState,
                remoteControlEmulatorId: value
              });
            }}
            // onChange={(e) => {
            //   formDeviceState.remoteControlEmulatorId = e.target.value;
            //   console.log(formDeviceState.name);
            //   // setRegisterDeviceFormState({
            //   //   ...registerDeviceFormState,
            //   //   description: e.target.value
            //   // });
            // }}
          />
        </Form.Group>
        <Form.Button
          fluid
          onClick={handleCreateDeviceClick(registerDeviceFormState.name, registerDeviceFormState.description, registerDeviceFormState.remoteControlEmulatorId)}
          disabled={!registerDeviceFormState.name || !registerDeviceFormState.description}
        >Submit</Form.Button>
      </Form>
    );
  }

  return(
    <Segment /*loading={!Boolean(devicesAvailable.length)}*/>
          <h2>List of available devices</h2>
          <Button color="green">Create device</Button>
          <Accordion>
            <div>
              <Accordion.Title
                active={createAccordionActive}
                content={'Create remote control emulator'}
                onClick={handleAccordionClick}
              />
              <Accordion.Content
                active={createAccordionActive}
                content={CreateDeviceForm()}
              />
            </div>
          </Accordion>
          {devicesAvailable.map(generateDevice)}

    </Segment>
  );
}

export default Devices;