import React from 'react';
import {  Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home';
import Labsp from './pages/Labsp';
import LabEnvironment from './components/SSHInterface';
import SSHTerminal from './components/SSHTerminal';
function App() {
  return (
      <div className="bg-gray-900 text-gray-100 font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/labs' element={<Labsp/>}></Route>
          <Route path='/labenv' element={<SSHTerminal/>}></Route>
        </Routes>
      </div>
  );
}

export default App;
