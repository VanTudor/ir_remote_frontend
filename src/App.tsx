import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './App.css';
import socketIOClient from "socket.io-client";
// import RemoteControlEmulatorsScanner from "./components/RemoteControlEmulatorsScanner";
import TopMenu from "./components/TopMenu";
import { IBonjourServiceWithLastSeen, IDictionary } from "./components/Types";
import {  SocketIOEndpoint } from "./config";
import { stringBoolToBool } from "./utils";

// function useForceUpdate(){
//   const [value, setValue] = useState(0); // integer state
//   return () => setValue(value => ++value); // update the state to force render
// }

function App() {
  return (
    <div className="App">
      <TopMenu />
    </div>
  );
}

export default App;
