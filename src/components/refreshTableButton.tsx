import Axios from 'axios';
import React from 'react';
import { IFlattenedRemoteControlCommandValues } from '../utils/types';

async function fetchData(dataFetcher: () => Promise<void>): Promise<void> {
    if (!dataFetcher) {
        throw new Error('Sum ting wong w refresh table button\'s data fetcher.');
    }
    await dataFetcher();
}

function RefreshTableButton({ tableDataFetcher }: { tableDataFetcher: () => Promise<void> } ) {
    return(<div>
        <button
            onClick={async () => fetchData(tableDataFetcher)}>
    Refresh table
    </button>
    </div>);
}

export default RefreshTableButton;