import React, { Component } from 'react'
import cookie from 'react-cookie'
import ManageAccess from './ManageAccess'
import Menu from './Menu'

class DisplayPage extends Component {

  render() {
      let display = this.props.display
      return (
          <div className="section_form">
              {display}
          </div>
      )
  }
}

export default DisplayPage
