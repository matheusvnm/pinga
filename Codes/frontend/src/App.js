import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import Navbar from './components/layouts/Navbar'
import Footer from './components/layouts/Footer'
import Home from './components/dashboard/Home'
import Painel from './components/dashboard/PainelSol'
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
        <div className="App">
          <Navbar />
          <Switch>
            <Route exact path='/' component ={Home} />
            <Route path='/painel' component ={Painel} />
          </Switch>
          <Footer />
        </div>
      </BrowserRouter>
  );
}