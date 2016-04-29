# dowels

[![Join the chat at https://gitter.im/jaredreich/dowels](https://badges.gitter.im/jaredreich/dowels.svg)](https://gitter.im/jaredreich/dowels?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Coverage Status](https://coveralls.io/repos/github/jaredreich/dowels/badge.svg?branch=master)](https://coveralls.io/github/jaredreich/dowels?branch=master)

dowels is a tiny but powerful web framework that performs client-side routing and templating to help you get your single-page web applications running in seconds without having to learn huge fancy frameworks like Angular, React, etc. Full demo and documentation coming soon.

![Alt text](/dowels.png?raw=true "logo")

## Features
- Pure JavaScript (no dependencies)
- Tiny size (4kB minified)
- Easy and intuitive routing (Express style, supports parameters and wildcards)
- Simple and fast templating (Embedded JavaScript style)

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
	<script src="/path/to/dowels.js"></script>
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
	listen					80;
	server_name				example.com  www.example.com;
	location /app {
		/path/to/index.html
	}
}
```

## Usage
```javascript

dowels.config({
    root: '/app', // root path of your app
	containerId: 'app-content', // HTML container of your app's content
	titleBase: 'dowels: app', // base of HTML title for tabs/favorites/history
	apiBase: 'https://dowels.io/api' // base of API endpoint for requests
});

dowels.add('/', function() {
	dowels.redirect('/profile');
});

dowels.add('/profile', function() {
	var data = {
		user: {
			name: 'Jane Smith',
			email: 'janesmith@gmail.com'
		}
	}
	dowels.render('app-template-profile', data);
});

dowels.add('/items', function() {
	dowels.renderAfterRequest('app-template-item', {
		method: 'get',
		endpoint: '/items'
	});
});

dowels.add('/item/:id', function(parameters) {
	dowels.renderAfterRequest('app-template-item', {
		endpoint: '/items' + '/' + parameters.id
	});
});

dowels.add('/*', function() {
	dowels.redirect('/profile');
});

dowels.initialize();
```

```html
<body>

	...

	<script id="app-template-profile" type="text/html">
		<# if (typeof user.name !== 'undefined' && user.name) { #>
			<div>Welcome <#= user.name #></div>
		<# } else { #>
			<div>Welcome user!</div>
		<# } #>
	</script>

	<script id="app-template-items" type="text/html">
		<ul>
		<# for (var i = 0; i < res.length; i++) { #>
			<# var item = res[i]; #>
			<li>Title: <#= item.title #>, Description: <#= item.description #></li>
		<# } #>
		</ul>
	</script>

	<script id="app-template-item" type="text/html">
		<# var item = res; #>
		<div>Title: <#= item.title #>, Description: <#= item.description #></div>
	</script>
	
	<script src="/path/to/dowels.js"></script>
	
</body>
```

## Documentation
Full demo and documentation coming soon.
