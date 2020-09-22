import Axios from 'axios';
import React, { useState } from 'react';
import {ICreateEntityProps, IDictionary} from '../utils/types';

function CreateEntity({ entityName, fields, tableDataFetcher, tableDataSender }: ICreateEntityProps ) {
  const inputValues = fields.map(field => {
    const [value, setValue] = useState('');
    return {
      name: field.name,
      type: field.type,
      value,
      setValue
    }
  });
  
  async function sendData(dataSender: (data: IDictionary<any>) => Promise<void>): Promise<void> {
    if (!dataSender) {
      throw new Error('Sum ting wong w create entity\'s data sender.');
    }
    const dataToSend: {[key: string]: any} = {};
    inputValues.forEach(inputValue => {
      dataToSend[inputValue.name.toLowerCase()] = inputValue.value;
    });
    console.log('ALOOO', dataToSend);
    console.log(inputValues);
    await tableDataSender(dataToSend);
    await tableDataFetcher(0);
  }

  return(<div>
    {inputValues.map(inputValue => (
      <input type={inputValue.type} name={inputValue.name} onChange={e => inputValue.setValue(e.target.value)} placeholder={inputValue.name}/>
    ))}
    <button
      onClick={async () => sendData(tableDataSender)}>
      Create {entityName}
    </button>
  </div>);
}

export default CreateEntity;