import React, { useEffect, useState } from "react";
import { Form } from "semantic-ui-react";
import { createCommand, createRemoteControl, deleteCommand } from "../../requests/requests";
import { IDictionary } from "../Types";
import { requestifyButton } from "../utils";

interface ICreateIrCommandFormState {
  name: string;
  description?: string;
}

const handleCreateIrCommandClick = (deviceId: string, irCodeHex: string, name: string, description?: string) => async (e: { preventDefault: () => void; }, _data: any) => {
  e.preventDefault();
  await createCommand(deviceId, name, irCodeHex, description);
}

export default function CreateIrCommandForm({ irCodeHex, deviceId, fetchCommands }: {
  irCodeHex: string;
  deviceId: string;
  fetchCommands: () => Promise<void>
}) {
  const [createIrCommandFormState, setCreateIrCommandFormState]: [ICreateIrCommandFormState, any] = useState({} as ICreateIrCommandFormState);
  const formIrCommandState = createIrCommandFormState || {};
  // deviceId: string, commandName: string, irCodeHex: string, commandDescription?: string
  return (
    <Form>
      <Form.Group widths='equal'>
        <Form.Input
          fluid
          // label='Command name'
          placeholder="Command name"
          error={formIrCommandState.name ? false : "Please enter a name"}
          onChange={(e) => {
            formIrCommandState.name = e.target.value;
            setCreateIrCommandFormState(createIrCommandFormState);
          }}/>
        <Form.Input
          fluid
          placeholder='Description (optional)'
          onChange={(e) => {
            formIrCommandState.description = e.target.value;
            setCreateIrCommandFormState(createIrCommandFormState);
          }}
        />
      </Form.Group>
      {/*<Form.Button fluid onClick={handleCreateIrCommandClick(deviceId, irCodeHex, formIrCommandState.name, formIrCommandState.description)}>Submit</Form.Button>*/}
      <Form.Button fluid onClick={
        // handleCreateIrCommandClick(deviceId, irCodeHex, formIrCommandState.name, formIrCommandState.description)
        requestifyButton([deviceId, irCodeHex, formIrCommandState.name, formIrCommandState.description], createCommand, fetchCommands)
      }>Submit</Form.Button>
    </Form>
  );
}