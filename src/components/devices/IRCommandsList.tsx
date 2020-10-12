import { Button, ButtonGroup, List } from "semantic-ui-react";
import { IIRCommand } from "../Types";
import React from "react";

export default function IRCommandsList(irCodesList: IIRCommand[]) {
  return(
    <List divided verticalAlign='middle'>
      {irCodesList.map((irCode, index) =>
        <List.Item>
          <List.Content floated={"right"}>
            <Button
              color={"green"}
              onClick={() => {}}
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