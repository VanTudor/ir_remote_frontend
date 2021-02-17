import React, { useEffect, useState } from "react";
import { Accordion, Form, Segment, Dropdown, Checkbox } from "semantic-ui-react";
import { CheckboxProps } from "semantic-ui-react/dist/commonjs/modules/Checkbox/Checkbox";
import { io } from "socket.io-client";
import { serverHost, SocketIOEndpoint } from "../../config";
import { createDevice } from "../../requests/requests";
import Device from "./Device";
import {
  IDevice, IIRCodeDetectedEvent,
  IPaginatedResponse,
  IRCE
} from "../Types";
import axios from 'axios';

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
  const [registerDeviceFormState, setRegisterDeviceFormState]: [IRegisterDeviceFormState, any] = useState({} as IRegisterDeviceFormState);

  async function fetchAndSaveData() {
    const devices = await getDevices();
    const rces = await getRCEs();
    setRCEsAvailable(rces);
    setDevicesAvailable(devices);
  }

  useEffect(() => {
    fetchAndSaveData();
  }, []);


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

  const handleCreateDeviceClick = (name: string, description: string, rceId: string) => async (e: { preventDefault: () => void; }, _data: any) => {
    e.preventDefault();
    console.log('[handleCreateDeviceClick]', name, description, rceId);
    await createDevice(name, description, rceId);
    await fetchAndSaveData();
  };

  const handleAccordionClick = (e: { preventDefault: () => void; }, _data: any) => {
    setCreateAccordionActive(!createAccordionActive);
  }

  const CreateDeviceForm = () => {
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
            onChange={(e: any, { _name, value}) => {
              setRegisterDeviceFormState({
                ...registerDeviceFormState,
                remoteControlEmulatorId: value
              });
            }}
          />
        </Form.Group>
        <Form.Button
          fluid
          onClick={handleCreateDeviceClick(registerDeviceFormState.name, registerDeviceFormState.description, registerDeviceFormState.remoteControlEmulatorId)}
          disabled={!registerDeviceFormState.name || !registerDeviceFormState.description}
          color={"green"}
        >Submit</Form.Button>
      </Form>
    );
  }

  return(
    <Segment>
      <h2>List of available devices</h2>
      <Accordion>
        <div>
          <Accordion.Title
            active={createAccordionActive}
            content={'Create device'}
            onClick={handleAccordionClick}
          />
          <Accordion.Content
            active={createAccordionActive}
            content={CreateDeviceForm()}
          />
        </div>
      </Accordion>
      <Checkbox
        toggle
        defaultChecked={true}
        onChange={(event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
          console.log(data.value);
          if(data.value) {
            // show only reachable devices
            return;
          }
          // show unreachable devices too
        }}
        label={"Show only reachable devices"}
      />
      {devicesAvailable.map((device, index) => {
        return <Device device={device} deleteConfirmCallback={fetchAndSaveData} itemIndex={index} key={index} RCEIdDetectedCodeMap={RCEIdDetectedCodeMap} />
      })}

    </Segment>
  );
}

export default Devices;