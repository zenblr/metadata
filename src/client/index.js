// Main store
import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute } from 'react-router'
import configureStore from './store/configureStore'
import './stylesheets/styles.scss'
import DevTools from './components/DevTools'
import Home from './components/Home'
import Tmp from './components/Tmp'

const [store, history] = configureStore()

render(
  <div className='main'>
    <Provider store={store}>
      <Router history={history}>
        <Route path="/tmp" component={Tmp}/>
        <Route path="*" component={Home}/>
      </Router>
    </Provider>
    {(process.env.NODE_ENV !== 'production') &&
    <DevTools store={store}/>}
  </div>,
  document.getElementById('root')
)
