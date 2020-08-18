export interface ITableSpecificFields {
  disabled: boolean;
}

export interface ITableDisplayable {
  tableData: ITableSpecificFields;
}

export interface IAuditFields {
  createdAt: string;
  updatedAt: string;
}

export interface IIrValue extends IAuditFields, ITableDisplayable {
  id: string;
  value: string;
};

export interface ICommand extends IAuditFields, ITableDisplayable {
  id: string;
  name: string;
  description: string;
};

export interface IRemoteControl extends IAuditFields, ITableDisplayable {
  id: string;
  name: string;
  description: string;
};

export interface IRemoteControlCommandValues extends IAuditFields, ITableDisplayable {
  irValue: IIrValue;
  remoteControl: IRemoteControl;
  command: ICommand;
}

export interface IFlattenedRemoteControlCommandValues extends IRemoteControlCommandValues {
  commandName: string;
  remoteControlName: string;
}

export interface IPaginatedResponse<TRow> {
  rows: TRow[];
  total: number;
};

export interface ISelectedItems {
  irValue?: IIrValue; 
  command?: ICommand;
  remoteControl?: IRemoteControl;
};

export interface ITablesList {
  irValue: boolean; 
  command: boolean;
  remoteControl: boolean;
};