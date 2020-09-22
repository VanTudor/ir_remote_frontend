import { IColumnField } from "./utils/types";

export const mandatoryIrValuesColumns: IColumnField[] = [
  {
    name: "Value",
    selector: "value",
    sortable: true,
    type: 'text'
  }
];
export const irValuesColumns: IColumnField[] = [
  {
    name: "id",
    selector: "id",
    sortable: true,
    type: 'text'
  },
  ...mandatoryIrValuesColumns,
  {
    name: "UpdatedAt",
    selector: "updatedAt",
    sortable: true,
    type: 'text'
  },
  {
    name: "CreatedAt",
    selector: "createdAt",
    sortable: true,
    type: 'text'
  }
];

export const mandatoryCommandsColumns: IColumnField[] = [
  {
    name: "Name",
    selector: "name",
    sortable: true,
    type: 'text'
  },
  {
    name: "Description",
    selector: "description",
    sortable: true,
    type: 'text'
  }
];

export const commandsColumns: IColumnField[] = [
  {
    name: "id",
    selector: "id",
    sortable: true,
    type: 'text'
  },
  ...mandatoryCommandsColumns,
  {
    name: "UpdatedAt",
    selector: "updatedAt",
    sortable: true,
    type: 'text'
  },
  {
    name: "CreatedAt",
    selector: "createdAt",
    sortable: true,
    type: 'text'
  }
];

export const mandatoryRemoteControlColumns: IColumnField[] = [
  {
    name: "Name",
    selector: "name",
    sortable: true,
    type: 'text'
  },
  {
    name: "Description",
    selector: "description",
    sortable: true,
    type: 'text'
  }
];

export const remoteControlsColumns: IColumnField[] = [
  {
    name: "id",
    selector: "id",
    sortable: true,
    type: 'text'
  },
  ...mandatoryRemoteControlColumns,
  {
    name: "UpdatedAt",
    selector: "updatedAt",
    sortable: true,
    type: 'text'
  },
  {
    name: "CreatedAt",
    selector: "createdAt",
    sortable: true,
    type: 'text'
  }
];

export const remoteControlCommandValuesColumns: IColumnField[] = [
  {
    name: "Command Name",
    selector: "commandName",
    sortable: true,
    type: 'text'
  },
  {
    name: "Remote Name",
    selector: "remoteControlName",
    sortable: true,
    type: 'text'
  }
];