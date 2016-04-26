/*

dowels.js

Licensed under the MIT license:
http://www.opensource.org/licenses/mit-license.php

Version:  1.0.0

*/

var dowels = function() {
    
    var routes = [];
	var last = {
		path: '',
		title: ''
	};
	var cache = {};
	
	var root = '/';
	var containerId = 'app';
	var titleBase = 'Example App: ';
	var apiBase = 'https://example.com/api';
    
    function config(options) {
        if (typeof options !== 'undefined') {
            if (typeof options.root !== 'undefined' && options.root) root = options.root;
			if (typeof options.containerId !== 'undefined' && options.containerId) containerId = options.containerId;
			if (typeof options.titleBase !== 'undefined' && options.titleBase) titleBase = options.titleBase;
			if (typeof options.apiBase !== 'undefined' && options.apiBase) apiBase = options.apiBase;
        }
    }
	
    function add(path, handler) {
        
        var parameters = {};
        var parameterLocations = [];
        var regexString = '';
		
        if (path instanceof RegExp) {
            regexString = path.toString().slice(0, -1);
            regexString += '(?:\/(?=$))?$';
        }
        else if (typeof path === 'string') {
            regexString = '^';
            var sections = path.substring(1).split('/');
            for (var i = 0; i < sections.length; i++) {
                var section = sections[i];
                if (section.charAt(0) === ':') {
                    regexString += '\/([^\\/]+?)';
                    parameters[section.substring(1)] = '';
                    parameterLocations.push(sections.indexOf(section));
                }
				else if (section === '*') {
					regexString += '\/(.*)';
				}
                else {
                    regexString += '\/' + section;
                }
            }
            regexString += '(?:\/(?=$))?$';
        }
        else {
            throw 'invalid path type, must be regex or string';
			
        }
		
		routes.push({ regex: regexString, handler: handler, parameters: parameters, parameterLocations: parameterLocations});
		
    }
    
    function initialize() {
        nav(current(), true);
    }
	
	function redirect(path) {
		nav(path, true);
	}
	
	function back(fallbackPath) {
		if (last.path === fallbackPath) {
			window.history.back();
			document.title = titleBase + last.path;
		}
		else {
			nav(fallbackPath);
		}
	}
    
    function nav(path, replace) {
		
		last.path = current();
		last.title = document.title;
		
		var title = titleBase + path;
		var found = true;
		replace = typeof replace === 'undefined' ? false : replace;
		
		document.getElementById(containerId).innerHTML = '';
		
		if (path === '') path = '/';
        for (var i = 0; i < routes.length; i++) {
            var route = routes[i];
            var regex = new RegExp(route.regex, 'i');
			
            if (regex.test(path)) {
				
                var sections = path.substring(1).split('/');
                
                var newArray = [];
                for (var j = 0; j < route.parameterLocations.length; j++) {
                    var loc = route.parameterLocations[j];
                    newArray.push(sections.slice(loc, loc + 1).toString());
                }
                
                var k = 0;
                for (var parameter in route.parameters) {
                    if (route.parameters.hasOwnProperty(parameter)) {
                        route.parameters[parameter] = newArray[k];
                        k++;
                    }
                }
				
				if (replace === true) {
					if (path === '/') {
						window.history.replaceState(null, null, root);
					}
					else {
						root === '/' ? window.history.replaceState(null, null, path) : window.history.replaceState(null, null, root + path);
					}
				}
				else {
					if (path === current()) {
						return;
					}
					else if (path === '/') {
						window.history.pushState(null, null, root);
					}
					else {
						root === '/' ? window.history.pushState(null, null, path) : window.history.pushState(null, null, root + path);
					}
				}
				document.title = title;
                
                route.handler.apply(null, [route.parameters]);
				
				return;
				
            }
        }
		
		throw '"' + path + '" does not match a route.';
		
    }
    
    function current() {
        return root !== '/' ? window.location.pathname.replace(root, '') : window.location.pathname;
    }
	
	function render(templateId, data){
		var template = document.getElementById(templateId);
		templateHTML = template != null ? template.innerHTML : '<div>template does not exist</div>';
		data = typeof data !== 'undefined' && data ? data : {};
		var func = cache[templateHTML];
		if (!func) {
			var strFunc =
			"var p=[],print=function(){p.push.apply(p,arguments);};" +
						"with(obj){p.push('" +
			templateHTML.replace(/[\r\t\n]/g, "")
				.replace(/'(?=[^#]*#>)/g, "\t")
				.split("'").join("\\'")
				.split("\t").join("'")
				.replace(/<#=(.+?)#>/g, "',$1,'")
				.split("<#").join("');")
				.split("#>").join("p.push('")
				+ "');}return p.join('');";
			func = new Function('obj', strFunc);
			cache[templateHTML] = func;
		}
		document.getElementById(containerId).innerHTML = func(data);
	}
	
	function request(options, callback) {
		
		var method = '';
		var url = '';
		var body = {};
		var headers = ['Content-type: application/json'];
		
		if (typeof options.method !== 'undefined' && options.method) {
			options.method = options.method.toString().toUpperCase();
			var methods = ['GET', 'POST', 'PUT', 'DELETE'];
			if (methods.indexOf(options.method) !== -1) {
				method = options.method;
			}
			else throw 'dowels.request "method" must be "get", "post", "put", or "delete"';
		}
		else {
			method = 'GET';
		}
		
		if (typeof options.endpoint !== 'undefined' && options.endpoint && options.endpoint.length > 0) {
			url = apiBase + options.endpoint.toString();
		}
		else if (typeof options.endpointFull !== 'undefined' && options.endpointFull && options.endpointFull.length > 0) {
			url = options.endpointFull.toString();
		}
		else {
			throw 'dowels.request must have either "endpoint" or "endpointFull" specified in options';
		}
		
		if (typeof options.body !== 'undefined' && options.body) {
			body = JSON.stringify(options.body);
		}
		
		if (typeof options.headers !== 'undefined' && options.headers) {
			headers = options.headers;
		}
		
		var http = new XMLHttpRequest();
		http.open(method, url, true);
		
		for (var i = 0; i < headers.length; i++) {
			var header = headers[i];
			var name = header.split(': ')[0];
			var val = header.split(': ')[1];
			http.setRequestHeader(name, val);
		}
		
		http.onreadystatechange = function() {
			if (http.readyState == 4 && http.status == 200) {
				if (callback) {
					callback(JSON.parse(http.responseText));
				}
			}
		}
		http.send(body);
	}
	
	function renderAfterRequest(templateId, options) {
		request(options, function(res) {
			var data = {
				res: res
			}
			render(templateId, data);
		});
	}
	
    window.addEventListener('popstate', function(event) {
		if (current() === last.path) {
			// Back
			nav(last.path, true);
		}
		else {
			// Forward
			nav(current(), true);
		}
    });
    
    return {
        config: config,
        add: add,
        initialize: initialize,
        nav: nav,
		back: back,
		redirect: redirect,
		render: render,
		request: request,
		renderAfterRequest: renderAfterRequest
    }
    
}();

// Node.js
if (typeof module === 'object' && module.exports) {
    module.exports = dowels;
}