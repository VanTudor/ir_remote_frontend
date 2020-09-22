import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import { IFlattenedRemoteControlCommandValues, IRemoteEmulatorStatusResponse } from '../utils/types';

function ToggleIrRecordingComponent({ data }: {data?: IFlattenedRemoteControlCommandValues} ) {
  const [isRecording, setIsRecording]: [boolean, any] = useState(false);

  const getRecordingStatus = async () => {
    console.log('getting recording stauts');
    const response = await Axios.get<IRemoteEmulatorStatusResponse>(`http://localhost:3001/remoteControlEmulator/status`);
    console.log('BANUUU AICISAAA!!', response);
    setIsRecording(response.data.isRecording);
  };

  async function toggleIsRecording(isRecording?: boolean): Promise<void> {
    await Axios.post(`http://localhost:3001/remoteControlEmulator/recordIr`, {
      shouldRecord: isRecording
    });
    await getRecordingStatus();
  }

  useEffect(() => {

    getRecordingStatus();
  }, []);
  // let isRecording = await getRecordingStatus();
    return(<div>
      Recording: {isRecording ? 'TRUE' : 'FALSE'}
      <button
        onClick={async () => toggleIsRecording(!Boolean(isRecording))}>
        Switch recording state.
      </button>
    </div>);
}

export default ToggleIrRecordingComponent;