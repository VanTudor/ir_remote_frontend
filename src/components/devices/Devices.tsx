import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Accordion, Form, Segment, Dropdown, Checkbox } from "semantic-ui-react";
import { CheckboxProps } from "semantic-ui-react/dist/commonjs/modules/Checkbox/Checkbox";
import { serverHost, SocketIOEndpoint } from "../../config";
import { createDevice } from "../../requests/requests";
import { SocketCommsService } from "../../services/SocketComms";
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
    return res.data.rows;
}

async function getRCEs(): Promise<IRCE[]> {
  const res = await axios.get<IPaginatedResponse<IRCE>>(`${serverHost}/remoteControlEmulators?skipFirst=${0}&maxResultsLength=100`);
  return res.data.rows;
}

function Devices({ socketCommsService, onlineRCEIdsList }: {
  socketCommsService: SocketCommsService,
  onlineRCEIdsList: string[]
}) {
  const [showUnreachableDevices, setShowUnreachableDevices]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
  const [createAccordionActive, setCreateAccordionActive]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
  const [devicesReachable, setDevicesReachable]: [IDevice[], Dispatch<SetStateAction<IDevice[]>>] = useState<IDevice[]>([]);
  const [devicesUnreachable, setDevicesUnreachable]: [IDevice[], Dispatch<SetStateAction<IDevice[]>>] = useState<IDevice[]>([]);

  const [RCEsAvailable, setRCEsAvailable]: [IRCE[], Dispatch<SetStateAction<IRCE[]>>] = useState<IRCE[]>([]);
  const [registerDeviceFormState, setRegisterDeviceFormState]: [IRegisterDeviceFormState, Dispatch<SetStateAction<IRegisterDeviceFormState>>] = useState<IRegisterDeviceFormState>({
    name: '',
    description: '',
    remoteControlEmulatorId: ''
  });

  async function fetchAndSaveData() {
    let allDevices = await getDevices();
    const rces = await getRCEs();
    const reachable: IDevice[] = [];
    const unreachable: IDevice[] = [];
    allDevices.forEach(device => {
      const isReachable = device.remoteControlEmulator && onlineRCEIdsList.indexOf(device.remoteControlEmulator.id) !== -1;
      isReachable ? reachable.push(device) : unreachable.push(device);
    });

    setRCEsAvailable(rces);
    setDevicesReachable(reachable);
    setDevicesUnreachable(unreachable);
  }

  useEffect(() => {
    fetchAndSaveData();
  }, []);

  let RCEIdDetectedCodeMap: { [k: string]: string }, setRCEIdDetectedCodeMap: any;
  [RCEIdDetectedCodeMap, setRCEIdDetectedCodeMap] = useState({});
  useEffect(() => {
    socketCommsService.socket.on("IRCodeDetected", (IRCodeDetectedEvent: IIRCodeDetectedEvent) => {
      console.log(IRCodeDetectedEvent);
      setRCEIdDetectedCodeMap({
        ...RCEIdDetectedCodeMap,
        [IRCodeDetectedEvent.RCEId]: parseInt(IRCodeDetectedEvent.IRCode, 10).toString(16)
      })
    })
    return () => { socketCommsService.socket.disconnect() };
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
                remoteControlEmulatorId: value as string
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
        defaultChecked={showUnreachableDevices}
        onChange={async (event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
          await fetchAndSaveData();
          setShowUnreachableDevices(!showUnreachableDevices);
        }}
        label={"Show unreachable devices"}
      />
      {devicesReachable.map((device, index) =>
        <Device device={device} deleteConfirmCallback={fetchAndSaveData} itemIndex={index} key={index} RCEIdDetectedCodeMap={RCEIdDetectedCodeMap} />
      )}
      {showUnreachableDevices ? devicesUnreachable.map((device, index) =>
        <Device device={device} deleteConfirmCallback={fetchAndSaveData} itemIndex={index} key={index} RCEIdDetectedCodeMap={RCEIdDetectedCodeMap} />
      ): null}

    </Segment>
  );
}

export default Devices;