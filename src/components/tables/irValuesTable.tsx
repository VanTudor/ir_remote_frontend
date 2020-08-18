import React from 'react';
import DataTable from 'react-data-table-component';
import styled from 'styled-components';

const ClearButton = styled.button`
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  height: 34px;
  width: 32px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TextField = styled.input`
  height: 32px;
  width: 200px;
  border-radius: 3px;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border: 1px solid #e5e5e5;
  padding: 0 32px 0 16px;

  &:hover {
    cursor: pointer;
  }
`;

const FilterComponent = ({ filterText, onFilter, onClear, placeholder }: any) => (
  <>
    <TextField id="search" type="text" placeholder={placeholder} value={filterText} onChange={onFilter} />
    <ClearButton type="button" onClick={onClear}>X</ClearButton>
  </>
);

export interface IMandatoryDataColumnFields {
  name: string;
  selector: string;
  sortable: boolean;
};
export interface ITableProps<T> {
  title: string;
  columns: IMandatoryDataColumnFields[],
  data: T[];
  paginationTotalRows: number;
  progressPending: boolean;
  onChangePage: (page: number) => void;
  expandableRows?: boolean;
  expandableRowsComponent?: React.ReactNode;
  onSelectedRowsChange?: (selectedRowState: {
    allSelected: boolean;
    selectedCount: number;
    selectedRows: T[]; // TODO: stop being a lazy f*ck
  }) => void;
  selectableRowDisabled?: (row: T) => boolean;
};
// item[prev.selector] && item[prev.selector].reduce &&
function SimpleTable<T>({
    title,
    columns,
    data,
    paginationTotalRows,
    progressPending,
    onChangePage, 
    expandableRows,
    expandableRowsComponent,
    onSelectedRowsChange,
    selectableRowDisabled
  }: ITableProps<T>) {
  const [filterText, setFilterText] = React.useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);
  const filteredItems = data.filter((irValue: any) => columns.some((column: any) => irValue[column.selector].toLowerCase().includes(filterText.toLowerCase())));

  const subHeaderComponentMemo = React.useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText('');
      }
    };

    return <FilterComponent
            onFilter={(e: any) => setFilterText(e.target.value)} 
            onClear={handleClear} 
            filterText={filterText}
            placeholder={`Filter by ${columns.map(column => column.name).join(', ')}`}
          />;
  }, [filterText, resetPaginationToggle]);

  return(
      <DataTable
        title={title}
        columns={columns}
        data={filteredItems}
        progressPending={progressPending}
        pagination
        paginationServer
        paginationResetDefaultPage={resetPaginationToggle} // optionally, a hook to reset pagination to page 1
        subHeader
        subHeaderComponent={subHeaderComponentMemo}
        selectableRows
        persistTableHead
        paginationTotalRows={paginationTotalRows}
        onChangePage={onChangePage}
        expandableRows={expandableRows}
        expandableRowsComponent={expandableRowsComponent}
        onSelectedRowsChange={onSelectedRowsChange}
        selectableRowDisabled={selectableRowDisabled}
      />
  );
}

export default SimpleTable;