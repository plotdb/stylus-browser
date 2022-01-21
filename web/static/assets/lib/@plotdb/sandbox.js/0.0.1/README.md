# sandbox.js

Sandboxing javascript in embedded iframe.


## Usage

var sandbox = new Sandbox(config);

## Configurations

 * root - root element. sandbox.js will create one if this is omitted.
 * container - if root is not specified or root doesn't have a parent, attach root to container.
   default to document.body if both root and container are omitted.
 * sandbox - iframe sandbox attributes. default to "allow-scripts allow-pointer-lock".
   Note: blob iframe in Firefox exploits host cookie with empty sandbox.
 * className: space separated class list to add over the root element.
 * window - works in standalone popup window. root and container won't be necessary when window provided.
   window, if provided, should be an object containing following members:
   - name - window name. randomly generated if omitted.
   - width - window width. decided by sandbox.js if omitted.
   - height - window height. decided by sandbox.js if omitted.


## Methods

 * setProxy(({obj: obj}) - set an object as proxy interface. Proxy object must passed in an object like:

   ```
   sandbox.setProxy({ Interface: Interface });
   ```

   once set, you can invoke corresponding object in sandbox with following:

   ```
   sandbox.proxy.someFunc(args);
   ```

   you must have the object ( e.g., Interface ) with the exact same name as a global object in sandbox context.

 * send(msg) - send message to sandbox. msg will be wrapped in an object as:

   ```
   { type: \msg, payload: your-msg-data }
   ```

 * reload() - reload sandbox.
 * load(payload) - initialize sandbox content. payload can be a plain string or has following structure:

   ```
   {
      "html": (string or {url: HTML-URL} ),
      "css":  (string or {url: CSS-URL} ),
      "js":   (string or {url: JS-URL} )
   }
   ```
 * openWindow(cfg) - open sandbox in a standalone window.
   - cfg.name - window name.


## Sample Usage

iframe mode:
```
    /* create a sandbox instance */ 
    var sandbox = new Sandbox({
      container: 'selector-for-certain-node',
      className: 'space separated class names'
    });

    /* load and render code */
    sandbox.load({js: '...', html: '...', css: '...'});

    /* you can still render it again in a standalone window */
    sandbox.openWindow({name: "window-name"})
      .then(function() { ... });
```

window mode:
```
    /* create a sandbox instance */ 
    var sandbox = new Sandbox({
      window: 'window-name'
    });

    /* load and render code */
    sandbox.load({js: '...', html: '...', css: '...'});
```

you can also init with both modes:
```
    /* create a sandbox instance */ 
    var sandbox = new Sandbox({
      window: 'window-name',
      container: 'selector-for-certain-node'
    });
```


## License

MIT
