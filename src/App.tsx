import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './App.css';
import RemoteControlEmulatorsScanner from "./components/RemoteControlEmulatorsScanner";

async function createRemoteControl({ name, description }: { name: string, description: string }): Promise<void> {
  await axios.post('http://localhost:3001/createRemoteControl', {
    name,
    description
  });
}

function useForceUpdate(){
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => ++value); // update the state to force render
}

function App() {
  return (
    <div className="App">
      <RemoteControlEmulatorsScanner />
    </div>
  );
}

export default App;
