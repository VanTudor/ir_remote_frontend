import { Button, List } from "semantic-ui-react";
import { emiteIRCodeByDeviceIdAndCommandName, deleteCommand } from "../../requests/requests";
import { IIRCommand } from "../Types";
import React from "react";
import { requestifyButton } from "../utils";

export default function IRCommandsList(deviceId: string, irCodesList: IIRCommand[], fetchCommands: () => Promise<void>) {
  return(
    <List divided verticalAlign='middle'>
      {irCodesList.map((irCode, index) =>
        <List.Item>
          <List.Content floated={"right"}>
            <Button
              color={"green"}
              onClick={requestifyButton([deviceId, irCode.name], emiteIRCodeByDeviceIdAndCommandName)}
            >Emit</Button>
            <Button
              color={"red"}
              onClick={requestifyButton([irCode.id], deleteCommand, fetchCommands)}
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