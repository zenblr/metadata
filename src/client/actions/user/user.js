import 'whatwg-fetch'
import { push } from 'react-router-redux'
import cookie from 'react-cookie'

var  base_url = app_base;

export function getAvailableGroups(cb) {
    let url = base_url + '/api/tenant/groups'

    let headers = {
        'Accept': 'application/json',
    }
    fetch(url, {
        method:"GET",
        headers:headers,
        credentials:"same-origin"
    })
    .then(res => {
        res.json().then(v => {
            if (v.groups) {
                cb ({
                    status:'pass',
                    groups: v.groups
                })
            } else {
                cb ({
                    status:'fail',
                    message: v.error ? v.error : (v.message ? v.message : 'attempt to get tenant roles failed')
                })
            }
        })
    })
}

export function getPendingRequests(cb) {
    let url = base_url + '/api/tenant/requests'

    let headers = {
        'Accept': 'application/json',
    }
    fetch(url, {
        method:"GET",
        headers:headers,
        credentials:"same-origin"
    })
    .then(res => {
        res.json().then(v => {
            if (v.requests) {
                cb ({
                    status:'pass',
                    requests: v.requests
                })
            } else {
                cb ({
                    status:'fail',
                    message: v.error ? v.error : (v.message ? v.message : 'attempt to get tenant requests failed')
                })
            }
        })
    })
}

export function getUsers(cb) {
    let url = base_url + '/api/tenant/users'

    let headers = {
        'Accept': 'application/json',
    }
    fetch(url, {
        method:"GET",
        headers:headers,
        credentials:"same-origin"
    })
    .then(res => {
        res.json().then(v => {
            if (v.users) {
                cb ({
                    status:'pass',
                    users: v.users
                })
            } else {
                cb ({
                    status:'fail',
                    message: v.error ? v.error : (v.message ? v.message : 'attempt to get tenant users failed')
                })
            }
        })
    })
}

export function approveOrDenyRequest(type, id, cb) {
    let postdata = {
        id: id
    }
    let url = base_url + (type=='approve'? '/api/tenant/request/approve' : '/api/tenant/request/deny')
    let body = [];
    Object.keys(postdata).map((key,i) => {
        body.push(encodeURIComponent(key) + "=" + encodeURIComponent(postdata[key]))
    })
    body = body.join('&')

    let headers = {
        'Accept': 'application/json',
        'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
    }
    fetch(url, {
        method:"POST",
        headers:headers,
        body:body,
        credentials:"same-origin"
    })
    .then(res => {
        res.json().then(v => {
            if (v.statusCode == 202) {
                cb ({
                    status:'pass'
                })
            } else {
                cb ({
                    status:'fail',
                    message: v.error ? v.error : (v.message ? v.message : 'attempt to approve or deny failed')
                })
            }
        })
    })
}

export function joinOrLeaveGroups(type, username, ids, cb) {
    if (ids == '')
        return cb()
    let postdata = {
        ids: ids,
        username:username
    }

    let url = base_url + (type == 'join'? '/api/user/groups/join' : '/api/user/groups/leave')
    let body = [];
    Object.keys(postdata).map((key,i) => {
        body.push(encodeURIComponent(key) + "=" + encodeURIComponent(postdata[key]))
    })
    body = body.join('&')

    let headers = {
        'Accept': 'application/json',
        'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
    }
    fetch(url, {
        method:"POST",
        headers:headers,
        body:body,
        credentials:"same-origin"
    })
    .then(res => {
        res.json().then(v => {
            if (v.user) {
                cb ({
                    status:'pass',
                    user:v.user
                })
            } else {
                cb ({
                    status:'fail',
                    message: v.error ? v.error : (v.message ? v.message : 'attempt to approve or deny failed')
                })
            }
        })
    });
}

export function getUser(username, cb) {

    let url = base_url + '/api/tenant/user/'+username

    let headers = {
        'Accept': 'application/json',
        'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
    }
    fetch(url, {
        method:"GET",
        headers:headers,
        credentials:"same-origin"
    })
    .then(res => {
        res.json().then(v => {
            if (v.user) {
                cb ({
                    status:'pass',
                    user:v.user
                })
             } else {
                cb ({
                    status:'fail',
                    message: v.error ? v.error : (v.message ? v.message : 'attempt to approve or deny failed')
                })
             }
        })
    });
}

export function postToken(cb) {
    let url = base_url + '/api/tenant/token'

    let headers = {
        'Accept': 'application/json',
        'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
    }
    fetch(url, {
        method:"GET",
        headers:headers
    })
    .then(res => {
        res.json().then(v => {
            if (v.token)
                cb(v.token, v.domain)
            else
                cb()
        })
    });
}