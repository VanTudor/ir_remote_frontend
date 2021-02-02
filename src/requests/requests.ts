import axios, { AxiosResponse } from "axios";
import { IIRCommand, IPaginatedResponse } from "../components/Types";
import { serverHost }  from "../config";

export async function createRemoteControl(name: string, description: string, hostAddress: string) {
  console.log('ce biuserica matii', serverHost);
  return await axios.post(`${serverHost}/remoteControlEmulator/create`, {
    name,
    description,
    hostAddress
  });
}

export async function deleteRemoteControl(id: string) {
  return await axios.post(`${serverHost}/remoteControlEmulator/delete`, {
    id
  });
}

export async function createDevice(name: string, description: string, rceId: string) {
  return await axios.post(`${serverHost}/device/create`, {
    name,
    description,
    remoteControlEmulatorId: rceId
  });
}

export async function deleteDevice(deviceId: string){
  return await axios.post(`${serverHost}/device/delete`, {
    id: deviceId
  })
}

export async function getCommands(deviceId: string) {
  return await axios.get<IPaginatedResponse<IIRCommand>>(`${serverHost}/commands?deviceId=${deviceId}&skipFirst=0&maxResultsLength=100`);
}

export async function emiteIRCodeByDeviceIdAndCommandName(deviceId: string, commandName: string) {
  return await axios.post(`${serverHost}/remoteControlEmulator/emitIrCodeByCommandAndRemoteControl`, {
    deviceId, commandName
  });
}