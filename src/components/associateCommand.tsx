import Axios from 'axios';
import React from 'react';
import { ISelectedItems } from '../utils/types';

async function sendAssignCommand(data: ISelectedItems): Promise<void> {
  if (!data.command) {
    throw new Error('Cannot associate. no data.command.')
  }
  if (!data.irValue) {
    throw new Error('Cannot associate. no data.irValue.')
  }
  if (!data.remoteControl) {
    throw new Error('Cannot associate. no data.remoteControl.')
  }
  return await Axios.post(`http://localhost:3001/assignCommand?irValueId=${data.irValue.id}&commandId=${data.command.id}&remoteControlId=${data.remoteControl.id}`);
}

function AssignCommandButton({ data }: {data?: ISelectedItems} ) {
  if (data) {
      return(<div>
        <button
          onClick={async () => sendAssignCommand(data)}>
          Associate remote control command to IR value
        </button>
      </div>);
  }
  return (
    <div>Not yet.</div>
  )
}

export default AssignCommandButton;