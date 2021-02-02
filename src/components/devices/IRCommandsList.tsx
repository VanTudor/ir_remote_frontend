import { Button, ButtonGroup, List } from "semantic-ui-react";
import { emiteIRCodeByDeviceIdAndCommandName } from "../../requests/requests";
import { IIRCommand } from "../Types";
import React from "react";

export default function IRCommandsList(deviceId: string, irCodesList: IIRCommand[]) {

  const handleEmitCode = (commandName: string) => async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log(`Emitting IR Code. Command name: ${commandName}`);
    const res = await emiteIRCodeByDeviceIdAndCommandName(deviceId, commandName);
    console.log(res);
    // remoteControlEmulator/emitIrCodeByCommandAndRemoteControl
  }
  return(
    <List divided verticalAlign='middle'>
      {irCodesList.map((irCode, index) =>
        <List.Item>
          <List.Content floated={"right"}>
            <Button
              color={"green"}
              onClick={handleEmitCode(irCode.name)}
            >Emit</Button>
            <Button
              color={"red"}
              onClick={() => {}}
            >Delete</Button>
          </List.Content>
          <List.Content verticalAlign="middle">
            <List.Header>{irCode.name}</List.Header>
            {irCode.description}
          </List.Content>
      </List.Item>)}
    </List>
  );
}