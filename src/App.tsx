import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './App.css';
import AssignCommandButton from './components/associateCommand';
import EmitIRCodeComponent from './components/emitIRCode';
import SimpleTable from './components/tables/irValuesTable';
import {
  commandsColumns,
  irValuesColumns,
  remoteControlsColumns,
  remoteControlCommandValuesColumns,
  mandatoryIrValuesColumns,
  mandatoryRemoteControlColumns, mandatoryCommandsColumns
} from './tableColumns';
import { IFlattenedRemoteControlCommandValues, IRemoteControlCommandValues, IPaginatedResponse, IRemoteControl, ICommand, IIrValue, ITableDisplayable, ISelectedItems, ITablesList } from './utils/types';
import ToggleIrRecordingComponent from "./components/toggleIrRecording";

async function createRemoteControl({ name, description }: { name: string, description: string }): Promise<void> {
  await axios.post('http://localhost:3001/createRemoteControl', {
    name,
    description
  });
}

async function createCommand({ name, description }: { name: string, description: string }): Promise<void> {
  await axios.post('http://localhost:3001/createCommand', {
    name,
    description
  });
}

async function createIrValue({ value }: { value: string }): Promise<void> {
  await axios.post('http://localhost:3001/createIrValue', {
    value
  });
}

async function getPage<T>(baseUrl: string, page: number, perPage: number): Promise<IPaginatedResponse<T>> {
  const skipFirst = page * perPage;
  let res = await axios.get<IPaginatedResponse<T>>(`${baseUrl}?skipFirst=${skipFirst}&maxResultsLength=${perPage}`);
  // enable all fields for our superbly coded react table dependency component
  res.data.rows = res.data.rows.map(row => ({
    ...row,
    tableData: {
      disabled: false
    }
  }));
  return res.data;
}

function handleChangePage<TRequestModel>(
  baseUrl: string,
  perPage: number,
  setLoadingFunc: (value: boolean) => void,
  setDataFunc: (value: any) => void,
  setTotalFunc: (value: any) => void,
  resultModifier?: (values: IPaginatedResponse<TRequestModel>) => IPaginatedResponse<any>) {
    return async (page: number): Promise<void> => {
      setLoadingFunc(true);
      let response = await getPage<TRequestModel>(baseUrl, page, perPage);
      if (resultModifier) {
        response = resultModifier(response);
      }
      setDataFunc(response.rows);
      setTotalFunc(response.total);
      setLoadingFunc(false);
    };
}

function flattenRemoteControlCommandValues(reqResponse: IPaginatedResponse<IRemoteControlCommandValues>): IPaginatedResponse<IFlattenedRemoteControlCommandValues> {
  return {
    rows: reqResponse.rows.map(val => ({
      ...val,
      commandName: val.command.name,
      remoteControlName: val.remoteControl.name
    })),
    total: reqResponse.total
  };
}

function useForceUpdate(){
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => ++value); // update the state to force render
}

function App() {
  const forceUpdate = useForceUpdate();
  const [irValues, setIrValues]: [IIrValue[], any] = useState([]);
  const [remoteControls, setRemoteControls]: [IRemoteControl[], any] = useState([]);
  const [commands, setCommands]: [ICommand[], any] = useState([]);
  const [remoteControlCommandValues, setRemoteControlCommandValues]: [IRemoteControlCommandValues[], any] = useState([]);

  const [irValuesTotalRows, setIrValuesTotalRows] = useState(10);
  const [remoteControlsTotalRows, setRemoteControlsTotalRows] = useState(10);
  const [commandsTotalRows, setCommandsTotalRows] = useState(10);
  const [remoteControlCommandValuesTotalRows, setRemoteControlCommandValuesTotalRows] = useState(10);
  
  const [irValuesLoading, setIrValuesLoading] = useState(false);
  const [remoteControlsLoading, setRemoteControlsLoading] = useState(false);
  const [commandsLoading, setCommandsLoading] = useState(false);
  const [remoteControlCommandValuesLoading, setRemoteControlCommandValuesLoading] = useState(false);
  
  const [irValuesPerPage, setIrValuesPerPage] = useState(10);
  const [remoteControlsPerPage, setRemoteControlsPerPage] = useState(10);
  const [commandsPerPage, setCommandsPerPage] = useState(10);
  const [remoteControlCommandValuesPerPage, setRemoteControlCommandValuesPerPage] = useState(10);

  const [selectedValues, setSelectedValues]: [ISelectedItems, any] = useState({});
  const [selectionLockedTables, setSelectionLockedTables]: [ITablesList, any] = useState({
    irValue: false, 
    command: false,
    remoteControl: false,
  });

  const setRowsDisabledTo = (value: boolean, rows: ITableDisplayable[], setRows: any, condition: (row: ITableDisplayable) => boolean): void => {
    rows.forEach(row => {
      if (condition(row)) {
        row.tableData.disabled = value;
      }
      setRows(rows);
      forceUpdate();
  });
  }
  
  const handleSelectedItems = (itemName: keyof ISelectedItems, rows: ITableDisplayable[], setRows: any) => { //TODO: don't be a lazy fuck and stop using any
    return (state: any)  => {
      selectedValues[itemName] = state.selectedRows[0];
      setSelectedValues(selectedValues);
      
      if (state.selectedCount === 1) {
        // @ts-ignore
        setRowsDisabledTo(true, rows, setRows, (row) => (row as any).id !== (selectedValues[itemName] && selectedValues[itemName].id));
      } else if (state.selectedCount === 0) {
        // @ts-ignore
        setRowsDisabledTo(false, rows, setRows, () => true);
      } else {
        throw new Error('Weird selection state reached. Just reload the page and it should be ok. And don\'t make that face; it\'s free software, dude.');
      }
      console.log(selectedValues);
    };
  }

  function determineDisabledRows<T extends ITableDisplayable>(itemName: keyof ITablesList) {
    return (row: T): boolean => row.tableData.disabled;
  }

  useEffect(() => {
    handleChangePage('http://localhost:3001/irValues', irValuesPerPage, setIrValuesLoading, setIrValues, setIrValuesTotalRows)(0);
    handleChangePage('http://localhost:3001/commands', remoteControlsPerPage, setCommandsLoading, setCommands, setCommandsTotalRows)(0);
    handleChangePage('http://localhost:3001/remoteControls', commandsPerPage, setRemoteControlsLoading, setRemoteControls, setRemoteControlsTotalRows)(0);
    handleChangePage('http://localhost:3001/remoteControlCommandValues', remoteControlCommandValuesPerPage, setRemoteControlCommandValuesLoading, setRemoteControlCommandValues, setRemoteControlCommandValuesTotalRows, flattenRemoteControlCommandValues)(0);
  }, []);

  return (
    <div className="App">
    <AssignCommandButton data={selectedValues}/>
    <ToggleIrRecordingComponent />
    <SimpleTable 
      title={'Remote control command values'}
      columns={remoteControlCommandValuesColumns}
      data={remoteControlCommandValues}
      paginationTotalRows={remoteControlCommandValuesTotalRows}
      progressPending={remoteControlCommandValuesLoading}
      onChangePage={handleChangePage<IFlattenedRemoteControlCommandValues>('http://localhost:3001/remoteControlCommandValues',
        remoteControlCommandValuesPerPage, 
        setRemoteControlCommandValuesLoading, 
        setRemoteControlCommandValues, 
        setRemoteControlCommandValuesTotalRows, 
        flattenRemoteControlCommandValues)}
      expandableRows
      expandableRowsComponent={<EmitIRCodeComponent />}
      tablePageFetcher={handleChangePage('http://localhost:3001/remoteControlCommandValues', remoteControlCommandValuesPerPage, setRemoteControlCommandValuesLoading, setRemoteControlCommandValues, setRemoteControlCommandValuesTotalRows, flattenRemoteControlCommandValues)}
    />
    <SimpleTable 
      title={'IR Values'}
      columns={irValuesColumns}
      data={irValues}
      paginationTotalRows={irValuesTotalRows}
      progressPending={irValuesLoading}
      onChangePage={handleChangePage<IIrValue>('http://localhost:3001/irValues', irValuesPerPage, setIrValuesLoading, setIrValues, setIrValuesTotalRows)}
      selectableRowDisabled={determineDisabledRows('irValue')}
      onSelectedRowsChange={handleSelectedItems('irValue', irValues, setIrValues)}
      tablePageFetcher={handleChangePage('http://localhost:3001/irValues', irValuesPerPage, setIrValuesLoading, setIrValues, setIrValuesTotalRows)}
      createEntity={{
        entityName: 'IR Value',
        fields: mandatoryIrValuesColumns,
        tableDataFetcher: handleChangePage('http://localhost:3001/irValues', irValuesPerPage, setIrValuesLoading, setIrValues, setIrValuesTotalRows),
        tableDataSender: createIrValue,
      }}
    />
    <SimpleTable 
      title={'Commands'}
      columns={commandsColumns}
      data={commands}
      paginationTotalRows={commandsTotalRows}
      progressPending={commandsLoading}
      onChangePage={handleChangePage<ICommand>('http://localhost:3001/commands', remoteControlsPerPage, setCommandsLoading, setCommands, setCommandsTotalRows)}
      selectableRowDisabled={determineDisabledRows('command')}
      onSelectedRowsChange={handleSelectedItems('command', commands, setCommands)}
      tablePageFetcher={handleChangePage('http://localhost:3001/commands', commandsPerPage, setCommandsLoading, setCommands, setCommandsTotalRows)}
      createEntity={{
        entityName: 'Remote control command',
        fields: mandatoryCommandsColumns,
        tableDataFetcher: handleChangePage('http://localhost:3001/commands', commandsPerPage, setCommandsLoading, setCommands, setCommandsTotalRows),
        tableDataSender: createCommand,
      }}
    />
    <SimpleTable 
      title={'Remote controls'}
      columns={remoteControlsColumns}
      data={remoteControls}
      paginationTotalRows={remoteControlsTotalRows}
      progressPending={remoteControlsLoading}
      onChangePage={handleChangePage<IRemoteControl>('http://localhost:3001/remoteControls', commandsPerPage, setRemoteControlsLoading, setRemoteControls, setRemoteControlsTotalRows)}
      selectableRowDisabled={determineDisabledRows('remoteControl')}
      onSelectedRowsChange={handleSelectedItems('remoteControl', remoteControls, setRemoteControls)}
      tablePageFetcher={handleChangePage('http://localhost:3001/remoteControls', remoteControlsPerPage, setRemoteControlsLoading, setRemoteControls, setRemoteControlsTotalRows)}
      createEntity={{
        entityName: 'Remote control',
        fields: mandatoryRemoteControlColumns,
        tableDataFetcher: handleChangePage('http://localhost:3001/remoteControls', remoteControlsPerPage, setRemoteControlsLoading, setRemoteControls, setRemoteControlsTotalRows),
        tableDataSender: createRemoteControl,
      }}
    />
    </div>
  );
}

export default App;
