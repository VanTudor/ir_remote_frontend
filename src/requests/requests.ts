import axios from "axios";
import { serverHost }  from "../config";

export async function createRemoteControl(name: string, description: string, hostAddress: string) {
  console.log('ce biuserica matii', serverHost);
  return await axios.post(`${serverHost}/remoteControlEmulator/create`, {
    name,
    description,
    hostAddress
  });
}
export async function createDevice(name: string, description: string, rceId: string) {
  return await axios.post(`${serverHost}/device/create`, {
    name,
    description,
    remoteControlEmulatorId: rceId
  });
}
