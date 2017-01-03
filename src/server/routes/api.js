var express = require('express');
var querystring = require('querystring');
var request = require('request');
var cryptojs = require("crypto-js");
var debug = require('debug')('timeli-admin');

const TIMELI_VERSION = 3;
const TIMELI_DOMAIN  = "demo.timeli.io";

const URL_PREFIX     = 'http://'+process.env.SDK_REST_URL;
debug("[INFO] connection to metadata app uses url prefix: "+URL_PREFIX);
const AUTH_TOKEN     = "/api/auth/token";

const REQ_GET        = 'GET';
const REQ_POST       = 'POST';
const REQ_DELETE     = 'DELETE';
const REQ_PUT        = 'PUT';

var router = express.Router();
var token_cache = [];

router.get('/tenant/token', function(req,res,next) {
    init_tenant_token(function(res1) {
        if (res1.token) {
            res.status(200).json({token:res1.token, domain:res1.domain});
        }
        else {
            res.status(200).json(res1);
        }
    });
});



router.get('/tenant/groups', function(req,res,next) {
    var token = req.cookies.token;
    var domain = req.cookies.domain;
    do_request(REQ_GET, token, domain, '/api/groups/all', '', function (res1) {
        if (res1.data && (res1.statusCode == 200)) {
            var groups = [];
            res1.data.forEach(function(v) {
                groups.push({id:v.id, roles:v.roles, implied:v.implied});
            });
            return res.status(200).json({groups:groups});
        }
        else {
            console.log("[GET /tenant/groups] " +JSON.stringify(res1));
            res.status(200).json(res1);
        }
    });
});


router.get('/tenant/requests', function(req,res,next) {
    var token = req.cookies.token;
    var domain = req.cookies.domain;
    do_request(REQ_GET, token, domain, '/api/group/requests', '', function (res1) {
        if (res1 && (res1.statusCode == 200)) {
            get_request_details(token, domain, res1.data, [], function(details) {
                res.status(200).json({requests:details});
            });
        }
        else {
            console.log("[GET /tenant/requests/] "+JSON.stringify(res1));
            res.status(200).json(res1);
        }

    });
});

router.get('/tenant/users', function(req,res,next) {
    var token = req.cookies.token;
    var domain = req.cookies.domain;
    var loggedinuser = req.cookies.user;
    do_request(REQ_GET, token, domain, '/api/users/all', '', function (res1) {
        if (res1 && (res1.statusCode == 200)) {
            var users = [];
            res1.data.forEach(function(user) {
                var u = {
                    username:user.username,
                    email:user.email,
                    name:user.fullname,
                    roles: []
                };
                user.groups.forEach(function(g) {
                    g.roles.forEach(function(r) {
                        if (u.roles.indexOf(r) < 0) {
                            u.roles.push(r);
                        }
                    })
                });
                if (user.username == loggedinuser) {
                    u.self = true;
                }
                users.push(u);
            });
            res.status(200).json({users:users});
        }
        else {
            console.log("[GET /tenant/users] "+JSON.stringify(res1));
            res.status(200).json(res1);
        }
    });
});

router.get('/tenant/user/:name', function(req,res,next) {
    var token = req.cookies.token;
    var domain = req.cookies.domain;

    var username = req.params.name;
    do_request(REQ_GET, token, domain, '/api/users/'+username, '', function (res1) {
        if (res1.statusCode == 200) {
            var user = {
                username: res1.username,
                email:res1.email,
                name:res1.fullname,
                roles:[]
            };
            res1.groups.forEach(function(g) {
                g.roles.forEach(function(r) {
                    if (user.roles.indexOf(r) < 0) {
                        user.roles.push(r);
                    }
                })
            });
            res.status(200).json({user:user});
        }
        else {
            console.log("[GET /tenant/user/"+username+"] "+JSON.stringify(res1));
            res.status(200).json(res1);
        }
    });
});

router.post('/tenant/token', function(req,res,next) {
    var token = req.body.token;
    var domain = req.body.domain;
    var user = req.body.username;
    res.cookie('token',token, {maxAge: 900000, httpOnly: true});
    res.cookie('domain',domain, {maxAge: 900000, httpOnly: true});
    res.cookie('user',user, {maxAge: 900000, httpOnly: false});
    res.redirect((process.env.APP_BASE ? process.env.APP_BASE : '') +'/');
});

router.post('/tenant/request/approve', function(req,res,next) {
    var token = req.cookies.token;
    var domain = req.cookies.domain;

    var request_id = req.body.id;
    approve_or_deny_request('approve', request_id, token, domain, function(res1) {
        res.status(200).json(res1);
    });
});

router.post('/tenant/request/deny', function(req,res,next) {
    var token = req.cookies.token;
    var domain = req.cookies.domain;

    var request_id = req.body.id;
    approve_or_deny_request('deny', request_id, token, domain, function(res1) {
        res.status(200).json(res1);
    });
});

router.post('/user/groups/join', function(req,res,next) {
    var token = req.cookies.token;
    var domain = req.cookies.domain;

    var group_ids = req.body.ids;
    var username = req.body.username;
    join_or_leave_group('join', username, group_ids, token, domain, function(res1) {
        res.status(200).json(res1)
    })
});

router.post('/user/groups/leave', function(req,res,next) {
    var token = req.cookies.token;
    var domain = req.cookies.domain;

    var group_ids = req.body.ids;
    var username = req.body.username;
    join_or_leave_group('leave', username, group_ids, token, domain, function(res1) {
        res.status(200).json(res1)
    })
});



module.exports = router;


function get_user_details(token, domain, username, cb) {
    do_request(REQ_GET, token, domain, '/api/users/'+username, '', function (res1) {
        cb(res1);
    });
}

function get_request_details(token, domain, requests, results, cb) {
    if (requests.length == 0) {
        cb(results);
        return;
    }
    var request = requests.pop();
    if (!("approved" in request)) {
        get_user_details(token, domain, request.username, function(resp) {
            var r = {};
            if (resp.statusCode == 200) {
                r.id = request.id;
                r.approved = request.approved;
                r.username = resp.username;
                r.name = resp.fullname;
                r.email = resp.email;
                r.time = new Date();
            }
            else {
                r.error = "failed to get user";
            }
            results.push(r);
            get_request_details(token, domain, requests,results,cb);
        });
    }
    else {
        get_request_details(token, domain, requests,results,cb);
    }

}


function approve_or_deny_request(action, id, token, domain, cb) {
    do_request(REQ_PUT, token, domain, '/api/group/requests/'+action+'/'+id, '', function (res) {
        cb(res);
    });
}

function join_or_leave_group(action, username, ids, token, domain, cb) {
    var body = querystring.stringify({ids:ids});
    do_request(REQ_POST, token, domain, '/api/users/'+username+'/'+action, body, function (res) {
        if (res.statusCode == 200) {
            var user = {
                username: res.username,
                email:res.email,
                name:res.fullname,
                roles:[]
            };
            res.groups.forEach(function(g) {
                g.roles.forEach(function(r) {
                    if (user.roles.indexOf(r) < 0) {
                        user.roles.push(r);
                    }
                })
            });
            return cb({user:user});
        }
        else
            return cb(res);
    });
}

/*

function set_user_to_admin_group(tenant_id, username, cb) {
    get_token(function (res) {
        if (res.token) {
            var token = res.token;
            do_request(REQ_GET, token, TIMELI_DOMAIN, '/api/groups/all', '', function (res) {
                if (res.error) {
                    cb(res);
                    return;
                }
                var group = null;
                for (var i=0; i<res.data.length; i++) {
                    if ((res.data[i].tenantId == tenant_id) && (res.data[i].roles[0] == 'TenantAdmin')) {
                        group = res.data[i].id;
                        break;
                    }
                };
                if (group == null) {
                    cb({error:'failed to add user to the admin group. group not found.'});
                    return;
                }
                var body = querystring.stringify({
                    ids:group
                });
                do_request(REQ_POST, token, TIMELI_DOMAIN, '/api/users/'+username+'/join', body, function (res) {
                    cb(res);
                });
            });
        }
        else {
            cb(res);
        }
    });
}*/

function do_request(type, token, domain, url, body, cb) {
    var req = {
        url: URL_PREFIX+url,
        body:body
    }

    req.headers = get_api_headers(token, domain);
    switch(type) {
        case REQ_GET:
            request.get(req, function(err,res,body) {
                process_api_response(err,res,body,cb);
            });
            break;
        case REQ_POST:
            request.post(req,function(err,res,body) {
                process_api_response(err,res,body,cb);
            });
            break;
        case REQ_DELETE:
            request.delete(req,function(err,res,body) {
                process_api_response(err,res,body,cb);
            });
            break;
        case REQ_PUT:
            request.put(req,function(err,res,body) {
                process_api_response(err,res,body,cb);
            });
            break;
        default:
            cb({error:'request type not supported'});
            break;
    }
}

function process_api_response(err, res, body, cb) {
    var body = body || {};
    if (err) {
        cb({error: err, statusCode:404});
    } else {
        var obj = JSON.parse(body);
        obj.statusCode = res.statusCode;
        cb(obj);
    }
}

function get_api_headers(token, domain) {
    return {
        'Accept': "application/json; charset=utf-8",
        'X-Timeli-Version': TIMELI_VERSION,
        'X-Timeli-Domain': domain,
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': "http://localhost",
        'X-Timeli-Auth':get_auth(),
        'Authorization':'Bearer ' + token
    }
}



function get_auth() {
    var d = new Date();
    d.setSeconds(0);
    d.setMilliseconds(0);
    var access_token = d.toISOString();
    var m = access_token.match(/T(.*?):/);
    if (!m) {
        return access_token;
    }
    else {
        var h = parseInt(m[1]);
        if (h > 12) {
            h = h-12;
            if (h < 10) {
                h = '0'+h;
            }
            access_token = access_token.replace(/T(.*?):/, 'T'+h+':');
        }
    }
    access_token = access_token.replace(/Z$/,'+0000|You');
    var rawAESKey = "Your mouth is talking, you might look to that.".substring(0, 16);
    var iv = "I aim to misbehave!".substring(0, 16);
    var key = cryptojs.enc.Utf8.parse(rawAESKey);
    var iv = cryptojs.enc.Utf8.parse(iv);
    var encrypted = cryptojs.AES.encrypt(
        access_token,
        key,
        {
            iv: iv,
            mode: cryptojs.mode.CBC
        }
    );
    var ret = encrypted.ciphertext.toString(cryptojs.enc.Base64);

    return ret;
}

function init_tenant_token(cb) {
    params = {
        grant_type:     "password",
        client_id:      "92ec4297-b07c-4cb2-8ec6-ae4930a371ae",
        client_secret: "NTgyODE1MGIyNGZi",
        username:       "vj1030",
        password:       "!vj1030QWERTY",
        scope:          "TenantAdmin",
        redirect_uri:   "http://localhost",
        domain:         "myzencorp.timeli.io"
    }
    get_tenant_token(params,function(resp) {
        if (resp.token) {
            resp.domain = params.domain;
            cb(resp);
        }
    });
}

function get_token(params, cb) {
    if (typeof(params) === "function") {
        cb = params;
        params = {
            grant_type:     "password",
            client_id:      "00000000-0000-0000-0000-000000000000",
            client_secret:  "dem0s3cRe7",
            username:       "admin",
            password:       "password",
            scope:          "SysAdmin",
            redirect_uri:   "http://testclient.timeli.io",
            domain:         "demo.timeli.io"
        };
    }
    get_tenant_token(params,cb);
}

function get_tenant_token(params, cb) {

    if (token_cache[params.client_id]) {
        if (token_cache[params.client_id].expires.getTime() > (new Date().getTime() + 60*60*1000)) {
            cb({token: token_cache[params.client_id].token});
            return;
        }
    }

    var post_data = querystring.stringify({
        grant_type: params.grant_type,
        client_id: params.client_id,
        client_secret: params.client_secret,
        username: params.username,
        password: params.password,
        scope: params.scope,
        redirect_uri: params.redirect_uri
    });

    request.post({
        url: URL_PREFIX + AUTH_TOKEN,
        headers: {
            'X-Timeli-Version': TIMELI_VERSION,
            'Accept': "application/json; charset=utf-8",
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Timeli-Domain': params.domain,
            'X-Timeli-Auth':get_auth()
        },
        body: post_data
    }, function(err, res, body) {
        body = body || {};
        if (err) {
            cb({error: 'authentication failed - '+err});
        } else {
            var obj = JSON.parse(body);
            if (!obj.hasOwnProperty('access_token')) {
                cb({error: 'authentication failed. no access token '+body});
            } else {
                token_cache[params.client_id] = {
                    token: obj.access_token,
                    expires: new Date(new Date().getTime() + (obj.expires_in*1000))
                };
                cb({token: obj.access_token});
            }
        }
    });
};
