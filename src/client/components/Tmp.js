import React, { Component } from 'react'
import {postToken} from '../actions/user/user'

class Tmp extends Component {

    constructor(props) {
        super(props)
        this.state = {}
    }

    startFlow(e) {
        e.preventDefault()
        let _this = this
        postToken(function(token, domain) {
            if (token) {
                _this.refs.token.value = token
                _this.refs.domain.value = domain
                _this.refs.startform.submit()
            }
        });
    }

    render() {
        return(
          <div className="wrapper">
            <header id="header">
                <div className="container">
                    <div className="logo"><a href="#"><img src="images/logo_img.png" height={50} width={86} alt /></a></div>
                </div>
            </header>
            <div className="main_content">
              <div className="container">
                  <form id="start-form" ref="startform" action="http://localhost:3000/api/tenant/token" method="POST">
                      <input type="hidden" name="token" ref="token"></input>
                      <input type="hidden" name="domain" ref="domain"></input>
                    <button style={{position:"relative", left:"50%"}} onClick={this.startFlow.bind(this)}>Start</button>
                  </form>
              </div>
            </div>
            <footer id="footer" />
          </div>
        )
    }
}

export default Tmp
