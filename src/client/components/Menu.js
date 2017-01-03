import React, { Component } from 'react'
import {postToken} from '../actions/user/user'

class Menu extends Component {

    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        let user = this.props.user
        let logout_uri = `${app_base}/logout`
        return(
            <div className="menu">
                <div className="menuitem">Welcome {user}</div>
                <div className="menuitem"><a href={logout_uri}>Logout</a></div>
            </div>
        )
    }
}

export default Menu
