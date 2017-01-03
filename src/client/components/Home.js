import React, { Component } from 'react'
import cookie from 'react-cookie'
import Assets from './Assets'
import Labels from './Labels'
import LabelGroups from './LabelGroups'
import Aggregations from './Aggregations'
import Patterns from './Patterns'
import Menu from './Menu'

class Home extends Component {

    constructor(props) {
        super(props)
        this.state = {
            display:'Assets'
        }
    }

    changeDisplay(display) {
        this.setState({...this.state, display:display})
    }

    showLink(name)  {
        return (
            <div className="nav-content">
                <a onClick={this.changeDisplay.bind(this,name)}>{name}</a>
            </div>
        )
    }

  render() {
      let logopng = `${app_base}/images/logo_img.png`
      let backgroundjpg = `${app_base}/images/banner.jpg`
      let user = cookie.load('user')
      let selected_display = this.state.display
      return(
      <div className="wrapper">
        <header id="header">
            <div className="container">
                <div className="logo"><a href="#"><img src={logopng} height={50} width={86} alt /></a></div>
                <Menu user={user}/>
            </div>
        </header>
          <div>
              <div className="nav-section">
              </div>
              <div className="nav-section">
              </div>
              <div className={"nav-section " + ((selected_display === 'Assets') && 'selected')}>
                  {this.showLink('Assets')}
              </div>
              <div className={"nav-section " + ((selected_display === 'Labels')  && 'selected')}>
                  {this.showLink('Labels')}
              </div>
              <div className={"nav-section " + ((selected_display === 'Label Groups') && 'selected')}>
                  {this.showLink('Label Groups')}
              </div>
              <div className={"nav-section " + ((selected_display === 'Aggregations') && 'selected')}>
                  {this.showLink('Aggregations')}
              </div>
              <div className={"nav-section " + ((selected_display === 'Patterns') && 'selected')}>
                  {this.showLink('Patterns')}
              </div>
          </div>
          <div className="main_content" style={{background:"url("+backgroundjpg+") no-repeat left center", clear:"both"}}>
          <div className="section">
              {(selected_display == 'Assets') &&  <Assets/> }
              {(selected_display == 'Labels') &&  <Labels/> }
              {(selected_display == 'Label Groups') &&  <LabelGroups/>}
              {(selected_display == 'Aggregations') &&  <Aggregations/> }
              {(selected_display == 'Patterns') &&  <Patterns/> }
          </div>
        </div>
        <footer id="footer" />
      </div>
    )
  }
}

export default Home
