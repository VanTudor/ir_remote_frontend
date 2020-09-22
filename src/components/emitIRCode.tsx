import Axios from 'axios';
import React from 'react';
import { IFlattenedRemoteControlCommandValues } from '../utils/types';

async function emitIRCode(irValue?: string): Promise<void> {
  if (!irValue) {
    throw new Error('Sum ting wong w irValue.');
  }
  return await Axios.post(`http://localhost:3001/remoteControlEmulator/emitIrCode`, {
    value: irValue
  });
}

function EmitIRCodeComponent({ data }: {data?: IFlattenedRemoteControlCommandValues} ) {
  console.log('AICISAAA', data);
 
    return(<div>
      <button
        onClick={async () => emitIRCode(data && data.irValue && data.irValue.value)}>
        Hit me, baby!
      </button>
    </div>);
}

export default EmitIRCodeComponent;