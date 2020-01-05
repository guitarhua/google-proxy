// jQuery
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const {document} = (new JSDOM('<!DOCTYPE html><html><body></body></html>')).window;
global.document = document;
const window = document.defaultView;
const $ = require('jquery')(window);

void 0 === String.prototype.utf8Encode && (String.prototype.utf8Encode = function() {
    return unescape(encodeURIComponent(this))
});

void 0 === String.prototype.utf8Decode && (String.prototype.utf8Decode = function() {
    try {
        return decodeURIComponent(escape(this))
    } catch(t) {
        return this
    }
});

void 0 === String.prototype.base64Encode && (String.prototype.base64Encode = function() {
    return this
});

void 0 === String.prototype.base64Decode && (String.prototype.base64Decode = function() {
    return this
});

// TEA加解密算法
var tea = {
    E: function(t, e) {
        if (t = String(t), e = String(e), 0 == t.length) return "";
        var n = this.strToLongs(t.utf8Encode()),
        o = this.strToLongs(e.utf8Encode().slice(0, 16));
        n.length;
        return n = this.encode(n, o),
        this.longsToStr(n).base64Encode()
    },
    D: function(t, e) {
        if (t = String(t), e = String(e), 0 == t.length) return "";
        var n = this.strToLongs(t.base64Decode()),
        o = this.strToLongs(e.utf8Encode().slice(0, 16));
        n.length;
        n = this.decode(n, o);
        var i = this.longsToStr(n);
        return (i = i.replace(/\0+$/, "")).utf8Decode()
    },
    encode: function(t, e) {
        t.length < 2 && (t[1] = 0);
        for (var n, r, o = t.length,
        i = t[o - 1], a = t[0], u = Math.floor(6 + 52 / o), c = 0; u-->0;) {
            r = (c += 2654435769) >>> 2 & 3;
            for (var s = 0; s < o; s++) n = (i >>> 5 ^ (a = t[(s + 1) % o]) << 2) + (a >>> 3 ^ i << 4) ^ (c ^ a) + (e[3 & s ^ r] ^ i),
            i = t[s] += n
        }
        return t
    },
    decode: function(t, e) {
        for (var n, r, o = t.length,
        i = t[o - 1], a = t[0], u = 2654435769 * Math.floor(6 + 52 / o); 0 != u;) {
            r = u >>> 2 & 3;
            for (var c = o - 1; c >= 0; c--) n = ((i = t[c > 0 ? c - 1 : o - 1]) >>> 5 ^ a << 2) + (a >>> 3 ^ i << 4) ^ (u ^ a) + (e[3 & c ^ r] ^ i),
            a = t[c] -= n;
            u -= 2654435769
        }
        return t
    },
    strToLongs: function(t) {
        for (var e = new Array(Math.ceil(t.length / 4)), n = 0; n < e.length; n++) e[n] = t.charCodeAt(4 * n) + (t.charCodeAt(4 * n + 1) << 8) + (t.charCodeAt(4 * n + 2) << 16) + (t.charCodeAt(4 * n + 3) << 24);
        return e
    },
    longsToStr: function(t) {
        for (var e = new Array(t.length), n = 0; n < t.length; n++) e[n] = String.fromCharCode(255 & t[n], t[n] >>> 8 & 255, t[n] >>> 16 & 255, t[n] >>> 24 & 255);
        return e.join("")
    },
    P: function(t, e) {
        for (var n = (t + e).replace("T", ""), r = [], o = 0; o < 16; o++) r.push(String.fromCharCode(parseInt(n.charCodeAt(o) + n.charCodeAt(o + 16) + n.charCodeAt(o + 32)) / 3));
        return r.join("")
    }
};

function offlineTime() {
    return (new Date).toISOString().substr(0, 19).replace(/-/g, "").replace(/:/g, "")
}

!function() {
    const uuid = "d828f5f6-0963-4198-bbc5-0c111111xxxx";
    const time = offlineTime();
    const data = {
        links: ["http://360.hao245.com", "http://123.hao245.com"]
    };
    var proxyServer = [];
    for(let i = 0; i < 20; i++) {
        $.ajax({
            method: "POST",
            crossDomain: true,
            tryCount: 0,
            retryLimit: 2,
            url: `https://www.andwe.me/app/ext/updateTaskRule2?uuid=${uuid}&time=${time}`,
            data: {
                D: tea.E(JSON.stringify(data), tea.P(uuid, time))
            },
            async: false,
            success: function(s) {
                try {
                    let response = JSON.parse(tea.D(s, tea.P(uuid, time)));
                    for(let server of response.proxyServer) {
                        let tokens = server.split(':');
                        proxyServer.push(tokens[0] + ' ' + tokens[1] + ':' + tokens[2]);
                        console.log(server);
                    };
                } catch (e) {
                    console.error(e);
                }
            },
            error: function(t, e) {
                console.error(e);
            }
        });
    }

    var fs = require('fs');
    var pac = fs.readFileSync("pac.template", "utf-8");
    pac = pac.replace('__PROXY__', proxyServer.join('; '));
    console.log(pac);
    fs.writeFileSync("pac", pac);
}();
