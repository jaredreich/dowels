![Alt text](/dowels.png?raw=true "logo")

[![codecov](https://codecov.io/gh/jaredreich/dowels/branch/master/graph/badge.svg)](https://codecov.io/gh/jaredreich/dowels)

dowels is a tiny but powerful javascript library that performs client-side routing, templating, and REST API communication to help you get your single-page web applications running in seconds without having to learn huge fancy frameworks like Angular, React, etc. Demo: https://jaredreich.com/projects/dowels

## Features
- Pure JavaScript (no dependencies)
- Tiny size (4kB minified)
- Easy and intuitive routing (Express style, supports parameters and wildcards)
- Simple and fast (caching) template rendering (Embedded JavaScript style)
- Handy HTTP request helpers

## Browser support
- IE 10+
- Firefox 4+
- Chrome 5+
- Safari 6+
- Opera 11.5+

## Installation
HTML:
```html
<body>
	...
	<script src="https://unpkg.com/dowels"></script>
</body>
```
npm:
```
npm install dowels
```
bower:
```
bower install dowels
```

## Important requirement: your server must allow a changing URL path
This means that your main application URL path (example.com/app) and any other subsequent URL paths (example.com/app/*) must always route to the main index.html file.

### How to achieve this:
#### Node.js & Express
```
app.use(express.static(__dirname + '/public'));
app.get(['/app', '/app/*'], function(req, res) {
	res.sendFile('index.html', { root: __dirname + '/public' });
});
```

#### Apache & .htaccess
```
RewriteEngine on
RewriteCond %{REQUEST_FILENAME} -s [OR]
RewriteCond %{REQUEST_FILENAME} -l [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^.*$ - [NC,L]
RewriteRule ^(.*) /index.html [NC,L]
```

#### NGINX
```
server {
	...
	location /app/ {
		/path/to/index.html
	}
}
```

## Usage
```javascript
dowels.config({
    root: '/projects/dowels', // root path of your app
    containerId: 'app', // HTML container of your app's content
    titleBase: 'dowels: app', // base of HTML title for tabs/favorites/history
    apiBase: 'https://jaredreich.com/api/todos', // base of API endpoint for requests
    onLoadStart: function() {
        document.getElementById('loader').style.display = 'block';
    },
    onLoadStop: function() {
        document.getElementById('loader').style.display = 'none';
    }
});

dowels.add('/', function() {
    dowels.render('app-template-home');
});

dowels.add('/todos', function() {
    dowels.renderAfterRequest('app-template-todos', {
        method: 'get',
        endpoint: '/todos'
    }, 'todos');
});

dowels.add('/todos/:id', function(parameters) {
    dowels.renderAfterRequest('app-template-todo', {
        endpoint: '/todos' + '/' + parameters.id
    }, 'todo');
});

dowels.add('/*', function() {
    dowels.redirect('/');
});

dowels.initialize();
```

```html
<body>

	...

	<!-- Templates -->
    <script id="app-template-home" type="text/html">
        <h1>home page!</h1>
        <button onclick="dowels.route('/todos');">view todos</button>
    </script>

    <script id="app-template-todos" type="text/html">
        <button onclick="dowels.route('/')">&#8592; back home</button>
        <br>
        <input id="todoInput" type="text" placeholder="add a todo">
        <button onclick="addTodo(document.getElementById('todoInput').value)">+ add</button>
        <# if (todos.length > 0) { #>
            <ul id="collection-todos">
        <#
            for (var i = 0; i < todos.length; i++) {
                var todo = todos[i];
        #>
                <li><span onclick="dowels.route('/todos/' + '<#= todo.id #>')" style="cursor:pointer;text-decoration:underline;"><#= todo.text #></span><button style="padding:0;height:20px;margin-left:10px;" onclick="removeTodo('<#= todo.id #>');">x</button></li>
        <#		} #>
            </ul>
        <# } else { #>
            <h3>nothing to do!</h3>
        <# } #>
    </script>

    <script id="app-template-test" type="text/html">
        <h3>todo selected: <#= todo.text #></h3>
    </script>

    <script id="app-template-todo" type="text/html">
        <button onclick="dowels.route('/todos')">&#8592; back to todo list</button>
        <# if (err) { #>
            <h3><#= err #></h3>
        <# } else { #>
            <# include app-template-test #>
        <# } #>
    </script>

	<script src="/path/to/dowels.js"></script>

	<script>

	    function addTodo(text) {
            document.getElementById('todoInput').value = '';
            var data = {
                text: text
            }
            dowels.request({
                method: 'post',
                endpoint: '/todos',
                body: data
            }, function(res) {
                dowels.renderAfterRequest('app-template-todos', {
                    method: 'get',
                    endpoint: '/todos'
                }, 'todos');
            });

        }

        function removeTodo(id) {
            dowels.request({
                method: 'delete',
                endpoint: '/todos/' + id
            }, function(res) {
                dowels.renderAfterRequest('app-template-todos', {
                    method: 'get',
                    endpoint: '/todos'
                }, 'todos');
            });
        }

    </script>

</body>
```

## Configuration and Options
```javascript
dowels.config({

	// use hash in url instead of hard url
	// default = true
	// ***NOTE*** see important requirement above if hash is set to false
	hash: true,

	// root path of your app
	// default = '/'
	root: '/app',

	// HTML container of your app's content
	// default = 'app'
	containerId: 'app-content',

	// base of HTML title for tabs/favorites/history
	// default = document.title
	titleBase: 'dowels: app',

	// base of API endpoint for requests
	// default = document.location.protocol + '//' + document.location.hostname + '/api';
	apiBase: 'https://dowels.io/api',

	// your choice of delimiter for the EJS  style templating
	// default = '#'
	delimiter: '#',

	// runs when HTTP requests are in progress
	// default = function(){}
	onLoadStart: function() {
		document.getElementById('loader').style.display = 'block';
	},

	// runs when HTTP requests change state
	// default = function(){}
	onLoadUpdate: function(percent) {
		document.getElementById('loader').style.width = percent + '%';
	},

	// runs when HTTP requests are in finished
	// default = function(){}
	onLoadStop: function() {
		document.getElementById('loader').style.display = 'none';
	}
});
```
## To-do
- custom delimiter (ex. #, %, etc...)
- tests + coverage
- hash option for routing
- more control over changing of document.title while routing
