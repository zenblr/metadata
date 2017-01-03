import React, { Component, PropTypes } from 'react'
import { push } from 'react-router-redux'
var Modal = require('react-modal')

import {getPendingRequests, getAvailableGroups, getUsers, approveOrDenyRequest, joinOrLeaveGroups, getUser} from '../actions/user/user'

const loadinggif = app_base + '/images/loader-new.gif'

class ManageAccess extends Component {

    constructor(props) {
        super(props)
        this.state = {
            requests : [
            ],
            requests_initialized:false,
            users: [
            ],
            users_initialized:false,
        }
        if (this.props.location.query.user) {

        }
        this.getRoles()
    }

    denyRequest(username) {
        let _this = this
        let s= _this.state
        let requests = s.requests;
        for (let i=0; i<requests.length; i++) {
            if (requests[i].username == username) {
                approveOrDenyRequest('deny', requests[i].id, function(res) {
                    if (res.status == 'pass') {
                        requests.splice(i,1)
                        s.requests = requests
                        s.popup = false
                    }
                    else {
                        s.popup = {
                            error_msg:"Deny request failed"
                        }
                    }
                    _this.setState({...s})
                })
                break
            }
        }
    }

    grantRequest(username) {
        let s= this.state
        let requests = s.requests;
        let sel = requests.find((v) => {
            return v.username == username
        })

        if (sel) {
            s.popup = {
                type: 'grant',
                name: sel.name,
                email:sel.email,
                username:sel.username,
                roles: sel.roles.slice()
            }
            this.setState({...s})
        }
    }

    changeRoles(username) {
        let s= this.state
        let users = s.users;
        let sel = users.find((v) => {
            return v.username == username
        })

        if (sel) {
            s.popup = {
                type: 'changerole',
                name: sel.name,
                email:sel.email,
                username:sel.username,
                roles: sel.roles.slice()
            }
            this.setState({...s})
        }
    }

    revokeUser(username) {
        let _this = this
        let s= _this.state
        for (let i=0; i<s.users.length; i++) {
            if (s.users[i].username == username) {
                this.changeUserGroups(username, [], s.users[i].roles, function(user) {
                    getUsers(function (resp) {
                        s.users = resp.users
                        _this.setState({...s})
                    })
                })
                break;
            }
        }
    }

    showGrant(username) {
        return (<a onClick={this.grantRequest.bind(this, username)}>Grant</a>)
    }

    showDeny(username) {
        return (<a onClick={this.denyRequest.bind(this, username)}>Deny</a>)
    }

    showChangeRoles(username) {
        return (<a onClick={this.changeRoles.bind(this, username)}>Change Roles</a>)
    }

    showRevoke(username) {
        return (<a onClick={this.revokeUser.bind(this, username)}>Revoke</a>)
    }

    getRequests() {
        let _this = this
        let s = _this.state
        if (!s.requests_initialized) {
            getPendingRequests(function(resp) {
                if (resp.status == "pass") {
                    resp.requests.forEach(function(request) {
                        request.roles = ['Viewer']
                    })
                    s.requests = resp.requests
                    s.requests_initialized = true
                    _this.setState({...s})
                }
            })
        }
        return true
    }

    showRequests() {
        let r = this.state.requests
        let requests = r.map( (v,i) => {
            return (<tr key={i}><td>{v.name}</td><td>{v.time.replace(/\..*Z$/,'')}</td><td>{v.email}</td><td>{this.showGrant(v.username)}</td><td>{this.showDeny(v.username)}</td></tr>)
        })
        return requests
    }

    getUsers(cb) {
        let _this = this
        let s = _this.state
        if (!s.users_initialized) {
            getUsers(function(resp) {
                if (cb) return cb(resp)
                if (resp.status == "pass") {
                    s.users = resp.users
                    s.users_initialized = true
                    _this.setState({...s})
                }
            })
        }
        return true
    }

    getRoles() {
        let _this = this
        let s = _this.state
        getAvailableGroups(function(resp) {
            if (resp.status == "pass") {
                s.groups = resp.groups
                _this.setState({...s})
            }
        })
    }

    showUsers() {
        let r = this.state.users
        let users = r.map( (v,i) => {
            return (<tr key={i}><td>{v.name}</td><td>{v.email}</td><td>{v.roles.join(',')}</td><td>{this.showChangeRoles(v.username)}</td><td>{!v.self && this.showRevoke(v.username)}</td></tr>)
        })
        return users
    }

    closePopupAndGrant() {
        let _this = this
        let s = _this.state
        let requests = s.requests
        for (let i=0; i<requests.length; i++) {
            if (requests[i].username == s.popup.username) {
                approveOrDenyRequest('approve', requests[i].id, function(res) {
                    if (res.status == 'pass') {
                        let add_roles = s.popup.roles.filter(function(v) {
                            return (requests[i].roles.indexOf(v) < 0)
                        })
                        let delete_roles = requests[i].roles.filter(function(v) {
                            return (s.popup.roles.indexOf(v) < 0)
                        })
                        let username = requests[i].username
                        requests.splice(i,1)
                        s.requests = requests
                        getUsers(function(resp) {
                            s.users = resp.users
                            s.popup = false
                            //_this.setState({...s})
                            _this.changeUserGroups(username, add_roles, delete_roles, function(user) {
                                if (user) {
                                    //s = _this.state
                                    let users = s.users.filter(function (u) {
                                        return (u.username != user.username)
                                    })
                                    users.push(user)
                                    s.users = users;
                                }
                                _this.setState({...s})
                            })
                        })
                    }
                    else {
                        s.popup = {
                            error_msg:"Approve request failed"
                        }
                        _this.setState({...s})
                    }
                })
                break
            }
        }
    }

    updateUser(username, cb) {
        let s = this.state
        getUser(username, function(resp) {
            if (resp.status == "pass")
                cb(resp)
            else
                cb()
        })
    }

    changeUserGroups(username, addRoles, deleteRoles, cb) {
        let _this = this
        let s = _this.state
        addRoles = addRoles.reduce(function(p,n) {
            for (let i=0; i<s.groups.length; i++) {
                if (s.groups[i].roles[0] == n) {
                    p.push(s.groups[i].id)
                    break
                }
            }
            return(p)
        },[])
        deleteRoles = deleteRoles.reduce(function(p,n) {
            for (let i=0; i<s.groups.length; i++) {
                if (s.groups[i].roles[0] == n) {
                    p.push(s.groups[i].id)
                    break
                }
            }
            return(p)
        },[])
        let user = false
        if ((addRoles.length > 0) || (deleteRoles.length > 0)) {
            joinOrLeaveGroups('join', username, addRoles.join(','), function(resp) {
                if ((resp) && (resp.status == "pass"))
                    user = resp.user
                joinOrLeaveGroups('leave', username, deleteRoles.join(','), function(resp) {
                    if ((resp) && (resp.status == "pass"))
                        user = resp.user
                    return cb(user)
                })
            })
        }
        else
            cb(user)
    }

    closePopupAndChangeRole() {
        let _this = this
        let s = _this.state
        let users = s.users
        for (let i=0; i<users.length; i++) {
            if (users[i].username == s.popup.username) {
                let add_roles = s.popup.roles.filter(function(v) {
                    return (users[i].roles.indexOf(v) < 0)
                })
                let delete_roles = users[i].roles.filter(function(v) {
                    return (s.popup.roles.indexOf(v) < 0)
                })
                this.changeUserGroups(users[i].username, add_roles, delete_roles, function(user) {
                    if (user) {
                        s = _this.state
                        let users = s.users.filter(function(u) {
                            return (u.username != user.username)
                        })
                        users.push(user)
                        s.users = users;
                        _this.setState({...s})
                    }
                })
                users[i].roles = s.popup.roles
                break
            }
        }
        s.popup = false
        this.setState({...s})
    }

    closePopup() {
        let s = this.state
        s.popup = false
        this.setState({...s})
    }

    setRole(e) {
        let s = this.state
        if (s.popup) {
            if (e.target.checked) {
                if (s.popup.roles.indexOf(e.target.value) < 0)
                    s.popup.roles.push(e.target.value)
            }
            else {
                let index = s.popup.roles.indexOf(e.target.value)
                if (index >= 0) {
                    s.popup.roles.splice(index, 1);
                }
            }
            this.setState({...s})
        }
    }

    getImpliedRoles(roles) {
        let implied = []
        let s = this.state
        for (let i=0; i<roles.length; i++) {
            let r = roles[i]
            for (let j = 0; j < s.groups.length; j++) {
                if (s.groups[j].roles[0] == r) {
                    s.groups[j].implied.forEach(function (v) {
                        if (implied.indexOf(v) < 0)
                            implied.push(v)
                    })
                }
            }
        }
        return implied
    }

    showRoles() {
        let _this = this
        let s = _this.state
        let roles = s.groups.reduce(function(acc,v) {
            v.roles.forEach(function(w) {
                if (acc.indexOf(w) < 0)
                    acc.push(w)
            })
            return acc
        }, [])
        let implied = _this.getImpliedRoles(s.popup.roles)
        return roles.map(function(v,i) {
            return (<li key={i} className="popup-list"><input type="checkbox" value={v} onChange={_this.setRole.bind(_this)} checked={implied.indexOf(v) >= 0}></input><label>{v}</label></li>)
        });
    }

    showPopup() {
        let s = this.state
        if (!s.popup)
            return ""
        let html = ""
        if (s.popup.type == "grant") {
            html = (
                <div>
                    <div>Approve {s.popup.name}?</div>
                    <div>{s.popup.name} will have membership in the following groups on your tenant</div>
                    <div className="popup">
                        {this.showRoles()}
                    </div>
                    <div style={{textAlign:"center"}}>
                        <button className="modal-popup-button" onClick={this.closePopupAndGrant.bind(this)}>OK</button>
                        <button className="modal-popup-button" onClick={this.closePopup.bind(this)}>Cancel</button>
                    </div>
                </div>
            )
        }
        else if (s.popup.type == "changerole") {
            html = (
                <div>
                    <div>Change Roles for {s.popup.name}?</div>
                    <div>{s.popup.name} will have membership in the following groups on your tenant</div>
                    <div className="popup">
                        {this.showRoles()}
                    </div>
                    <div style={{textAlign:"center"}}>
                        <button className="modal-popup-button" onClick={this.closePopupAndChangeRole.bind(this)}>OK</button>
                        <button className="modal-popup-button" onClick={this.closePopup.bind(this)}>Cancel</button>
                    </div>
                </div>
            )
        }
        else if (s.popup.error_msg) {
            html = (
                <div>
                    <div>{s.popup.error_msg}</div>
                    <div style={{textAlign:"center"}}>
                        <button className="modal-popup-button" onClick={this.closePopup.bind(this)}>OK</button>
                    </div>
                </div>
            )
        }

        let style = {
            content: {
                width: "40%",
                height: "30%",
                borderStyle: "solid",
                borderColor: "green",
                top: "20%",
                left: "25%"
            }
        }
        return (
            <Modal
                isOpen={true}
                onRequestClose={this.closePopup.bind(this)}
                shouldCloseOnOverlayClick={false}
                style={style}>
                {html}
            </Modal>
        )
    }



    render() {

        let title_requests = "Pending Requests"
        let title_users = "Current Users"

        return (
            <div className="section_form">
                <form>
                    <div style={{paddingBottom:"20px"}}>
                        <div className="popup">
                            <h2 className="text-left">{title_requests}</h2>
                            { (this.state.requests.length > 0) &&
                            <table className="requests-table">
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Time</th>
                                    <th>Email</th>
                                    <th colSpan="2">Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {this.showRequests()}
                                </tbody>
                            </table> }
                            { (this.state.requests.length == 0) && this.getRequests() &&
                                <div>No pending requests</div>
                            }
                        </div>

                        <div className="popup">
                            <h2 className="text-left">{title_users}</h2>
                            { (this.state.users.length > 0) &&
                            <table className="users-table">
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Roles</th>
                                    <th colSpan="2">Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {this.showUsers()}
                                </tbody>
                            </table> }
                            { (this.state.users.length == 0) && this.getUsers() &&
                            <div>No users</div>
                            }
                        </div>
                    </div>
                </form>
                {this.showPopup()}
            </div>
        )
    }
}

export default ManageAccess