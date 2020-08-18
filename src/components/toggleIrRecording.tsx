import Axios from 'axios';
import React, { useEffect } from 'react';
import { IFlattenedRemoteControlCommandValues } from '../utils/types';

async function toggleIsRecording(isRecording?: string): Promise<void> {
  if (!isRecording) {
    throw new Error('Sum ting wong w isRecording.');
  }
  return await Axios.post(`http://localhost:3001/recordIr`, {
    shouldRecord: isRecording
  });
}

async function getRecordingStatus(): Promise<void> {
  return await Axios.post(`http://localhost:3001/isRecording`);
}

function EmitIRCodeComponent({ data }: {data?: IFlattenedRemoteControlCommandValues} ) {
  console.log('AICISAAA', data);

  const [isRecording, setIsRecording]: [boolean, any] = useState([]);

  useEffect(() => {
    getRecordingStatus
  }, []);
  // let isRecording = await getRecordingStatus();
    return(<div>
      Recording: {isRecording ? 'TRUE' : 'FALSE'}
      <button
        onClick={async () => toggleIsRecording(data && data.irValue && data.irValue.value)}>
        Hit me, baby!
      </button>
    </div>);
}

export default EmitIRCodeComponent;