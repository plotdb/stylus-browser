(function(){
var createModuleFactory = function createModuleFactory(t){var e;return function(r){return e||t(e={exports:{},parent:r},e.exports),e.exports}};
var _$stylus_143 = createModuleFactory(function (module, exports) {
/*!
 * Stylus
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Renderer = _$renderer_138({})
  , nodes = _$nodes_115({})
  , utils = _$utils_146({});

/**
 * Export render as the module.
 */

exports = module.exports = render;

/**
 * Library version.
 */

exports.version = _$package_153.version;

/**
 * Expose nodes.
 */

exports.nodes = nodes;

/**
 * Expose BIFs.
 */

exports.functions = _$functions_50({});

/**
 * Expose utils.
 */

exports.utils = _$utils_146({});

/**
 * Expose middleware.
 */

exports.middleware = _$middleware_95({});

/**
 * Expose constructors.
 */

exports.Visitor = _$visitor_150;
exports.Parser = _$parser_137({});
exports.Evaluator = _$evaluator_149({});
exports.Normalizer = _$normalizer_151({});
exports.Compiler = _$compiler_147({});

/**
 * Convert the given `css` to `stylus` source.
 *
 * @param {String} css
 * @return {String}
 * @api public
 */

exports.convertCSS = _$css_22;

/**
 * Render the given `str` with `options` and callback `fn(err, css)`.
 *
 * @param {String} str
 * @param {Object|Function} options
 * @param {Function} fn
 * @api public
 */

exports.render = function(str, options, fn){
  if ('function' == typeof options) fn = options, options = {};
  return new Renderer(str, options).render(fn);
};

/**
 * Return a new `Renderer` for the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @return {Renderer}
 * @api public
 */

function render(str, options) {
  return new Renderer(str, options);
}

/**
 * Expose optional functions.
 */

exports.url = _$url_91({});
exports.resolver = _$resolver_72;

});
var _$css_4 = createModuleFactory(function (module, exports) {
exports.parse = _$parse_5;
exports.stringify = _$stringify_9;

});
var _$sourceMapSupport_10 = createModuleFactory(function (module, exports) {

/**
 * Module dependencies.
 */

var SourceMap = _$sourceMap_163.SourceMapGenerator;
var SourceMapConsumer = _$sourceMap_163.SourceMapConsumer;
var sourceMapResolve = require("source-map-resolve");
var fs = require("fs");
/* removed: var _$pathBrowserify_14 = require('path'); */;

/**
 * Expose `mixin()`.
 */

module.exports = mixin;

/**
 * Ensure Windows-style paths are formatted properly
 */

const makeFriendlyPath = function(aPath) {
  return _$pathBrowserify_14.sep === "\\" ? aPath.replace(/\\/g, "/").replace(/^[a-z]:\/?/i, "/") : aPath;
}

/**
 * Mixin source map support into `compiler`.
 *
 * @param {Compiler} compiler
 * @api public
 */

function mixin(compiler) {
  compiler._comment = compiler.comment;
  compiler.map = new SourceMap();
  compiler.position = { line: 1, column: 1 };
  compiler.files = {};
  for (var k in exports) compiler[k] = exports[k];
}

/**
 * Update position.
 *
 * @param {String} str
 * @api private
 */

exports.updatePosition = function(str) {
  var lines = str.match(/\n/g);
  if (lines) this.position.line += lines.length;
  var i = str.lastIndexOf('\n');
  this.position.column = ~i ? str.length - i : this.position.column + str.length;
};

/**
 * Emit `str`.
 *
 * @param {String} str
 * @param {Object} [pos]
 * @return {String}
 * @api private
 */

exports.emit = function(str, pos) {
  if (pos) {
    var sourceFile = makeFriendlyPath(pos.source || 'source.css');

    this.map.addMapping({
      source: sourceFile,
      generated: {
        line: this.position.line,
        column: Math.max(this.position.column - 1, 0)
      },
      original: {
        line: pos.start.line,
        column: pos.start.column - 1
      }
    });

    this.addFile(sourceFile, pos);
  }

  this.updatePosition(str);

  return str;
};

/**
 * Adds a file to the source map output if it has not already been added
 * @param {String} file
 * @param {Object} pos
 */

exports.addFile = function(file, pos) {
  if (typeof pos.content !== 'string') return;
  if (Object.prototype.hasOwnProperty.call(this.files, file)) return;

  this.files[file] = pos.content;
};

/**
 * Applies any original source maps to the output and embeds the source file
 * contents in the source map.
 */

exports.applySourceMaps = function() {
  Object.keys(this.files).forEach(function(file) {
    var content = this.files[file];
    this.map.setSourceContent(file, content);

    if (this.options.inputSourcemaps !== false) {
      var originalMap = sourceMapResolve.resolveSync(
        content, file, fs.readFileSync);
      if (originalMap) {
        var map = new SourceMapConsumer(originalMap.map);
        var relativeTo = originalMap.sourcesRelativeTo;
        this.map.applySourceMap(map, file, makeFriendlyPath(_$pathBrowserify_14.dirname(relativeTo)));
      }
    }
  }, this);
};

/**
 * Process comments, drops sourceMap comments.
 * @param {Object} node
 */

exports.comment = function(node) {
  if (/^# sourceMappingURL=/.test(node.comment))
    return this.emit('', node.position);
  else
    return this._comment(node);
};

});
var _$middleware_95 = createModuleFactory(function (module, exports) {
/*!
 * Stylus - middleware
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var stylus = _$stylus_143({})
  , fs = require("fs")
  , dirname = _$pathBrowserify_14.dirname
  , join = _$pathBrowserify_14.join
  , sep = _$pathBrowserify_14.sep
  , debug = _$debug_159('stylus:middleware')
  , mkdir = fs.mkdir;

/**
 * Import map.
 */

var imports = {};

/**
 * Return Connect middleware with the given `options`.
 *
 * Options:
 *
 *    `force`     Always re-compile
 *    `src`       Source directory used to find .styl files,
 *                a string or function accepting `(path)` of request.
 *    `dest`      Destination directory used to output .css files,
 *                a string or function accepting `(path)` of request,
 *                when undefined defaults to `src`.
 *    `compile`   Custom compile function, accepting the arguments
 *                `(str, path)`.
 *    `compress`  Whether the output .css files should be compressed
 *    `firebug`   Emits debug infos in the generated CSS that can
 *                be used by the FireStylus Firebug plugin
 *    `linenos`   Emits comments in the generated CSS indicating
 *                the corresponding Stylus line
 *    'sourcemap' Generates a sourcemap in sourcemaps v3 format
 *
 * Examples:
 *
 * Here we set up the custom compile function so that we may
 * set the `compress` option, or define additional functions.
 *
 * By default the compile function simply sets the `filename`
 * and renders the CSS.
 *
 *      function compile(str, path) {
 *        return stylus(str)
 *          .set('filename', path)
 *          .set('compress', true);
 *      }
 *
 * Pass the middleware to Connect, grabbing .styl files from this directory
 * and saving .css files to _./public_. Also supplying our custom `compile` function.
 *
 * Following that we have a `static()` layer setup to serve the .css
 * files generated by Stylus.
 *
 *      var app = connect();
 *
 *      app.middleware({
 *          src: __dirname
 *        , dest: __dirname + '/public'
 *        , compile: compile
 *      })
 *
 *      app.use(connect.static(__dirname + '/public'));
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function(options){
  options = options || {};

  // Accept src/dest dir
  if ('string' == typeof options) {
    options = { src: options };
  }

  // Force compilation
  var force = options.force;

  // Source dir required
  var src = options.src;
  if (!src) throw new Error('stylus.middleware() requires "src" directory');

  // Default dest dir to source
  var dest = options.dest || src;

  // Default compile callback
  options.compile = options.compile || function(str, path){
    // inline sourcemap
    if (options.sourcemap) {
      if ('boolean' == typeof options.sourcemap)
        options.sourcemap = {};
      options.sourcemap.inline = true;
    }

    return stylus(str)
      .set('filename', path)
      .set('compress', options.compress)
      .set('firebug', options.firebug)
      .set('linenos', options.linenos)
      .set('sourcemap', options.sourcemap);
  };

  // Middleware
  return function stylus(req, res, next){
    if ('GET' != req.method && 'HEAD' != req.method) return next();
    var path = _$url_164.parse(req.url).pathname;
    if (/\.css$/.test(path)) {

      if (typeof dest == 'string') {
        // check for dest-path overlap
        var overlap = compare(dest, path).length;
        if ('/' == path.charAt(0)) overlap++;
        path = path.slice(overlap);
      }

      var cssPath, stylusPath;
      cssPath = (typeof dest == 'function')
        ? dest(path)
        : join(dest, path);
      stylusPath = (typeof src == 'function')
        ? src(path)
        : join(src, path.replace('.css', '.styl'));

      // Ignore ENOENT to fall through as 404
      function error(err) {
        next('ENOENT' == err.code
          ? null
          : err);
      }

      // Force
      if (force) return compile();

      // Compile to cssPath
      function compile() {
        debug('read %s', cssPath);
        fs.readFile(stylusPath, 'utf8', function(err, str){
          if (err) return error(err);
          var style = options.compile(str, stylusPath);
          var paths = style.options._imports = [];
          imports[stylusPath] = null;
          style.render(function(err, css){
            if (err) return next(err);
            debug('render %s', stylusPath);
            imports[stylusPath] = paths;
            mkdir(dirname(cssPath), { mode: parseInt('0700', 8), recursive: true }, function(err){
              if (err) return error(err);
              fs.writeFile(cssPath, css, 'utf8', next);
            });
          });
        });
      }

      // Re-compile on server restart, disregarding
      // mtimes since we need to map imports
      if (!imports[stylusPath]) return compile();

      // Compare mtimes
      fs.stat(stylusPath, function(err, stylusStats){
        if (err) return error(err);
        fs.stat(cssPath, function(err, cssStats){
          // CSS has not been compiled, compile it!
          if (err) {
            if ('ENOENT' == err.code) {
              debug('not found %s', cssPath);
              compile();
            } else {
              next(err);
            }
          } else {
            // Source has changed, compile it
            if (stylusStats.mtime > cssStats.mtime) {
              debug('modified %s', cssPath);
              compile();
            // Already compiled, check imports
            } else {
              checkImports(stylusPath, function(changed){
                if (debug && changed.length) {
                  changed.forEach(function(path) {
                    debug('modified import %s', path);
                  });
                }
                changed.length ? compile() : next();
              });
            }
          }
        });
      });
    } else {
      next();
    }
  }
};

/**
 * Check `path`'s imports to see if they have been altered.
 *
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

function checkImports(path, fn) {
  var nodes = imports[path];
  if (!nodes) return fn();
  if (!nodes.length) return fn();

  var pending = nodes.length
    , changed = [];

  nodes.forEach(function(imported){
    fs.stat(imported.path, function(err, stat){
      // error or newer mtime
      if (err || !imported.mtime || stat.mtime > imported.mtime) {
        changed.push(imported.path);
      }
      --pending || fn(changed);
    });
  });
}

/**
 * get the overlaping path from the end of path A, and the begining of path B.
 *
 * @param {String} pathA
 * @param {String} pathB
 * @return {String}
 * @api private
 */

function compare(pathA, pathB) {
  pathA = pathA.split(sep);
  pathB = pathB.split('/');
  if (!pathA[pathA.length - 1]) pathA.pop();
  if (!pathB[0]) pathB.shift();
  var overlap = [];

  while (pathA[pathA.length - 1] == pathB[0]) {
    overlap.push(pathA.pop());
    pathB.shift();
  }
  return overlap.join('/');
}

});
var _$renderer_138 = createModuleFactory(function (module, exports) {
(function (__dirname){(function (){

/*!
 * Stylus - Renderer
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Parser = _$parser_137({})
  , EventEmitter = _$events_160.EventEmitter
  , Evaluator = _$evaluator_149({})
  , Normalizer = _$normalizer_151({})
  , events = new EventEmitter
  , utils = _$utils_146({})
  , nodes = _$nodes_115({})
  , join = _$pathBrowserify_14.join;

/**
 * Expose `Renderer`.
 */

module.exports = Renderer;

/**
 * Initialize a new `Renderer` with the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @api public
 */

function Renderer(str, options) {
  options = options || {};
  options.globals = options.globals || {};
  options.functions = options.functions || {};
  options.use = options.use || [];
  options.use = Array.isArray(options.use) ? options.use : [options.use];
  options.imports = [join(__dirname, 'functions/index.styl')].concat(options.imports || []);
  options.paths = options.paths || [];
  options.filename = options.filename || 'stylus';
  options.Evaluator = options.Evaluator || Evaluator;
  this.options = options;
  this.str = str;
  this.events = events;
};

/**
 * Inherit from `EventEmitter.prototype`.
 */

Renderer.prototype.__proto__ = EventEmitter.prototype;

/**
 * Expose events explicitly.
 */

module.exports.events = events;

/**
 * Parse and evaluate AST, then callback `fn(err, css, js)`.
 *
 * @param {Function} fn
 * @api public
 */

Renderer.prototype.render = function(fn){
  var parser = this.parser = new Parser(this.str, this.options);

  // use plugin(s)
  for (var i = 0, len = this.options.use.length; i < len; i++) {
    this.use(this.options.use[i]);
  }

  try {
    nodes.filename = this.options.filename;
    // parse
    var ast = parser.parse();

    // evaluate
    this.evaluator = new this.options.Evaluator(ast, this.options);
    this.nodes = nodes;
    this.evaluator.renderer = this;
    ast = this.evaluator.evaluate();

    // normalize
    var normalizer = new Normalizer(ast, this.options);
    ast = normalizer.normalize();

    // compile
    var compiler = this.options.sourcemap
      ? new (_$sourcemapper_152({}))(ast, this.options)
      : new (_$compiler_147({}))(ast, this.options)
      , css = compiler.compile();

    // expose sourcemap
    if (this.options.sourcemap) this.sourcemap = compiler.map.toJSON();
  } catch (err) {
    var options = {};
    options.input = err.input || this.str;
    options.filename = err.filename || this.options.filename;
    options.lineno = err.lineno || parser.lexer.lineno;
    options.column = err.column || parser.lexer.column;
    if (!fn) throw utils.formatException(err, options);
    return fn(utils.formatException(err, options));
  }

  // fire `end` event
  var listeners = this.listeners('end');
  if (fn) listeners.push(fn);
  for (var i = 0, len = listeners.length; i < len; i++) {
    var ret = listeners[i](null, css);
    if (ret) css = ret;
  }
  if (!fn) return css;
};

/**
 * Get dependencies of the compiled file.
 *
 * @param {String} [filename]
 * @return {Array}
 * @api public
 */

Renderer.prototype.deps = function(filename){
  var opts = utils.merge({ cache: false }, this.options);
  if (filename) opts.filename = filename;

  var DepsResolver = _$depsResolver_148({})
    , parser = new Parser(this.str, opts);

  try {
    nodes.filename = opts.filename;
    // parse
    var ast = parser.parse()
      , resolver = new DepsResolver(ast, opts);

    // resolve dependencies
    return resolver.resolve();
  } catch (err) {
    var options = {};
    options.input = err.input || this.str;
    options.filename = err.filename || opts.filename;
    options.lineno = err.lineno || parser.lexer.lineno;
    options.column = err.column || parser.lexer.column;
    throw utils.formatException(err, options);
  }
};

/**
 * Set option `key` to `val`.
 *
 * @param {String} key
 * @param {Mixed} val
 * @return {Renderer} for chaining
 * @api public
 */

Renderer.prototype.set = function(key, val){
  this.options[key] = val;
  return this;
};

/**
 * Get option `key`.
 *
 * @param {String} key
 * @return {Mixed} val
 * @api public
 */

Renderer.prototype.get = function(key){
  return this.options[key];
};

/**
 * Include the given `path` to the lookup paths array.
 *
 * @param {String} path
 * @return {Renderer} for chaining
 * @api public
 */

Renderer.prototype.include = function(path){
  this.options.paths.push(path);
  return this;
};

/**
 * Use the given `fn`.
 *
 * This allows for plugins to alter the renderer in
 * any way they wish, exposing paths etc.
 *
 * @param {Function}
 * @return {Renderer} for chaining
 * @api public
 */

Renderer.prototype.use = function(fn){
  fn.call(this, this);
  return this;
};

/**
 * Define function or global var with the given `name`. Optionally
 * the function may accept full expressions, by setting `raw`
 * to `true`.
 *
 * @param {String} name
 * @param {Function|Node} fn
 * @return {Renderer} for chaining
 * @api public
 */

Renderer.prototype.define = function(name, fn, raw){
  fn = utils.coerce(fn, raw);

  if (fn.nodeName) {
    this.options.globals[name] = fn;
    return this;
  }

  // function
  this.options.functions[name] = fn;
  if (undefined != raw) fn.raw = raw;
  return this;
};

/**
 * Import the given `file`.
 *
 * @param {String} file
 * @return {Renderer} for chaining
 * @api public
 */

Renderer.prototype.import = function(file){
  this.options.imports.push(file);
  return this;
};



}).call(this)}).call(this,"/node_modules/stylus/lib")
});
var _$depsResolver_148 = createModuleFactory(function (module, exports) {

/**
 * Module dependencies.
 */

var Parser = _$parser_137({})
  , nodes = _$nodes_115({})
  , utils = _$utils_146({})
  , dirname = _$pathBrowserify_14.dirname
  , fs = require("fs");

/**
 * Initialize a new `DepsResolver` with the given `root` Node
 * and the `options`.
 *
 * @param {Node} root
 * @param {Object} options
 * @api private
 */

var DepsResolver = module.exports = function DepsResolver(root, options) {
  this.root = root;
  this.filename = options.filename;
  this.paths = options.paths || [];
  this.paths.push(dirname(options.filename || '.'));
  this.options = options;
  this.functions = {};
  this.deps = [];
};

/**
 * Inherit from `Visitor.prototype`.
 */

DepsResolver.prototype.__proto__ = _$visitor_150.prototype;

var visit = DepsResolver.prototype.visit;

DepsResolver.prototype.visit = function(node) {
  switch (node.nodeName) {
    case 'root':
    case 'block':
    case 'expression':
      this.visitRoot(node);
      break;
    case 'group':
    case 'media':
    case 'atblock':
    case 'atrule':
    case 'keyframes':
    case 'each':
    case 'supports':
      this.visit(node.block);
      break;
    default:
      visit.call(this, node);
  }
};

/**
 * Visit Root.
 */

DepsResolver.prototype.visitRoot = function(block) {
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    this.visit(block.nodes[i]);
  }
};

/**
 * Visit Ident.
 */

DepsResolver.prototype.visitIdent = function(ident) {
  this.visit(ident.val);
};

/**
 * Visit If.
 */

DepsResolver.prototype.visitIf = function(node) {
  this.visit(node.block);
  this.visit(node.cond);
  for (var i = 0, len = node.elses.length; i < len; ++i) {
    this.visit(node.elses[i]);
  }
};

/**
 * Visit Function.
 */

DepsResolver.prototype.visitFunction = function(fn) {
  this.functions[fn.name] = fn.block;
};

/**
 * Visit Call.
 */

DepsResolver.prototype.visitCall = function(call) {
  if (call.name in this.functions) this.visit(this.functions[call.name]);
  if (call.block) this.visit(call.block);
};

/**
 * Visit Import.
 */

DepsResolver.prototype.visitImport = function(node) {
  // If it's a url() call, skip
  if (node.path.first.name === 'url') return;

  var path = !node.path.first.val.isNull && node.path.first.val || node.path.first.name
    , literal, found, oldPath;

  if (!path) return;

  literal = /\.css(?:"|$)/.test(path);

  // support optional .styl
  if (!literal && !/\.styl$/i.test(path)) {
    oldPath = path;
    path += '.styl';
  }

  // Lookup
  found = utils.find(path, this.paths, this.filename);

  // support optional index
  if (!found && oldPath) found = utils.lookupIndex(oldPath, this.paths, this.filename);

  if (!found) return;

  this.deps = this.deps.concat(found);

  if (literal) return;

  // nested imports
  for (var i = 0, len = found.length; i < len; ++i) {
    var file = found[i]
      , dir = dirname(file)
      , str = fs.readFileSync(file, 'utf-8')
      , block = new nodes.Block
      , parser = new Parser(str, utils.merge({ root: block }, this.options));

    if (!~this.paths.indexOf(dir)) this.paths.push(dir);

    try {
      block = parser.parse();
    } catch (err) {
      err.filename = file;
      err.lineno = parser.lexer.lineno;
      err.column = parser.lexer.column;
      err.input = str;
      throw err;
    }

    this.visit(block);
  }
};

/**
 * Get dependencies.
 */

DepsResolver.prototype.resolve = function() {
  this.visit(this.root);
  return utils.uniq(this.deps);
};

});
var _$sourcemapper_152 = createModuleFactory(function (module, exports) {
/*!
 * Stylus - SourceMapper
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Compiler = _$compiler_147({})
  , Buffer = _$safer_16.Buffer
  , SourceMapGenerator = _$sourceMap_163.SourceMapGenerator
  , basename = _$pathBrowserify_14.basename
  , extname = _$pathBrowserify_14.extname
  , dirname = _$pathBrowserify_14.dirname
  , join = _$pathBrowserify_14.join
  , relative = _$pathBrowserify_14.relative
  , sep = _$pathBrowserify_14.sep
  , fs = require("fs");

/**
 * Initialize a new `SourceMapper` generator with the given `root` Node
 * and the following `options`.
 *
 * @param {Node} root
 * @api public
 */

var SourceMapper = module.exports = function SourceMapper(root, options){
  options = options || {};
  this.column = 1;
  this.lineno = 1;
  this.contents = {};
  this.filename = options.filename;
  this.dest = options.dest;

  var sourcemap = options.sourcemap;
  this.basePath = sourcemap.basePath || '.';
  this.inline = sourcemap.inline;
  this.comment = sourcemap.comment;
  if (this.dest && extname(this.dest) === '.css') {
    this.basename = basename(this.dest);
    this.dest = dirname(this.dest);
  } else {
    this.basename = basename(this.filename, extname(this.filename)) + '.css';
  }
  this.utf8 = false;

  this.map = new SourceMapGenerator({
    file: this.basename,
    sourceRoot: sourcemap.sourceRoot || null
  });
  Compiler.call(this, root, options);
};

/**
 * Inherit from `Compiler.prototype`.
 */

SourceMapper.prototype.__proto__ = Compiler.prototype;

/**
 * Generate and write source map.
 *
 * @return {String}
 * @api private
 */

var compile = Compiler.prototype.compile;
SourceMapper.prototype.compile = function(){
  var css = compile.call(this)
    , out = this.basename + '.map'
    , url = this.normalizePath(this.dest
      ? join(this.dest, out)
      : join(dirname(this.filename), out))
    , map;

  if (this.inline) {
    map = this.map.toString();
    url = 'data:application/json;'
      + (this.utf8 ?  'charset=utf-8;' : '') + 'base64,'
      + Buffer.from(map).toString('base64');
  }
  if (this.inline || false !== this.comment)
    css += '/*# sourceMappingURL=' + url + ' */';
  return css;
};

/**
 * Add mapping information.
 *
 * @param {String} str
 * @param {Node} node
 * @return {String}
 * @api private
 */

SourceMapper.prototype.out = function(str, node){
  if (node && node.lineno) {
    var filename = this.normalizePath(node.filename);

    this.map.addMapping({
      original: {
        line: node.lineno,
        column: node.column - 1
      },
      generated: {
        line: this.lineno,
        column: this.column - 1
      },
      source: filename
    });

    if (this.inline && !this.contents[filename]) {
      this.map.setSourceContent(filename, fs.readFileSync(node.filename, 'utf-8'));
      this.contents[filename] = true;
    }
  }

  this.move(str);
  return str;
};

/**
 * Move current line and column position.
 *
 * @param {String} str
 * @api private
 */

SourceMapper.prototype.move = function(str){
  var lines = str.match(/\n/g)
    , idx = str.lastIndexOf('\n');

  if (lines) this.lineno += lines.length;
  this.column = ~idx
    ? str.length - idx
    : this.column + str.length;
};

/**
 * Normalize the given `path`.
 *
 * @param {String} path
 * @return {String}
 * @api private
 */

SourceMapper.prototype.normalizePath = function(path){
  path = relative(this.dest || this.basePath, path);
  if ('\\' == sep) {
    path = path.replace(/^[a-z]:\\/i, '/')
      .replace(/\\/g, '/');
  }
  return path;
};

/**
 * Visit Literal.
 */

var literal = Compiler.prototype.visitLiteral;
SourceMapper.prototype.visitLiteral = function(lit){
  var val = literal.call(this, lit)
    , filename = this.normalizePath(lit.filename)
    , indentsRe = /^\s+/
    , lines = val.split('\n');

  // add mappings for multiline literals
  if (lines.length > 1) {
    lines.forEach(function(line, i) {
      var indents = line.match(indentsRe)
        , column = indents && indents[0]
            ? indents[0].length
            : 0;

      if (lit.css) column += 2;

      this.map.addMapping({
        original: {
          line: lit.lineno + i,
          column: column
        },
        generated: {
          line: this.lineno + i,
          column: 0
        },
        source: filename
      });
    }, this);
  }
  return val;
};

/**
 * Visit Charset.
 */

var charset = Compiler.prototype.visitCharset;
SourceMapper.prototype.visitCharset = function(node){
  this.utf8 = ('utf-8' == node.val.string.toLowerCase());
  return charset.call(this, node);
};

});
var _$parser_137 = createModuleFactory(function (module, exports) {
/*!
 * Stylus - Parser
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var nodes = _$nodes_115({});

// debuggers

var debug = {
    lexer: _$debug_159('stylus:lexer')
  , selector: _$debug_159('stylus:parser:selector')
};

/**
 * Selector composite tokens.
 */

var selectorTokens = [
    'ident'
  , 'string'
  , 'selector'
  , 'function'
  , 'comment'
  , 'boolean'
  , 'space'
  , 'color'
  , 'unit'
  , 'for'
  , 'in'
  , '['
  , ']'
  , '('
  , ')'
  , '+'
  , '-'
  , '*'
  , '*='
  , '<'
  , '>'
  , '='
  , ':'
  , '&'
  , '&&'
  , '~'
  , '{'
  , '}'
  , '.'
  , '..'
  , '/'
];

/**
 * CSS pseudo-classes and pseudo-elements.
 * See http://dev.w3.org/csswg/selectors4/
 */

var pseudoSelectors = [
  // Logical Combinations
    'matches'
  , 'not'

  // Linguistic Pseudo-classes
  , 'dir'
  , 'lang'

  // Location Pseudo-classes
  , 'any-link'
  , 'link'
  , 'visited'
  , 'local-link'
  , 'target'
  , 'scope'

  // User Action Pseudo-classes
  , 'hover'
  , 'active'
  , 'focus'
  , 'drop'

  // Time-dimensional Pseudo-classes
  , 'current'
  , 'past'
  , 'future'

  // The Input Pseudo-classes
  , 'enabled'
  , 'disabled'
  , 'read-only'
  , 'read-write'
  , 'placeholder-shown'
  , 'checked'
  , 'indeterminate'
  , 'valid'
  , 'invalid'
  , 'in-range'
  , 'out-of-range'
  , 'required'
  , 'optional'
  , 'user-error'

  // Tree-Structural pseudo-classes
  , 'root'
  , 'empty'
  , 'blank'
  , 'nth-child'
  , 'nth-last-child'
  , 'first-child'
  , 'last-child'
  , 'only-child'
  , 'nth-of-type'
  , 'nth-last-of-type'
  , 'first-of-type'
  , 'last-of-type'
  , 'only-of-type'
  , 'nth-match'
  , 'nth-last-match'

  // Grid-Structural Selectors
  , 'nth-column'
  , 'nth-last-column'

  // Pseudo-elements
  , 'first-line'
  , 'first-letter'
  , 'before'
  , 'after'

  // Non-standard
  , 'selection'
];

/**
 * Initialize a new `Parser` with the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @api private
 */

var Parser = module.exports = function Parser(str, options) {
  var self = this;
  options = options || {};
  Parser.cache = Parser.cache || Parser.getCache(options);
  this.hash = Parser.cache.key(str, options);
  this.lexer = {};
  if (!Parser.cache.has(this.hash)) {
    this.lexer = new _$lexer_94(str, options);
  }
  this.prefix = options.prefix || '';
  this.root = options.root || new nodes.Root;
  this.state = ['root'];
  this.stash = [];
  this.parens = 0;
  this.css = 0;
  this.state.pop = function(){
    self.prevState = [].pop.call(this);
  };
};

/**
 * Get cache instance.
 *
 * @param {Object} options
 * @return {Object}
 * @api private
 */

Parser.getCache = function(options) {
  return false === options.cache
    ? _$cache_18(false)
    : _$cache_18(options.cache || 'memory', options);
};

/**
 * Parser prototype.
 */

Parser.prototype = {

  /**
   * Constructor.
   */

  constructor: Parser,

  /**
   * Return current state.
   *
   * @return {String}
   * @api private
   */

  currentState: function() {
    return this.state[this.state.length - 1];
  },

  /**
   * Return previous state.
   *
   * @return {String}
   * @api private
   */

  previousState: function() {
    return this.state[this.state.length - 2];
  },

  /**
   * Parse the input, then return the root node.
   *
   * @return {Node}
   * @api private
   */

  parse: function(){
    var block = this.parent = this.root;
    if (Parser.cache.has(this.hash)) {
      block = Parser.cache.get(this.hash);
      // normalize cached imports
      if ('block' == block.nodeName) block.constructor = nodes.Root;
    } else {
      while ('eos' != this.peek().type) {
        this.skipWhitespace();
        if ('eos' == this.peek().type) break;
        var stmt = this.statement();
        this.accept(';');
        if (!stmt) this.error('unexpected token {peek}, not allowed at the root level');
        block.push(stmt);
      }
      Parser.cache.set(this.hash, block);
    }
    return block;
  },

  /**
   * Throw an `Error` with the given `msg`.
   *
   * @param {String} msg
   * @api private
   */

  error: function(msg){
    var type = this.peek().type
      , val = undefined == this.peek().val
        ? ''
        : ' ' + this.peek().toString();
    if (val.trim() == type.trim()) val = '';
    throw new _$errors_23.ParseError(msg.replace('{peek}', '"' + type + val + '"'));
  },

  /**
   * Accept the given token `type`, and return it,
   * otherwise return `undefined`.
   *
   * @param {String} type
   * @return {Token}
   * @api private
   */

  accept: function(type){
    if (type == this.peek().type) {
      return this.next();
    }
  },

  /**
   * Expect token `type` and return it, throw otherwise.
   *
   * @param {String} type
   * @return {Token}
   * @api private
   */

  expect: function(type){
    if (type != this.peek().type) {
      this.error('expected "' + type + '", got {peek}');
    }
    return this.next();
  },

  /**
   * Get the next token.
   *
   * @return {Token}
   * @api private
   */

  next: function() {
    var tok = this.stash.length
      ? this.stash.pop()
      : this.lexer.next()
      , line = tok.lineno
      , column = tok.column || 1;

    if (tok.val && tok.val.nodeName) {
      tok.val.lineno = line;
      tok.val.column = column;
    }
    nodes.lineno = line;
    nodes.column = column;
    debug.lexer('%s %s', tok.type, tok.val || '');
    return tok;
  },

  /**
   * Peek with lookahead(1).
   *
   * @return {Token}
   * @api private
   */

  peek: function() {
    return this.lexer.peek();
  },

  /**
   * Lookahead `n` tokens.
   *
   * @param {Number} n
   * @return {Token}
   * @api private
   */

  lookahead: function(n){
    return this.lexer.lookahead(n);
  },

  /**
   * Check if the token at `n` is a valid selector token.
   *
   * @param {Number} n
   * @return {Boolean}
   * @api private
   */

  isSelectorToken: function(n) {
    var la = this.lookahead(n).type;
    switch (la) {
      case 'for':
        return this.bracketed;
      case '[':
        this.bracketed = true;
        return true;
      case ']':
        this.bracketed = false;
        return true;
      default:
        return ~selectorTokens.indexOf(la);
    }
  },

  /**
   * Check if the token at `n` is a pseudo selector.
   *
   * @param {Number} n
   * @return {Boolean}
   * @api private
   */

  isPseudoSelector: function(n){
    var val = this.lookahead(n).val;
    return val && ~pseudoSelectors.indexOf(val.name);
  },

  /**
   * Check if the current line contains `type`.
   *
   * @param {String} type
   * @return {Boolean}
   * @api private
   */

  lineContains: function(type){
    var i = 1
      , la;

    while (la = this.lookahead(i++)) {
      if (~['indent', 'outdent', 'newline', 'eos'].indexOf(la.type)) return;
      if (type == la.type) return true;
    }
  },

  /**
   * Valid selector tokens.
   */

  selectorToken: function() {
    if (this.isSelectorToken(1)) {
      if ('{' == this.peek().type) {
        // unclosed, must be a block
        if (!this.lineContains('}')) return;
        // check if ':' is within the braces.
        // though not required by Stylus, chances
        // are if someone is using {} they will
        // use CSS-style props, helping us with
        // the ambiguity in this case
        var i = 0
          , la;
        while (la = this.lookahead(++i)) {
          if ('}' == la.type) {
            // Check empty block.
            if (i == 2 || (i == 3 && this.lookahead(i - 1).type == 'space'))
              return;
            break;
          }
          if (':' == la.type) return;
        }
      }
      return this.next();
    }
  },

  /**
   * Skip the given `tokens`.
   *
   * @param {Array} tokens
   * @api private
   */

  skip: function(tokens) {
    while (~tokens.indexOf(this.peek().type))
      this.next();
  },

  /**
   * Consume whitespace.
   */

  skipWhitespace: function() {
    this.skip(['space', 'indent', 'outdent', 'newline']);
  },

  /**
   * Consume newlines.
   */

  skipNewlines: function() {
    while ('newline' == this.peek().type)
      this.next();
  },

  /**
   * Consume spaces.
   */

  skipSpaces: function() {
    while ('space' == this.peek().type)
      this.next();
  },

  /**
   * Consume spaces and comments.
   */

  skipSpacesAndComments: function() {
    while ('space' == this.peek().type
      || 'comment' == this.peek().type)
      this.next();
  },

  /**
   * Check if the following sequence of tokens
   * forms a function definition, ie trailing
   * `{` or indentation.
   */

  looksLikeFunctionDefinition: function(i) {
    return 'indent' == this.lookahead(i).type
      || '{' == this.lookahead(i).type;
  },

  /**
   * Check if the following sequence of tokens
   * forms a selector.
   *
   * @param {Boolean} [fromProperty]
   * @return {Boolean}
   * @api private
   */

  looksLikeSelector: function(fromProperty) {
    var i = 1
      , node
      , brace;

    // Real property
    if (fromProperty && ':' == this.lookahead(i + 1).type
      && (this.lookahead(i + 1).space || 'indent' == this.lookahead(i + 2).type))
      return false;

    // Assume selector when an ident is
    // followed by a selector
    while ('ident' == this.lookahead(i).type
      && ('newline' == this.lookahead(i + 1).type
         || ',' == this.lookahead(i + 1).type)) i += 2;

    while (this.isSelectorToken(i)
      || ',' == this.lookahead(i).type) {

      if ('selector' == this.lookahead(i).type)
        return true;

      if ('&' == this.lookahead(i + 1).type)
        return true;

      // Hash values inside properties
      if (
        i > 1 &&
        'ident' === this.lookahead(i - 1).type &&
        '.' === this.lookahead(i).type &&
        'ident' === this.lookahead(i + 1).type
      ) {
        while ((node = this.lookahead(i + 2))) {
          if ([
            'indent',
            'outdent',
            '{',
            ';',
            'eos',
            'selector',
            'media',
            'if',
            'atrule',
            ')',
            '}',
            'unit',
            '[',
            'for',
            'function'
          ].indexOf(node.type) !== -1) {
            if (node.type === '[') {
              while ((node = this.lookahead(i + 3)) && node.type !== ']') {
                if (~['.', 'unit'].indexOf(node.type)) {
                  return false;
                }
                i += 1
              }
            } else {
              if (this.isPseudoSelector(i + 2)) {
                return true;
              }

              if (node.type === ')' && this.lookahead(i + 3) && this.lookahead(i + 3).type === '}') {
                break;
              }

              return [
                'outdent',
                ';',
                'eos',
                'media',
                'if',
                'atrule',
                ')',
                '}',
                'unit',
                'for',
                'function'
              ].indexOf(node.type) === -1;
            }
          }

          i += 1
        }

        return true;
      }

      if ('.' == this.lookahead(i).type && 'ident' == this.lookahead(i + 1).type) {
        return true;
      }

      if ('*' == this.lookahead(i).type && 'newline' == this.lookahead(i + 1).type)
        return true;

      // Pseudo-elements
      if (':' == this.lookahead(i).type
        && ':' == this.lookahead(i + 1).type)
        return true;

      // #a after an ident and newline
      if ('color' == this.lookahead(i).type
        && 'newline' == this.lookahead(i - 1).type)
        return true;

      if (this.looksLikeAttributeSelector(i))
        return true;

      if (('=' == this.lookahead(i).type || 'function' == this.lookahead(i).type)
        && '{' == this.lookahead(i + 1).type)
        return false;

      // Hash values inside properties
      if (':' == this.lookahead(i).type
        && !this.isPseudoSelector(i + 1)
        && this.lineContains('.'))
        return false;

      // the ':' token within braces signifies
      // a selector. ex: "foo{bar:'baz'}"
      if ('{' == this.lookahead(i).type) brace = true;
      else if ('}' == this.lookahead(i).type) brace = false;
      if (brace && ':' == this.lookahead(i).type) return true;

      // '{' preceded by a space is considered a selector.
      // for example "foo{bar}{baz}" may be a property,
      // however "foo{bar} {baz}" is a selector
      if ('space' == this.lookahead(i).type
        && '{' == this.lookahead(i + 1).type)
        return true;

      // Assume pseudo selectors are NOT properties
      // as 'td:th-child(1)' may look like a property
      // and function call to the parser otherwise
      if (':' == this.lookahead(i++).type
        && !this.lookahead(i-1).space
        && this.isPseudoSelector(i))
        return true;

      // Trailing space
      if ('space' == this.lookahead(i).type
        && 'newline' == this.lookahead(i + 1).type
        && '{' == this.lookahead(i + 2).type)
        return true;

      if (',' == this.lookahead(i).type
        && 'newline' == this.lookahead(i + 1).type)
        return true;
    }

    // Trailing comma
    if (',' == this.lookahead(i).type
      && 'newline' == this.lookahead(i + 1).type)
      return true;

    // Trailing brace
    if ('{' == this.lookahead(i).type
      && 'newline' == this.lookahead(i + 1).type)
      return true;

    // css-style mode, false on ; }
    if (this.css) {
      if (';' == this.lookahead(i).type ||
          '}' == this.lookahead(i - 1).type)
        return false;
    }

    // Trailing separators
    while (!~[
        'indent'
      , 'outdent'
      , 'newline'
      , 'for'
      , 'if'
      , ';'
      , '}'
      , 'eos'].indexOf(this.lookahead(i).type))
      ++i;

    if ('indent' == this.lookahead(i).type)
      return true;
  },

  /**
   * Check if the following sequence of tokens
   * forms an attribute selector.
   */

  looksLikeAttributeSelector: function(n) {
    var type = this.lookahead(n).type;
    if ('=' == type && this.bracketed) return true;
    return ('ident' == type || 'string' == type)
      && ']' == this.lookahead(n + 1).type
      && ('newline' == this.lookahead(n + 2).type || this.isSelectorToken(n + 2))
      && !this.lineContains(':')
      && !this.lineContains('=');
  },

  /**
   * Check if the following sequence of tokens
   * forms a keyframe block.
   */

  looksLikeKeyframe: function() {
    var i = 2
      , type;
    switch (this.lookahead(i).type) {
      case '{':
      case 'indent':
      case ',':
        return true;
      case 'newline':
        while ('unit' == this.lookahead(++i).type
            || 'newline' == this.lookahead(i).type) ;
        type = this.lookahead(i).type;
        return 'indent' == type || '{' == type;
    }
  },

  /**
   * Check if the current state supports selectors.
   */

  stateAllowsSelector: function() {
    switch (this.currentState()) {
      case 'root':
      case 'atblock':
      case 'selector':
      case 'conditional':
      case 'function':
      case 'atrule':
      case 'for':
        return true;
    }
  },

  /**
   * Try to assign @block to the node.
   *
   * @param {Expression} expr
   * @private
   */

  assignAtblock: function(expr) {
    try {
      expr.push(this.atblock(expr));
    } catch(err) {
      this.error('invalid right-hand side operand in assignment, got {peek}');
    }
  },

  /**
   *   statement
   * | statement 'if' expression
   * | statement 'unless' expression
   */

  statement: function() {
    var stmt = this.stmt()
      , state = this.prevState
      , block
      , op;

    // special-case statements since it
    // is not an expression. We could
    // implement postfix conditionals at
    // the expression level, however they
    // would then fail to enclose properties
    if (this.allowPostfix) {
      this.allowPostfix = false;
      state = 'expression';
    }

    switch (state) {
      case 'assignment':
      case 'expression':
      case 'function arguments':
        while (op =
             this.accept('if')
          || this.accept('unless')
          || this.accept('for')) {
          switch (op.type) {
            case 'if':
            case 'unless':
              stmt = new nodes.If(this.expression(), stmt);
              stmt.postfix = true;
              stmt.negate = 'unless' == op.type;
              this.accept(';');
              break;
            case 'for':
              var key
                , val = this.id().name;
              if (this.accept(',')) key = this.id().name;
              this.expect('in');
              var each = new nodes.Each(val, key, this.expression());
              block = new nodes.Block(this.parent, each);
              block.push(stmt);
              each.block = block;
              stmt = each;
          }
        }
    }

    return stmt;
  },

  /**
   *    ident
   *  | selector
   *  | literal
   *  | charset
   *  | namespace
   *  | import
   *  | require
   *  | media
   *  | atrule
   *  | scope
   *  | keyframes
   *  | mozdocument
   *  | for
   *  | if
   *  | unless
   *  | comment
   *  | expression
   *  | 'return' expression
   */

  stmt: function() {
    var tok = this.peek(), selector;
    switch (tok.type) {
      case 'keyframes':
        return this.keyframes();
      case '-moz-document':
        return this.mozdocument();
      case 'comment':
      case 'selector':
      case 'literal':
      case 'charset':
      case 'namespace':
      case 'import':
      case 'require':
      case 'extend':
      case 'media':
      case 'atrule':
      case 'ident':
      case 'scope':
      case 'supports':
      case 'unless':
      case 'function':
      case 'for':
      case 'if':
        return this[tok.type]();
      case 'return':
        return this.return();
      case '{':
        return this.property();
      default:
        // Contextual selectors
        if (this.stateAllowsSelector()) {
          switch (tok.type) {
            case 'color':
            case '~':
            case '>':
            case '<':
            case ':':
            case '&':
            case '&&':
            case '[':
            case '.':
            case '/':
              selector = this.selector();
              selector.column = tok.column;
              selector.lineno = tok.lineno;
              return selector;
            // relative reference
            case '..':
              if ('/' == this.lookahead(2).type)
                return this.selector();
            case '+':
              return 'function' == this.lookahead(2).type
                ? this.functionCall()
                : this.selector();
            case '*':
              return this.property();
            // keyframe blocks (10%, 20% { ... })
            case 'unit':
              if (this.looksLikeKeyframe()) {
                selector = this.selector();
                selector.column = tok.column;
                selector.lineno = tok.lineno;
                return selector;
              }
            case '-':
              if ('{' == this.lookahead(2).type)
                return this.property();
          }
        }

        // Expression fallback
        var expr = this.expression();
        if (expr.isEmpty) this.error('unexpected {peek}');
        return expr;
    }
  },

  /**
   * indent (!outdent)+ outdent
   */

  block: function(node, scope) {
    var delim
      , stmt
      , next
      , block = this.parent = new nodes.Block(this.parent, node);

    if (false === scope) block.scope = false;

    this.accept('newline');

    // css-style
    if (this.accept('{')) {
      this.css++;
      delim = '}';
      this.skipWhitespace();
    } else {
      delim = 'outdent';
      this.expect('indent');
    }

    while (delim != this.peek().type) {
      // css-style
      if (this.css) {
        if (this.accept('newline') || this.accept('indent')) continue;
        stmt = this.statement();
        this.accept(';');
        this.skipWhitespace();
      } else {
        if (this.accept('newline')) continue;
        // skip useless indents and comments
        next = this.lookahead(2).type;
        if ('indent' == this.peek().type
          && ~['outdent', 'newline', 'comment'].indexOf(next)) {
          this.skip(['indent', 'outdent']);
          continue;
        }
        if ('eos' == this.peek().type) return block;
        stmt = this.statement();
        this.accept(';');
      }
      if (!stmt) this.error('unexpected token {peek} in block');
      block.push(stmt);
    }

    // css-style
    if (this.css) {
      this.skipWhitespace();
      this.expect('}');
      this.skipSpaces();
      this.css--;
    } else {
      this.expect('outdent');
    }

    this.parent = block.parent;
    return block;
  },

  /**
   * comment space*
   */

  comment: function(){
    var node = this.next().val;
    this.skipSpaces();
    return node;
  },

  /**
   * for val (',' key) in expr
   */

  for: function() {
    this.expect('for');
    var key
      , val = this.id().name;
    if (this.accept(',')) key = this.id().name;
    this.expect('in');
    this.state.push('for');
    this.cond = true;
    var each = new nodes.Each(val, key, this.expression());
    this.cond = false;
    each.block = this.block(each, false);
    this.state.pop();
    return each;
  },

  /**
   * return expression
   */

  return: function() {
    this.expect('return');
    var expr = this.expression();
    return expr.isEmpty
      ? new nodes.Return
      : new nodes.Return(expr);
  },

  /**
   * unless expression block
   */

  unless: function() {
    this.expect('unless');
    this.state.push('conditional');
    this.cond = true;
    var node = new nodes.If(this.expression(), true);
    this.cond = false;
    node.block = this.block(node, false);
    this.state.pop();
    return node;
  },

  /**
   * if expression block (else block)?
   */

  if: function() {
    var token = this.expect('if');

    this.state.push('conditional');
    this.cond = true;
    var node = new nodes.If(this.expression())
      , cond
      , block
      , item;

    node.column = token.column;

    this.cond = false;
    node.block = this.block(node, false);
    this.skip(['newline', 'comment']);
    while (this.accept('else')) {
      token = this.accept('if');
      if (token) {
        this.cond = true;
        cond = this.expression();
        this.cond = false;
        block = this.block(node, false);
        item = new nodes.If(cond, block);

        item.column = token.column;

        node.elses.push(item);
      } else {
        node.elses.push(this.block(node, false));
        break;
      }
      this.skip(['newline', 'comment']);
    }
    this.state.pop();
    return node;
  },

  /**
   * @block
   *
   * @param {Expression} [node]
   */

  atblock: function(node){
    if (!node) this.expect('atblock');
    node = new nodes.Atblock;
    this.state.push('atblock');
    node.block = this.block(node, false);
    this.state.pop();
    return node;
  },

  /**
   * atrule selector? block?
   */

  atrule: function(){
    var type = this.expect('atrule').val
      , node = new nodes.Atrule(type)
      , tok;
    this.skipSpacesAndComments();
    node.segments = this.selectorParts();
    this.skipSpacesAndComments();
    tok = this.peek().type;
    if ('indent' == tok || '{' == tok || ('newline' == tok
      && '{' == this.lookahead(2).type)) {
      this.state.push('atrule');
      node.block = this.block(node);
      this.state.pop();
    }
    return node;
  },

  /**
   * scope
   */

  scope: function(){
    this.expect('scope');
    var selector = this.selectorParts()
      .map(function(selector) { return selector.val; })
      .join('');
    this.selectorScope = selector.trim();
    return nodes.null;
  },

  /**
   * supports
   */

  supports: function(){
    this.expect('supports');
    var node = new nodes.Supports(this.supportsCondition());
    this.state.push('atrule');
    node.block = this.block(node);
    this.state.pop();
    return node;
  },

  /**
   *   supports negation
   * | supports op
   * | expression
   */

  supportsCondition: function(){
    var node = this.supportsNegation()
      || this.supportsOp();
    if (!node) {
      this.cond = true;
      node = this.expression();
      this.cond = false;
    }
    return node;
  },

  /**
   * 'not' supports feature
   */

  supportsNegation: function(){
    if (this.accept('not')) {
      var node = new nodes.Expression;
      node.push(new nodes.Literal('not'));
      node.push(this.supportsFeature());
      return node;
    }
  },

  /**
   * supports feature (('and' | 'or') supports feature)+
   */

  supportsOp: function(){
    var feature = this.supportsFeature()
      , op
      , expr;
    if (feature) {
      expr = new nodes.Expression;
      expr.push(feature);
      while (op = this.accept('&&') || this.accept('||')) {
        expr.push(new nodes.Literal('&&' == op.val ? 'and' : 'or'));
        expr.push(this.supportsFeature());
      }
      return expr;
    }
  },

  /**
   *   ('(' supports condition ')')
   * | feature
   */

  supportsFeature: function(){
    this.skipSpacesAndComments();
    if ('(' == this.peek().type) {
      var la = this.lookahead(2).type;

      if ('ident' == la || '{' == la) {
        return this.feature();
      } else {
        this.expect('(');
        var node = new nodes.Expression;
        node.push(new nodes.Literal('('));
        node.push(this.supportsCondition());
        this.expect(')')
        node.push(new nodes.Literal(')'));
        this.skipSpacesAndComments();
        return node;
      }
    }
  },

  /**
   * extend
   */

  extend: function(){
    var tok = this.expect('extend')
      , selectors = []
      , sel
      , node
      , arr;

    do {
      arr = this.selectorParts();

      if (!arr.length) continue;

      sel = new nodes.Selector(arr);
      selectors.push(sel);

      if ('!' !== this.peek().type) continue;

      tok = this.lookahead(2);
      if ('ident' !== tok.type || 'optional' !== tok.val.name) continue;

      this.skip(['!', 'ident']);
      sel.optional = true;
    } while(this.accept(','));

    node = new nodes.Extend(selectors);
    node.lineno = tok.lineno;
    node.column = tok.column;
    return node;
  },

  /**
   * media queries
   */

  media: function() {
    this.expect('media');
    this.state.push('atrule');
    var media = new nodes.Media(this.queries());
    media.block = this.block(media);
    this.state.pop();
    return media;
  },

  /**
   * query (',' query)*
   */

  queries: function() {
    var queries = new nodes.QueryList
      , skip = ['comment', 'newline', 'space'];

    do {
      this.skip(skip);
      queries.push(this.query());
      this.skip(skip);
    } while (this.accept(','));
    return queries;
  },

  /**
   *   expression
   * | (ident | 'not')? ident ('and' feature)*
   * | feature ('and' feature)*
   */

  query: function() {
    var query = new nodes.Query
      , expr
      , pred
      , id;

    // hash values support
    if ('ident' == this.peek().type
      && ('.' == this.lookahead(2).type
      || '[' == this.lookahead(2).type)) {
      this.cond = true;
      expr = this.expression();
      this.cond = false;
      query.push(new nodes.Feature(expr.nodes));
      return query;
    }

    if (pred = this.accept('ident') || this.accept('not')) {
      pred = new nodes.Literal(pred.val.string || pred.val);

      this.skipSpacesAndComments();
      if (id = this.accept('ident')) {
        query.type = id.val;
        query.predicate = pred;
      } else {
        query.type = pred;
      }
      this.skipSpacesAndComments();

      if (!this.accept('&&')) return query;
    }

    do {
      query.push(this.feature());
    } while (this.accept('&&'));

    return query;
  },

  /**
   * '(' ident ( ':'? expression )? ')'
   */

  feature: function() {
    this.skipSpacesAndComments();
    this.expect('(');
    this.skipSpacesAndComments();
    var node = new nodes.Feature(this.interpolate());
    this.skipSpacesAndComments();
    this.accept(':')
    this.skipSpacesAndComments();
    this.inProperty = true;
    node.expr = this.list();
    this.inProperty = false;
    this.skipSpacesAndComments();
    this.expect(')');
    this.skipSpacesAndComments();
    return node;
  },

  /**
   * @-moz-document call (',' call)* block
   */

  mozdocument: function(){
    this.expect('-moz-document');
    var mozdocument = new nodes.Atrule('-moz-document')
      , calls = [];
    do {
      this.skipSpacesAndComments();
      calls.push(this.functionCall());
      this.skipSpacesAndComments();
    } while (this.accept(','));
    mozdocument.segments = [new nodes.Literal(calls.join(', '))];
    this.state.push('atrule');
    mozdocument.block = this.block(mozdocument, false);
    this.state.pop();
    return mozdocument;
  },

  /**
   * import expression
   */

  import: function() {
    this.expect('import');
    this.allowPostfix = true;
    return new nodes.Import(this.expression(), false);
  },

  /**
   * require expression
   */

  require: function() {
    this.expect('require');
    this.allowPostfix = true;
    return new nodes.Import(this.expression(), true);
  },

  /**
   * charset string
   */

  charset: function() {
    this.expect('charset');
    var str = this.expect('string').val;
    this.allowPostfix = true;
    return new nodes.Charset(str);
  },

  /**
   * namespace ident? (string | url)
   */

  namespace: function() {
    var str
      , prefix;
    this.expect('namespace');

    this.skipSpacesAndComments();
    if (prefix = this.accept('ident')) {
      prefix = prefix.val;
    }
    this.skipSpacesAndComments();

    str = this.accept('string') || this.url();
    this.allowPostfix = true;
    return new nodes.Namespace(str, prefix);
  },

  /**
   * keyframes name block
   */

  keyframes: function() {
    var tok = this.expect('keyframes')
      , keyframes;

    this.skipSpacesAndComments();
    keyframes = new nodes.Keyframes(this.selectorParts(), tok.val);
    keyframes.column = tok.column;

    this.skipSpacesAndComments();

    // block
    this.state.push('atrule');
    keyframes.block = this.block(keyframes);
    this.state.pop();

    return keyframes;
  },

  /**
   * literal
   */

  literal: function() {
    return this.expect('literal').val;
  },

  /**
   * ident space?
   */

  id: function() {
    var tok = this.expect('ident');
    this.accept('space');
    return tok.val;
  },

  /**
   *   ident
   * | assignment
   * | property
   * | selector
   */

  ident: function() {
    var i = 2
      , la = this.lookahead(i).type;

    while ('space' == la) la = this.lookahead(++i).type;

    switch (la) {
      // Assignment
      case '=':
      case '?=':
      case '-=':
      case '+=':
      case '*=':
      case '/=':
      case '%=':
        return this.assignment();
      // Member
      case '.':
        if ('space' == this.lookahead(i - 1).type) return this.selector();
        if (this._ident == this.peek()) return this.id();
        while ('=' != this.lookahead(++i).type
          && !~['[', ',', 'newline', 'indent', 'eos'].indexOf(this.lookahead(i).type)) ;
        if ('=' == this.lookahead(i).type) {
          this._ident = this.peek();
          return this.expression();
        } else if (this.looksLikeSelector() && this.stateAllowsSelector()) {
          return this.selector();
        }
      // Assignment []=
      case '[':
        if (this._ident == this.peek()) return this.id();
        while (']' != this.lookahead(i++).type
          && 'selector' != this.lookahead(i).type
          && 'eos' != this.lookahead(i).type) ;
        if ('=' == this.lookahead(i).type) {
          this._ident = this.peek();
          return this.expression();
        } else if (this.looksLikeSelector() && this.stateAllowsSelector()) {
          return this.selector();
        }
      // Operation
      case '-':
      case '+':
      case '/':
      case '*':
      case '%':
      case '**':
      case '&&':
      case '||':
      case '>':
      case '<':
      case '>=':
      case '<=':
      case '!=':
      case '==':
      case '?':
      case 'in':
      case 'is a':
      case 'is defined':
        // Prevent cyclic .ident, return literal
        if (this._ident == this.peek()) {
          return this.id();
        } else {
          this._ident = this.peek();
          switch (this.currentState()) {
            // unary op or selector in property / for
            case 'for':
            case 'selector':
              return this.property();
            // Part of a selector
            case 'root':
            case 'atblock':
            case 'atrule':
              return '[' == la
                ? this.subscript()
                : this.selector();
            case 'function':
            case 'conditional':
              return this.looksLikeSelector()
                ? this.selector()
                : this.expression();
            // Do not disrupt the ident when an operand
            default:
              return this.operand
                ? this.id()
                : this.expression();
          }
        }
      // Selector or property
      default:
        switch (this.currentState()) {
          case 'root':
            return this.selector();
          case 'for':
          case 'selector':
          case 'function':
          case 'conditional':
          case 'atblock':
          case 'atrule':
            return this.property();
          default:
            var id = this.id();
            if ('interpolation' == this.previousState()) id.mixin = true;
            return id;
        }
    }
  },

  /**
   * '*'? (ident | '{' expression '}')+
   */

  interpolate: function() {
    var node
      , segs = []
      , star;

    star = this.accept('*');
    if (star) segs.push(new nodes.Literal('*'));

    while (true) {
      if (this.accept('{')) {
        this.state.push('interpolation');
        segs.push(this.expression());
        this.expect('}');
        this.state.pop();
      } else if (node = this.accept('-')){
        segs.push(new nodes.Literal('-'));
      } else if (node = this.accept('ident')){
        segs.push(node.val);
      } else {
        break;
      }
    }
    if (!segs.length) this.expect('ident');
    return segs;
  },

  /**
   *   property ':'? expression
   * | ident
   */

  property: function() {
    if (this.looksLikeSelector(true)) return this.selector();

    // property
    var ident = this.interpolate()
      , prop = new nodes.Property(ident)
      , ret = prop;

    // optional ':'
    this.accept('space');
    if (this.accept(':')) this.accept('space');

    this.state.push('property');
    this.inProperty = true;
    prop.expr = this.list();
    if (prop.expr.isEmpty) ret = ident[0];
    this.inProperty = false;
    this.allowPostfix = true;
    this.state.pop();

    // optional ';'
    this.accept(';');

    return ret;
  },

  /**
   *   selector ',' selector
   * | selector newline selector
   * | selector block
   */

  selector: function() {
    var arr
      , group = new nodes.Group
      , scope = this.selectorScope
      , isRoot = 'root' == this.currentState()
      , selector;

    do {
      // Clobber newline after ,
      this.accept('newline');

      arr = this.selectorParts();

      // Push the selector
      if (isRoot && scope) arr.unshift(new nodes.Literal(scope + ' '));
      if (arr.length) {
        selector = new nodes.Selector(arr);
        selector.lineno = arr[0].lineno;
        selector.column = arr[0].column;
        group.push(selector);
      }
    } while (this.accept(',') || this.accept('newline'));

    if ('selector-parts' == this.currentState()) return group.nodes;

    this.state.push('selector');
    group.block = this.block(group);
    this.state.pop();

    return group;
  },

  selectorParts: function(){
    var tok
      , arr = [];

    // Selector candidates,
    // stitched together to
    // form a selector.
    while (tok = this.selectorToken()) {
      debug.selector('%s', tok);
      // Selector component
      switch (tok.type) {
        case '{':
          this.skipSpaces();
          var expr = this.expression();
          this.skipSpaces();
          this.expect('}');
          arr.push(expr);
          break;
        case this.prefix && '.':
          var literal = new nodes.Literal(tok.val + this.prefix);
          literal.prefixed = true;
          arr.push(literal);
          break;
        case 'comment':
          // ignore comments
          break;
        case 'color':
        case 'unit':
          arr.push(new nodes.Literal(tok.val.raw));
          break;
        case 'space':
          arr.push(new nodes.Literal(' '));
          break;
        case 'function':
          arr.push(new nodes.Literal(tok.val.name + '('));
          break;
        case 'ident':
          arr.push(new nodes.Literal(tok.val.name || tok.val.string));
          break;
        default:
          arr.push(new nodes.Literal(tok.val));
          if (tok.space) arr.push(new nodes.Literal(' '));
      }
    }

    return arr;
  },

  /**
   * ident ('=' | '?=') expression
   */

  assignment: function() {
    var
      op,
      node,
      ident = this.id(),
      name = ident.name;

    if (op =
         this.accept('=')
      || this.accept('?=')
      || this.accept('+=')
      || this.accept('-=')
      || this.accept('*=')
      || this.accept('/=')
      || this.accept('%=')) {
      this.state.push('assignment');
      var expr = this.list();
      // @block support
      if (expr.isEmpty) this.assignAtblock(expr);
      node = new nodes.Ident(name, expr);

      node.lineno = ident.lineno;
      node.column = ident.column;

      this.state.pop();

      switch (op.type) {
        case '?=':
          var defined = new nodes.BinOp('is defined', node)
            , lookup = new nodes.Expression;
          lookup.push(new nodes.Ident(name));
          node = new nodes.Ternary(defined, lookup, node);
          break;
        case '+=':
        case '-=':
        case '*=':
        case '/=':
        case '%=':
          node.val = new nodes.BinOp(op.type[0], new nodes.Ident(name), expr);
          break;
      }
    }

    return node;
  },

  /**
   *   definition
   * | call
   */

  function: function() {
    var parens = 1
      , i = 2
      , tok;

    // Lookahead and determine if we are dealing
    // with a function call or definition. Here
    // we pair parens to prevent false negatives
    out:
    while (tok = this.lookahead(i++)) {
      switch (tok.type) {
        case 'function':
        case '(':
          ++parens;
          break;
        case ')':
          if (!--parens) break out;
          break;
        case 'eos':
          this.error('failed to find closing paren ")"');
      }
    }

    // Definition or call
    switch (this.currentState()) {
      case 'expression':
        return this.functionCall();
      default:
        return this.looksLikeFunctionDefinition(i)
          ? this.functionDefinition()
          : this.expression();
    }
  },

  /**
   * url '(' (expression | urlchars)+ ')'
   */

  url: function() {
    this.expect('function');
    this.state.push('function arguments');
    var args = this.args();
    this.expect(')');
    this.state.pop();
    return new nodes.Call('url', args);
  },

  /**
   * '+'? ident '(' expression ')' block?
   */

  functionCall: function() {
    var withBlock = this.accept('+');
    if ('url' == this.peek().val.name) return this.url();

    var tok = this.expect('function').val;
    var name = tok.name;

    this.state.push('function arguments');
    this.parens++;
    var args = this.args();
    this.expect(')');
    this.parens--;
    this.state.pop();
    var call = new nodes.Call(name, args);

    call.column = tok.column;
    call.lineno = tok.lineno;

    if (withBlock) {
      this.state.push('function');
      call.block = this.block(call);
      this.state.pop();
    }
    return call;
  },

  /**
   * ident '(' params ')' block
   */

  functionDefinition: function() {
    var
      tok = this.expect('function'),
      name = tok.val.name;

    // params
    this.state.push('function params');
    this.skipWhitespace();
    var params = this.params();
    this.skipWhitespace();
    this.expect(')');
    this.state.pop();

    // Body
    this.state.push('function');
    var fn = new nodes.Function(name, params);

    fn.column = tok.column;
    fn.lineno = tok.lineno;

    fn.block = this.block(fn);
    this.state.pop();
    return new nodes.Ident(name, fn);
  },

  /**
   *   ident
   * | ident '...'
   * | ident '=' expression
   * | ident ',' ident
   */

  params: function() {
    var tok
      , node
      , params = new nodes.Params;
    while (tok = this.accept('ident')) {
      this.accept('space');
      params.push(node = tok.val);
      if (this.accept('...')) {
        node.rest = true;
      } else if (this.accept('=')) {
        node.val = this.expression();
      }
      this.skipWhitespace();
      this.accept(',');
      this.skipWhitespace();
    }
    return params;
  },

  /**
   * (ident ':')? expression (',' (ident ':')? expression)*
   */

  args: function() {
    var args = new nodes.Arguments
      , keyword;

    do {
      // keyword
      if ('ident' == this.peek().type && ':' == this.lookahead(2).type) {
        keyword = this.next().val.string;
        this.expect(':');
        args.map[keyword] = this.expression();
      // arg
      } else {
        args.push(this.expression());
      }
    } while (this.accept(','));

    return args;
  },

  /**
   * expression (',' expression)*
   */

  list: function() {
    var node = this.expression();

    while (this.accept(',')) {
      if (node.isList) {
        list.push(this.expression());
      } else {
        var list = new nodes.Expression(true);
        list.push(node);
        list.push(this.expression());
        node = list;
      }
    }
    return node;
  },

  /**
   * negation+
   */

  expression: function() {
    var node
      , expr = new nodes.Expression;
    this.state.push('expression');
    while (node = this.negation()) {
      if (!node) this.error('unexpected token {peek} in expression');
      expr.push(node);
    }
    this.state.pop();
    if (expr.nodes.length) {
      expr.lineno = expr.nodes[0].lineno;
      expr.column = expr.nodes[0].column;
    }
    return expr;
  },

  /**
   *   'not' ternary
   * | ternary
   */

  negation: function() {
    if (this.accept('not')) {
      return new nodes.UnaryOp('!', this.negation());
    }
    return this.ternary();
  },

  /**
   * logical ('?' expression ':' expression)?
   */

  ternary: function() {
    var node = this.logical();
    if (this.accept('?')) {
      var trueExpr = this.expression();
      this.expect(':');
      var falseExpr = this.expression();
      node = new nodes.Ternary(node, trueExpr, falseExpr);
    }
    return node;
  },

  /**
   * typecheck (('&&' | '||') typecheck)*
   */

  logical: function() {
    var op
      , node = this.typecheck();
    while (op = this.accept('&&') || this.accept('||')) {
      node = new nodes.BinOp(op.type, node, this.typecheck());
    }
    return node;
  },

  /**
   * equality ('is a' equality)*
   */

  typecheck: function() {
    var op
      , node = this.equality();
    while (op = this.accept('is a')) {
      this.operand = true;
      if (!node) this.error('illegal unary "' + op + '", missing left-hand operand');
      node = new nodes.BinOp(op.type, node, this.equality());
      this.operand = false;
    }
    return node;
  },

  /**
   * in (('==' | '!=') in)*
   */

  equality: function() {
    var op
      , node = this.in();
    while (op = this.accept('==') || this.accept('!=')) {
      this.operand = true;
      if (!node) this.error('illegal unary "' + op + '", missing left-hand operand');
      node = new nodes.BinOp(op.type, node, this.in());
      this.operand = false;
    }
    return node;
  },

  /**
   * relational ('in' relational)*
   */

  in: function() {
    var node = this.relational();
    while (this.accept('in')) {
      this.operand = true;
      if (!node) this.error('illegal unary "in", missing left-hand operand');
      node = new nodes.BinOp('in', node, this.relational());
      this.operand = false;
    }
    return node;
  },

  /**
   * range (('>=' | '<=' | '>' | '<') range)*
   */

  relational: function() {
    var op
      , node = this.range();
    while (op =
         this.accept('>=')
      || this.accept('<=')
      || this.accept('<')
      || this.accept('>')
      ) {
      this.operand = true;
      if (!node) this.error('illegal unary "' + op + '", missing left-hand operand');
      node = new nodes.BinOp(op.type, node, this.range());
      this.operand = false;
    }
    return node;
  },

  /**
   * additive (('..' | '...') additive)*
   */

  range: function() {
    var op
      , node = this.additive();
    if (op = this.accept('...') || this.accept('..')) {
      this.operand = true;
      if (!node) this.error('illegal unary "' + op + '", missing left-hand operand');
      node = new nodes.BinOp(op.val, node, this.additive());
      this.operand = false;
    }
    return node;
  },

  /**
   * multiplicative (('+' | '-') multiplicative)*
   */

  additive: function() {
    var op
      , node = this.multiplicative();
    while (op = this.accept('+') || this.accept('-')) {
      this.operand = true;
      node = new nodes.BinOp(op.type, node, this.multiplicative());
      this.operand = false;
    }
    return node;
  },

  /**
   * defined (('**' | '*' | '/' | '%') defined)*
   */

  multiplicative: function() {
    var op
      , node = this.defined();
    while (op =
         this.accept('**')
      || this.accept('*')
      || this.accept('/')
      || this.accept('%')) {
      this.operand = true;
      if ('/' == op && this.inProperty && !this.parens) {
        this.stash.push(new _$token_144('literal', new nodes.Literal('/')));
        this.operand = false;
        return node;
      } else {
        if (!node) this.error('illegal unary "' + op + '", missing left-hand operand');
        node = new nodes.BinOp(op.type, node, this.defined());
        this.operand = false;
      }
    }
    return node;
  },

  /**
   *    unary 'is defined'
   *  | unary
   */

  defined: function() {
    var node = this.unary();
    if (this.accept('is defined')) {
      if (!node) this.error('illegal unary "is defined", missing left-hand operand');
      node = new nodes.BinOp('is defined', node);
    }
    return node;
  },

  /**
   *   ('!' | '~' | '+' | '-') unary
   * | subscript
   */

  unary: function() {
    var op
      , node;
    if (op =
         this.accept('!')
      || this.accept('~')
      || this.accept('+')
      || this.accept('-')) {
      this.operand = true;
      node = this.unary();
      if (!node) this.error('illegal unary "' + op + '"');
      node = new nodes.UnaryOp(op.type, node);
      this.operand = false;
      return node;
    }
    return this.subscript();
  },

  /**
   *   member ('[' expression ']')+ '='?
   * | member
   */

  subscript: function() {
    var node = this.member()
      , id;
    while (this.accept('[')) {
      node = new nodes.BinOp('[]', node, this.expression());
      this.expect(']');
    }
    // TODO: TernaryOp :)
    if (this.accept('=')) {
      node.op += '=';
      node.val = this.list();
      // @block support
      if (node.val.isEmpty) this.assignAtblock(node.val);
    }
    return node;
  },

  /**
   *   primary ('.' id)+ '='?
   * | primary
   */

  member: function() {
    var node = this.primary();
    if (node) {
      while (this.accept('.')) {
        var id = new nodes.Ident(this.expect('ident').val.string);
        node = new nodes.Member(node, id);
      }
      this.skipSpaces();
      if (this.accept('=')) {
        node.val = this.list();
        // @block support
        if (node.val.isEmpty) this.assignAtblock(node.val);
      }
    }
    return node;
  },

  /**
   *   '{' '}'
   * | '{' pair (ws pair)* '}'
   */

  object: function(){
    var obj = new nodes.Object
      , id, val, comma, hash;
    this.expect('{');
    this.skipWhitespace();

    while (!this.accept('}')) {
      if (this.accept('comment')
        || this.accept('newline')) continue;

      if (!comma) this.accept(',');
      id = this.accept('ident') || this.accept('string');

      if (!id) {
        this.error('expected "ident" or "string", got {peek}');
      }

      hash = id.val.hash;

      this.skipSpacesAndComments();
      this.expect(':');

      val = this.expression();

      obj.setValue(hash, val);
      obj.setKey(hash, id.val);

      comma = this.accept(',');
      this.skipWhitespace();
    }

    return obj;
  },

  /**
   *   unit
   * | null
   * | color
   * | string
   * | ident
   * | boolean
   * | literal
   * | object
   * | atblock
   * | atrule
   * | '(' expression ')' '%'?
   */

  primary: function() {
    var tok;
    this.skipSpaces();

    // Parenthesis
    if (this.accept('(')) {
      ++this.parens;
      var expr = this.expression()
        , paren = this.expect(')');
      --this.parens;
      if (this.accept('%')) expr.push(new nodes.Ident('%'));
      tok = this.peek();
      // (1 + 2)px, (1 + 2)em, etc.
      if (!paren.space
        && 'ident' == tok.type
        && ~_$units_145.indexOf(tok.val.string)) {
        expr.push(new nodes.Ident(tok.val.string));
        this.next();
      }
      return expr;
    }

    tok = this.peek();

    // Primitive
    switch (tok.type) {
      case 'null':
      case 'unit':
      case 'color':
      case 'string':
      case 'literal':
      case 'boolean':
      case 'comment':
        return this.next().val;
      case !this.cond && '{':
        return this.object();
      case 'atblock':
        return this.atblock();
      // property lookup
      case 'atrule':
        var id = new nodes.Ident(this.next().val);
        id.property = true;
        return id;
      case 'ident':
        return this.ident();
      case 'function':
        return tok.anonymous
          ? this.functionDefinition()
          : this.functionCall();
    }
  }
};

});
var _$null_20 = createModuleFactory(function (module, exports) {
/**
 * Module dependencies.
 */

var NullCache = module.exports = function() {};

/**
 * Set cache item with given `key` to `value`.
 *
 * @param {String} key
 * @param {Object} value
 * @api private
 */

NullCache.prototype.set = function(key, value) {};

/**
 * Get cache item with given `key`.
 *
 * @param {String} key
 * @return {Object}
 * @api private
 */

NullCache.prototype.get = function(key) {};

/**
 * Check if cache has given `key`.
 *
 * @param {String} key
 * @return {Boolean}
 * @api private
 */

NullCache.prototype.has = function(key) {
  return false;
};

/**
 * Generate key for the source `str` with `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @return {String}
 * @api private
 */

NullCache.prototype.key = function(str, options) {
  return '';
};

});
var _$memory_19 = createModuleFactory(function (module, exports) {
/**
 * Module dependencies.
 */

var nodes = _$nodes_115({});

var MemoryCache = module.exports = function(options) {
  options = options || {};
  this.limit = options['cache limit'] || 256;
  this._cache = {};
  this.length = 0;
  this.head = this.tail = null;
};

/**
 * Set cache item with given `key` to `value`.
 *
 * @param {String} key
 * @param {Object} value
 * @api private
 */

MemoryCache.prototype.set = function(key, value) {
  var clone = value.clone()
    , item;

  clone.filename = nodes.filename;
  clone.lineno = nodes.lineno;
  clone.column = nodes.column;
  item = { key: key, value: clone };
  this._cache[key] = item;

  if (this.tail) {
    this.tail.next = item;
    item.prev = this.tail;
  } else {
    this.head = item;
  }

  this.tail = item;
  if (this.length++ == this.limit) this.purge();
};

/**
 * Get cache item with given `key`.
 *
 * @param {String} key
 * @return {Object}
 * @api private
 */

MemoryCache.prototype.get = function(key) {
  var item = this._cache[key]
    , val = item.value.clone();

  if (item == this.tail) return val;
  if (item.next) {
    if (item == this.head) this.head = item.next;
    item.next.prev = item.prev;
  }
  if (item.prev) item.prev.next = item.next;

  item.next = null;
  item.prev = this.tail;

  if (this.tail) this.tail.next = item;
  this.tail = item;

  return val;
};

/**
 * Check if cache has given `key`.
 *
 * @param {String} key
 * @return {Boolean}
 * @api private
 */

MemoryCache.prototype.has = function(key) {
  return !!this._cache[key];
};

/**
 * Generate key for the source `str` with `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @return {String}
 * @api private
 */

MemoryCache.prototype.key = function(str, options) {
  var hash = _$crypto_158.createHash('sha1');
  hash.update(str + options.prefix);
  return hash.digest('hex');
};

/**
 * Remove the oldest item from the cache.
 *
 * @api private
 */

MemoryCache.prototype.purge = function() {
  var item = this.head;

  if (this.head.next) {
    this.head = this.head.next;
    this.head.prev = null;
  }

  this._cache[item.key] = item.prev = item.next = null;
  this.length--;
};

});
var _$nodes_115 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - nodes
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

exports.lineno = null;
exports.column = null;
exports.filename = null;

/**
 * Constructors
 */

exports.Node = _$node_121({});
exports.Root = _$root_130({});
exports.Null = _$null_122({});
exports.Each = _$each_105({});
exports.If = _$if_113({});
exports.Call = _$call_102({});
exports.UnaryOp = _$unaryop_135({});
exports.BinOp = _$binop_99({});
exports.Ternary = _$ternary_134({});
exports.Block = _$block_100({});
exports.Unit = _$unit_136({});
exports.String = _$string_132({});
exports.HSLA = _$hsla_111({});
exports.RGBA = _$rgba_129({});
exports.Ident = _$ident_112({});
exports.Group = _$group_110({});
exports.Literal = _$literal_117({});
exports.Boolean = _$boolean_101({});
exports.Return = _$return_128({});
exports.Media = _$media_118({});
exports.QueryList = _$queryList_126({});
exports.Query = _$query_127({});
exports.Feature = _$feature_108({});
exports.Params = _$params_124({});
exports.Comment = _$comment_104({});
exports.Keyframes = _$keyframes_116({});
exports.Member = _$member_119({});
exports.Charset = _$charset_103({});
exports.Namespace = _$namespace_120({});
exports.Import = _$import_114({});
exports.Extend = _$extend_107({});
exports.Object = _$object_123({});
exports.Function = _$function_109({});
exports.Property = _$property_125({});
exports.Selector = _$selector_131({});
exports.Expression = _$expression_106({});
exports.Arguments = _$arguments_96({});
exports.Atblock = _$atblock_97({});
exports.Atrule = _$atrule_98({});
exports.Supports = _$supports_133({});

/**
 * Singletons.
 */

exports.true = new exports.Boolean(true);
exports.false = new exports.Boolean(false);
exports.null = new exports.Null;

});
var _$supports_133 = createModuleFactory(function (module, exports) {
/*!
 * Stylus - supports
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Atrule = _$atrule_98({});

/**
 * Initialize a new supports node.
 *
 * @param {Expression} condition
 * @api public
 */

var Supports = module.exports = function Supports(condition){
  Atrule.call(this, 'supports');
  this.condition = condition;
};

/**
 * Inherit from `Atrule.prototype`.
 */

Supports.prototype.__proto__ = Atrule.prototype;

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

Supports.prototype.clone = function(parent){
  var clone = new Supports;
  clone.condition = this.condition.clone(parent, clone);
  clone.block = this.block.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Supports.prototype.toJSON = function(){
  return {
    __type: 'Supports',
    condition: this.condition,
    block: this.block,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

/**
 * Return @supports
 *
 * @return {String}
 * @api public
 */

Supports.prototype.toString = function(){
  return '@supports ' + this.condition;
};

});
var _$atblock_97 = createModuleFactory(function (module, exports) {
/*!
 * Stylus - @block
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `@block` node.
 *
 * @api public
 */

var Atblock = module.exports = function Atblock(){
  Node.call(this);
};

/**
 * Return `block` nodes.
 */

Atblock.prototype.__defineGetter__('nodes', function(){
  return this.block.nodes;
});

/**
 * Inherit from `Node.prototype`.
 */

Atblock.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

Atblock.prototype.clone = function(parent){
  var clone = new Atblock;
  clone.block = this.block.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return @block.
 *
 * @return {String}
 * @api public
 */

Atblock.prototype.toString = function(){
  return '@block';
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Atblock.prototype.toJSON = function(){
  return {
    __type: 'Atblock',
    block: this.block,
    lineno: this.lineno,
    column: this.column,
    fileno: this.fileno
  };
};

});
var _$arguments_96 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Arguments
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({})
  , nodes = _$nodes_115({})
  , utils = _$utils_146({});

/**
 * Initialize a new `Arguments`.
 *
 * @api public
 */

var Arguments = module.exports = function Arguments(){
  nodes.Expression.call(this);
  this.map = {};
};

/**
 * Inherit from `nodes.Expression.prototype`.
 */

Arguments.prototype.__proto__ = nodes.Expression.prototype;

/**
 * Initialize an `Arguments` object with the nodes
 * from the given `expr`.
 *
 * @param {Expression} expr
 * @return {Arguments}
 * @api public
 */

Arguments.fromExpression = function(expr){
  var args = new Arguments
    , len = expr.nodes.length;
  args.lineno = expr.lineno;
  args.column = expr.column;
  args.isList = expr.isList;
  for (var i = 0; i < len; ++i) {
    args.push(expr.nodes[i]);
  }
  return args;
};

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

Arguments.prototype.clone = function(parent){
  var clone = nodes.Expression.prototype.clone.call(this, parent);
  clone.map = {};
  for (var key in this.map) {
    clone.map[key] = this.map[key].clone(parent, clone);
  }
  clone.isList = this.isList;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Arguments.prototype.toJSON = function(){
  return {
    __type: 'Arguments',
    map: this.map,
    isList: this.isList,
    preserve: this.preserve,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename,
    nodes: this.nodes
  };
};

});
var _$expression_106 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Expression
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({})
  , nodes = _$nodes_115({})
  , utils = _$utils_146({});

/**
 * Initialize a new `Expression`.
 *
 * @param {Boolean} isList
 * @api public
 */

var Expression = module.exports = function Expression(isList){
  Node.call(this);
  this.nodes = [];
  this.isList = isList;
};

/**
 * Check if the variable has a value.
 *
 * @return {Boolean}
 * @api public
 */

Expression.prototype.__defineGetter__('isEmpty', function(){
  return !this.nodes.length;
});

/**
 * Return the first node in this expression.
 *
 * @return {Node}
 * @api public
 */

Expression.prototype.__defineGetter__('first', function(){
  return this.nodes[0]
    ? this.nodes[0].first
    : nodes.null;
});

/**
 * Hash all the nodes in order.
 *
 * @return {String}
 * @api public
 */

Expression.prototype.__defineGetter__('hash', function(){
  return this.nodes.map(function(node){
    return node.hash;
  }).join('::');
});

/**
 * Inherit from `Node.prototype`.
 */

Expression.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Expression.prototype.clone = function(parent){
  var clone = new this.constructor(this.isList);
  clone.preserve = this.preserve;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  clone.nodes = this.nodes.map(function(node) {
    return node.clone(parent, clone);
  });
  return clone;
};

/**
 * Push the given `node`.
 *
 * @param {Node} node
 * @api public
 */

Expression.prototype.push = function(node){
  this.nodes.push(node);
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

Expression.prototype.operate = function(op, right, val){
  switch (op) {
    case '[]=':
      var self = this
        , range = utils.unwrap(right).nodes
        , val = utils.unwrap(val)
        , len
        , node;
      range.forEach(function(unit){
        len = self.nodes.length;
        if ('unit' == unit.nodeName) {
          var i = unit.val < 0 ? len + unit.val : unit.val
            , n = i;
          while (i-- > len) self.nodes[i] = nodes.null;
          self.nodes[n] = val;
        } else if (unit.string) {
          node = self.nodes[0];
          if (node && 'object' == node.nodeName) node.set(unit.string, val.clone());
        }
      });
      return val;
    case '[]':
      var expr = new nodes.Expression
        , vals = utils.unwrap(this).nodes
        , range = utils.unwrap(right).nodes
        , node;
      range.forEach(function(unit){
        if ('unit' == unit.nodeName) {
          node = vals[unit.val < 0 ? vals.length + unit.val : unit.val];
        } else if ('object' == vals[0].nodeName) {
          node = vals[0].get(unit.string);
        }
        if (node) expr.push(node);
      });
      return expr.isEmpty
        ? nodes.null
        : utils.unwrap(expr);
    case '||':
      return this.toBoolean().isTrue
        ? this
        : right;
    case 'in':
      return Node.prototype.operate.call(this, op, right);
    case '!=':
      return this.operate('==', right, val).negate();
    case '==':
      var len = this.nodes.length
        , right = right.toExpression()
        , a
        , b;
      if (len != right.nodes.length) return nodes.false;
      for (var i = 0; i < len; ++i) {
        a = this.nodes[i];
        b = right.nodes[i];
        if (a.operate(op, b).isTrue) continue;
        return nodes.false;
      }
      return nodes.true;
      break;
    default:
      return this.first.operate(op, right, val);
  }
};

/**
 * Expressions with length > 1 are truthy,
 * otherwise the first value's toBoolean()
 * method is invoked.
 *
 * @return {Boolean}
 * @api public
 */

Expression.prototype.toBoolean = function(){
  if (this.nodes.length > 1) return nodes.true;
  return this.first.toBoolean();
};

/**
 * Return "<a> <b> <c>" or "<a>, <b>, <c>" if
 * the expression represents a list.
 *
 * @return {String}
 * @api public
 */

Expression.prototype.toString = function(){
  return '(' + this.nodes.map(function(node){
    return node.toString();
  }).join(this.isList ? ', ' : ' ') + ')';
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Expression.prototype.toJSON = function(){
  return {
    __type: 'Expression',
    isList: this.isList,
    preserve: this.preserve,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename,
    nodes: this.nodes
  };
};

});
var _$selector_131 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Selector
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Block = _$block_100({})
  , Node = _$node_121({});

/**
 * Initialize a new `Selector` with the given `segs`.
 *
 * @param {Array} segs
 * @api public
 */

var Selector = module.exports = function Selector(segs){
  Node.call(this);
  this.inherits = true;
  this.segments = segs;
  this.optional = false;
};

/**
 * Inherit from `Node.prototype`.
 */

Selector.prototype.__proto__ = Node.prototype;

/**
 * Return the selector string.
 *
 * @return {String}
 * @api public
 */

Selector.prototype.toString = function(){
  return this.segments.join('') + (this.optional ? ' !optional' : '');
};

/**
 * Check if this is placeholder selector.
 *
 * @return {Boolean}
 * @api public
 */

Selector.prototype.__defineGetter__('isPlaceholder', function(){
  return this.val && ~this.val.substr(0, 2).indexOf('$');
});

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Selector.prototype.clone = function(parent){
  var clone = new Selector;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  clone.inherits = this.inherits;
  clone.val = this.val;
  clone.segments = this.segments.map(function(node){ return node.clone(parent, clone); });
  clone.optional = this.optional;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Selector.prototype.toJSON = function(){
  return {
    __type: 'Selector',
    inherits: this.inherits,
    segments: this.segments,
    optional: this.optional,
    val: this.val,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

});
var _$property_125 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Property
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `Property` with the given `segs` and optional `expr`.
 *
 * @param {Array} segs
 * @param {Expression} expr
 * @api public
 */

var Property = module.exports = function Property(segs, expr){
  Node.call(this);
  this.segments = segs;
  this.expr = expr;
};

/**
 * Inherit from `Node.prototype`.
 */

Property.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Property.prototype.clone = function(parent){
  var clone = new Property(this.segments);
  clone.name = this.name;
  if (this.literal) clone.literal = this.literal;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  clone.segments = this.segments.map(function(node){ return node.clone(parent, clone); });
  if (this.expr) clone.expr = this.expr.clone(parent, clone);
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Property.prototype.toJSON = function(){
  var json = {
    __type: 'Property',
    segments: this.segments,
    name: this.name,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
  if (this.expr) json.expr = this.expr;
  if (this.literal) json.literal = this.literal;
  return json;
};

/**
 * Return string representation of this node.
 *
 * @return {String}
 * @api public
 */

Property.prototype.toString = function(){
  return 'property(' + this.segments.join('') + ', ' + this.expr + ')';
};

/**
 * Operate on the property expression.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

Property.prototype.operate = function(op, right, val){
  return this.expr.operate(op, right, val);
};

});
var _$function_109 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Function
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `Function` with `name`, `params`, and `body`.
 *
 * @param {String} name
 * @param {Params|Function} params
 * @param {Block} body
 * @api public
 */

var Function = module.exports = function Function(name, params, body){
  Node.call(this);
  this.name = name;
  this.params = params;
  this.block = body;
  if ('function' == typeof params) this.fn = params;
};

/**
 * Check function arity.
 *
 * @return {Boolean}
 * @api public
 */

Function.prototype.__defineGetter__('arity', function(){
  return this.params.length;
});

/**
 * Inherit from `Node.prototype`.
 */

Function.prototype.__proto__ = Node.prototype;

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

Function.prototype.__defineGetter__('hash', function(){
  return 'function ' + this.name;
});

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Function.prototype.clone = function(parent){
  if (this.fn) {
    var clone = new Function(
        this.name
      , this.fn);
  } else {
    var clone = new Function(this.name);
    clone.params = this.params.clone(parent, clone);
    clone.block = this.block.clone(parent, clone);
  }
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return <name>(param1, param2, ...).
 *
 * @return {String}
 * @api public
 */

Function.prototype.toString = function(){
  if (this.fn) {
    return this.name
      + '('
      + this.fn.toString()
        .match(/^function *\w*\((.*?)\)/)
        .slice(1)
        .join(', ')
      + ')';
  } else {
    return this.name
      + '('
      + this.params.nodes.join(', ')
      + ')';
  }
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Function.prototype.toJSON = function(){
  var json = {
    __type: 'Function',
    name: this.name,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
  if (this.fn) {
    json.fn = this.fn;
  } else {
    json.params = this.params;
    json.block = this.block;
  }
  return json;
};

});
var _$object_123 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Object
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({})
  , nodes = _$nodes_115({})
  , nativeObj = {}.constructor;

/**
 * Initialize a new `Object`.
 *
 * @api public
 */

var Object = module.exports = function Object(){
  Node.call(this);
  this.vals = {};
  this.keys = {};
};

/**
 * Inherit from `Node.prototype`.
 */

Object.prototype.__proto__ = Node.prototype;

/**
 * Set `key` to `val`.
 *
 * @param {String} key
 * @param {Node} val
 * @return {Object} for chaining
 * @api public
 */

Object.prototype.setValue = function(key, val){
  this.vals[key] = val;
  return this;
};

/**
 * Alias for `setValue` for compatible API
 */
Object.prototype.set = Object.prototype.setValue;

/**
 * Set `key` to `val`.
 *
 * @param {String} key
 * @param {Node} val
 * @return {Object} for chaining
 * @api public
 */

Object.prototype.setKey = function(key, val){
  this.keys[key] = val;
  return this;
};

/**
 * Return length.
 *
 * @return {Number}
 * @api public
 */

Object.prototype.__defineGetter__('length', function() {
  return nativeObj.keys(this.vals).length;
});

/**
 * Get `key`.
 *
 * @param {String} key
 * @return {Node}
 * @api public
 */

Object.prototype.get = function(key){
  return this.vals[key] || nodes.null;
};

/**
 * Has `key`?
 *
 * @param {String} key
 * @return {Boolean}
 * @api public
 */

Object.prototype.has = function(key){
  return key in this.vals;
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

Object.prototype.operate = function(op, right){
  switch (op) {
    case '.':
    case '[]':
      return this.get(right.hash);
    case '==':
      var vals = this.vals
        , a
        , b;
      if ('object' != right.nodeName || this.length != right.length)
        return nodes.false;
      for (var key in vals) {
        a = vals[key];
        b = right.vals[key];
        if (a.operate(op, b).isFalse)
          return nodes.false;
      }
      return nodes.true;
    case '!=':
      return this.operate('==', right).negate();
    default:
      return Node.prototype.operate.call(this, op, right);
  }
};

/**
 * Return Boolean based on the length of this object.
 *
 * @return {Boolean}
 * @api public
 */

Object.prototype.toBoolean = function(){
  return nodes.Boolean(this.length);
};

/**
 * Convert object to string with properties.
 *
 * @return {String}
 * @api private
 */

Object.prototype.toBlock = function(){
  var str = '{'
    , key
    , val;

  for (key in this.vals) {
    val = this.get(key);
    if ('object' == val.first.nodeName) {
      str += key + ' ' + val.first.toBlock();
    } else {
      switch (key) {
        case '@charset':
          str += key + ' ' + val.first.toString() + ';';
          break;
        default:
          str += key + ':' + toString(val) + ';';
      }
    }
  }

  str += '}';

  return str;

  function toString(node) {
    if (node.nodes) {
      return node.nodes.map(toString).join(node.isList ? ',' : ' ');
    } else if ('literal' == node.nodeName && ',' == node.val) {
      return '\\,';
    }
    return node.toString();
  }
};

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

Object.prototype.clone = function(parent){
  var clone = new Object;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;

  var key;
  for (key in this.vals) {
    clone.vals[key] = this.vals[key].clone(parent, clone);
  }

  for (key in this.keys) {
    clone.keys[key] = this.keys[key].clone(parent, clone);
  }

  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Object.prototype.toJSON = function(){
  return {
    __type: 'Object',
    vals: this.vals,
    keys: this.keys,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

/**
 * Return "{ <prop>: <val> }"
 *
 * @return {String}
 * @api public
 */

Object.prototype.toString = function(){
  var obj = {};
  for (var prop in this.vals) {
    obj[prop] = this.vals[prop].toString();
  }
  return JSON.stringify(obj);
};

});
var _$extend_107 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Extend
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `Extend` with the given `selectors` array.
 *
 * @param {Array} selectors array of the selectors
 * @api public
 */

var Extend = module.exports = function Extend(selectors){
  Node.call(this);
  this.selectors = selectors;
};

/**
 * Inherit from `Node.prototype`.
 */

Extend.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Extend.prototype.clone = function(){
  return new Extend(this.selectors);
};

/**
 * Return `@extend selectors`.
 *
 * @return {String}
 * @api public
 */

Extend.prototype.toString = function(){
  return '@extend ' + this.selectors.join(', ');
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Extend.prototype.toJSON = function(){
  return {
    __type: 'Extend',
    selectors: this.selectors,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

});
var _$import_114 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Import
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `Import` with the given `expr`.
 *
 * @param {Expression} expr
 * @api public
 */

var Import = module.exports = function Import(expr, once){
  Node.call(this);
  this.path = expr;
  this.once = once || false;
};

/**
 * Inherit from `Node.prototype`.
 */

Import.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

Import.prototype.clone = function(parent){
  var clone = new Import();
  clone.path = this.path.nodeName ? this.path.clone(parent, clone) : this.path;
  clone.once = this.once;
  clone.mtime = this.mtime;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Import.prototype.toJSON = function(){
  return {
    __type: 'Import',
    path: this.path,
    once: this.once,
    mtime: this.mtime,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

});
var _$namespace_120 = createModuleFactory(function (module, exports) {
/*!
 * Stylus - Namespace
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `Namespace` with the given `val` and `prefix`
 *
 * @param {String|Call} val
 * @param {String} [prefix]
 * @api public
 */

var Namespace = module.exports = function Namespace(val, prefix){
  Node.call(this);
  this.val = val;
  this.prefix = prefix;
};

/**
 * Inherit from `Node.prototype`.
 */

Namespace.prototype.__proto__ = Node.prototype;

/**
 * Return @namespace "val".
 *
 * @return {String}
 * @api public
 */

Namespace.prototype.toString = function(){
  return '@namespace ' + (this.prefix ? this.prefix + ' ' : '') + this.val;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Namespace.prototype.toJSON = function(){
  return {
    __type: 'Namespace',
    val: this.val,
    prefix: this.prefix,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

});
var _$charset_103 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Charset
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `Charset` with the given `val`
 *
 * @param {String} val
 * @api public
 */

var Charset = module.exports = function Charset(val){
  Node.call(this);
  this.val = val;
};

/**
 * Inherit from `Node.prototype`.
 */

Charset.prototype.__proto__ = Node.prototype;

/**
 * Return @charset "val".
 *
 * @return {String}
 * @api public
 */

Charset.prototype.toString = function(){
  return '@charset ' + this.val;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Charset.prototype.toJSON = function(){
  return {
    __type: 'Charset',
    val: this.val,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

});
var _$member_119 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Member
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `Member` with `left` and `right`.
 *
 * @param {Node} left
 * @param {Node} right
 * @api public
 */

var Member = module.exports = function Member(left, right){
  Node.call(this);
  this.left = left;
  this.right = right;
};

/**
 * Inherit from `Node.prototype`.
 */

Member.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

Member.prototype.clone = function(parent){
  var clone = new Member;
  clone.left = this.left.clone(parent, clone);
  clone.right = this.right.clone(parent, clone);
  if (this.val) clone.val = this.val.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Member.prototype.toJSON = function(){
  var json = {
    __type: 'Member',
    left: this.left,
    right: this.right,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
  if (this.val) json.val = this.val;
  return json;
};

/**
 * Return a string representation of this node.
 *
 * @return {String}
 * @api public
 */

Member.prototype.toString = function(){
  return this.left.toString()
    + '.' + this.right.toString();
};

});
var _$keyframes_116 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Keyframes
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Atrule = _$atrule_98({});

/**
 * Initialize a new `Keyframes` with the given `segs`,
 * and optional vendor `prefix`.
 *
 * @param {Array} segs
 * @param {String} prefix
 * @api public
 */

var Keyframes = module.exports = function Keyframes(segs, prefix){
  Atrule.call(this, 'keyframes');
  this.segments = segs;
  this.prefix = prefix || 'official';
};

/**
 * Inherit from `Atrule.prototype`.
 */

Keyframes.prototype.__proto__ = Atrule.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Keyframes.prototype.clone = function(parent){
  var clone = new Keyframes;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  clone.segments = this.segments.map(function(node) { return node.clone(parent, clone); });
  clone.prefix = this.prefix;
  clone.block = this.block.clone(parent, clone);
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Keyframes.prototype.toJSON = function(){
  return {
    __type: 'Keyframes',
    segments: this.segments,
    prefix: this.prefix,
    block: this.block,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

/**
 * Return `@keyframes name`.
 *
 * @return {String}
 * @api public
 */

Keyframes.prototype.toString = function(){
  return '@keyframes ' + this.segments.join('');
};

});
var _$comment_104 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Comment
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `Comment` with the given `str`.
 *
 * @param {String} str
 * @param {Boolean} suppress
 * @param {Boolean} inline
 * @api public
 */

var Comment = module.exports = function Comment(str, suppress, inline){
  Node.call(this);
  this.str = str;
  this.suppress = suppress;
  this.inline = inline;
};

/**
 * Inherit from `Node.prototype`.
 */

Comment.prototype.__proto__ = Node.prototype;

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Comment.prototype.toJSON = function(){
  return {
    __type: 'Comment',
    str: this.str,
    suppress: this.suppress,
    inline: this.inline,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

/**
 * Return comment.
 *
 * @return {String}
 * @api public
 */

Comment.prototype.toString = function(){
  return this.str;
};

});
var _$params_124 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Params
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `Params` with `name`, `params`, and `body`.
 *
 * @param {String} name
 * @param {Params} params
 * @param {Expression} body
 * @api public
 */

var Params = module.exports = function Params(){
  Node.call(this);
  this.nodes = [];
};

/**
 * Check function arity.
 *
 * @return {Boolean}
 * @api public
 */

Params.prototype.__defineGetter__('length', function(){
  return this.nodes.length;
});

/**
 * Inherit from `Node.prototype`.
 */

Params.prototype.__proto__ = Node.prototype;

/**
 * Push the given `node`.
 *
 * @param {Node} node
 * @api public
 */

Params.prototype.push = function(node){
  this.nodes.push(node);
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Params.prototype.clone = function(parent){
  var clone = new Params;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  this.nodes.forEach(function(node){
    clone.push(node.clone(parent, clone));
  });
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Params.prototype.toJSON = function(){
  return {
    __type: 'Params',
    nodes: this.nodes,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};


});
var _$feature_108 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Feature
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `Feature` with the given `segs`.
 *
 * @param {Array} segs
 * @api public
 */

var Feature = module.exports = function Feature(segs){
  Node.call(this);
  this.segments = segs;
  this.expr = null;
};

/**
 * Inherit from `Node.prototype`.
 */

Feature.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Feature.prototype.clone = function(parent){
  var clone = new Feature;
  clone.segments = this.segments.map(function(node){ return node.clone(parent, clone); });
  if (this.expr) clone.expr = this.expr.clone(parent, clone);
  if (this.name) clone.name = this.name;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return "<ident>" or "(<ident>: <expr>)"
 *
 * @return {String}
 * @api public
 */

Feature.prototype.toString = function(){
  if (this.expr) {
    return '(' + this.segments.join('') + ': ' + this.expr.toString() + ')';
  } else {
    return this.segments.join('');
  }
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Feature.prototype.toJSON = function(){
  var json = {
    __type: 'Feature',
    segments: this.segments,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
  if (this.expr) json.expr = this.expr;
  if (this.name) json.name = this.name;
  return json;
};

});
var _$query_127 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Query
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `Query`.
 *
 * @api public
 */

var Query = module.exports = function Query(){
  Node.call(this);
  this.nodes = [];
  this.type = '';
  this.predicate = '';
};

/**
 * Inherit from `Node.prototype`.
 */

Query.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Query.prototype.clone = function(parent){
  var clone = new Query;
  clone.predicate = this.predicate;
  clone.type = this.type;
  for (var i = 0, len = this.nodes.length; i < len; ++i) {
    clone.push(this.nodes[i].clone(parent, clone));
  }
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Push the given `feature`.
 *
 * @param {Feature} feature
 * @api public
 */

Query.prototype.push = function(feature){
  this.nodes.push(feature);
};

/**
 * Return resolved type of this query.
 *
 * @return {String}
 * @api private
 */

Query.prototype.__defineGetter__('resolvedType', function(){
  if (this.type) {
    return this.type.nodeName
      ? this.type.string
      : this.type;
  }
});

/**
 * Return resolved predicate of this query.
 *
 * @return {String}
 * @api private
 */

Query.prototype.__defineGetter__('resolvedPredicate', function(){
  if (this.predicate) {
    return this.predicate.nodeName
      ? this.predicate.string
      : this.predicate;
  }
});

/**
 * Merges this query with the `other`.
 *
 * @param {Query} other
 * @return {Query}
 * @api private
 */

Query.prototype.merge = function(other){
  var query = new Query
    , p1 = this.resolvedPredicate
    , p2 = other.resolvedPredicate
    , t1 = this.resolvedType
    , t2 = other.resolvedType
    , type, pred;

  // Stolen from Sass :D
  t1 = t1 || t2;
  t2 = t2 || t1;
  if (('not' == p1) ^ ('not' == p2)) {
    if (t1 == t2) return;
    type = ('not' == p1) ? t2 : t1;
    pred = ('not' == p1) ? p2 : p1;
  } else if (('not' == p1) && ('not' == p2)) {
    if (t1 != t2) return;
    type = t1;
    pred = 'not';
  } else if (t1 != t2) {
    return;
  } else {
    type = t1;
    pred = p1 || p2;
  }
  query.predicate = pred;
  query.type = type;
  query.nodes = this.nodes.concat(other.nodes);
  return query;
};

/**
 * Return "<a> and <b> and <c>"
 *
 * @return {String}
 * @api public
 */

Query.prototype.toString = function(){
  var pred = this.predicate ? this.predicate + ' ' : ''
    , type = this.type || ''
    , len = this.nodes.length
    , str = pred + type;
  if (len) {
    str += (type && ' and ') + this.nodes.map(function(expr){
      return expr.toString();
    }).join(' and ');
  }
  return str;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Query.prototype.toJSON = function(){
  return {
    __type: 'Query',
    predicate: this.predicate,
    type: this.type,
    nodes: this.nodes,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

});
var _$queryList_126 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - QueryList
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `QueryList`.
 *
 * @api public
 */

var QueryList = module.exports = function QueryList(){
  Node.call(this);
  this.nodes = [];
};

/**
 * Inherit from `Node.prototype`.
 */

QueryList.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

QueryList.prototype.clone = function(parent){
  var clone = new QueryList;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  for (var i = 0; i < this.nodes.length; ++i) {
    clone.push(this.nodes[i].clone(parent, clone));
  }
  return clone;
};

/**
 * Push the given `node`.
 *
 * @param {Node} node
 * @api public
 */

QueryList.prototype.push = function(node){
  this.nodes.push(node);
};

/**
 * Merges this query list with the `other`.
 *
 * @param {QueryList} other
 * @return {QueryList}
 * @api private
 */

QueryList.prototype.merge = function(other){
  var list = new QueryList
    , merged;
  this.nodes.forEach(function(query){
    for (var i = 0, len = other.nodes.length; i < len; ++i){
      merged = query.merge(other.nodes[i]);
      if (merged) list.push(merged);
    }
  });
  return list;
};

/**
 * Return "<a>, <b>, <c>"
 *
 * @return {String}
 * @api public
 */

QueryList.prototype.toString = function(){
  return '(' + this.nodes.map(function(node){
    return node.toString();
  }).join(', ') + ')';
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

QueryList.prototype.toJSON = function(){
  return {
    __type: 'QueryList',
    nodes: this.nodes,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

});
var _$media_118 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Media
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Atrule = _$atrule_98({});

/**
 * Initialize a new `Media` with the given `val`
 *
 * @param {String} val
 * @api public
 */

var Media = module.exports = function Media(val){
  Atrule.call(this, 'media');
  this.val = val;
};

/**
 * Inherit from `Atrule.prototype`.
 */

Media.prototype.__proto__ = Atrule.prototype;

/**
 * Clone this node.
 *
 * @return {Media}
 * @api public
 */

Media.prototype.clone = function(parent){
  var clone = new Media;
  clone.val = this.val.clone(parent, clone);
  clone.block = this.block.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Media.prototype.toJSON = function(){
  return {
    __type: 'Media',
    val: this.val,
    block: this.block,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

/**
 * Return @media "val".
 *
 * @return {String}
 * @api public
 */

Media.prototype.toString = function(){
  return '@media ' + this.val;
};

});
var _$atrule_98 = createModuleFactory(function (module, exports) {
/*!
 * Stylus - at-rule
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new at-rule node.
 *
 * @param {String} type
 * @api public
 */

var Atrule = module.exports = function Atrule(type){
  Node.call(this);
  this.type = type;
};

/**
 * Inherit from `Node.prototype`.
 */

Atrule.prototype.__proto__ = Node.prototype;

/**
 * Check if at-rule's block has only properties.
 *
 * @return {Boolean}
 * @api public
 */

Atrule.prototype.__defineGetter__('hasOnlyProperties', function(){
  if (!this.block) return false;

  var nodes = this.block.nodes;
  for (var i = 0, len = nodes.length; i < len; ++i) {
    var nodeName = nodes[i].nodeName;
    switch(nodes[i].nodeName) {
      case 'property':
      case 'expression':
      case 'comment':
        continue;
      default:
        return false;
    }
  }
  return true;
});

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

Atrule.prototype.clone = function(parent){
  var clone = new Atrule(this.type);
  if (this.block) clone.block = this.block.clone(parent, clone);
  clone.segments = this.segments.map(function(node){ return node.clone(parent, clone); });
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Atrule.prototype.toJSON = function(){
  var json = {
    __type: 'Atrule',
    type: this.type,
    segments: this.segments,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
  if (this.block) json.block = this.block;
  return json;
};

/**
 * Return @<type>.
 *
 * @return {String}
 * @api public
 */

Atrule.prototype.toString = function(){
  return '@' + this.type;
};

/**
 * Check if the at-rule's block has output nodes.
 *
 * @return {Boolean}
 * @api public
 */

Atrule.prototype.__defineGetter__('hasOutput', function(){
  return !!this.block && hasOutput(this.block);
});

function hasOutput(block) {
  var nodes = block.nodes;

  // only placeholder selectors
  if (nodes.every(function(node){
    return 'group' == node.nodeName && node.hasOnlyPlaceholders;
  })) return false;

  // something visible
  return nodes.some(function(node) {
    switch (node.nodeName) {
      case 'property':
      case 'literal':
      case 'import':
        return true;
      case 'block':
        return hasOutput(node);
      default:
        if (node.block) return hasOutput(node.block);
    }
  });
}

});
var _$return_128 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Return
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({})
  , nodes = _$nodes_115({});

/**
 * Initialize a new `Return` node with the given `expr`.
 *
 * @param {Expression} expr
 * @api public
 */

var Return = module.exports = function Return(expr){
  this.expr = expr || nodes.null;
};

/**
 * Inherit from `Node.prototype`.
 */

Return.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Return.prototype.clone = function(parent){
  var clone = new Return();
  clone.expr = this.expr.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Return.prototype.toJSON = function(){
  return {
    __type: 'Return',
    expr: this.expr,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

});
var _$boolean_101 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Boolean
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({})
  , nodes = _$nodes_115({});

/**
 * Initialize a new `Boolean` node with the given `val`.
 *
 * @param {Boolean} val
 * @api public
 */

var Boolean = module.exports = function Boolean(val){
  Node.call(this);
  if (this.nodeName) {
    this.val = !!val;
  } else {
    return new Boolean(val);
  }
};

/**
 * Inherit from `Node.prototype`.
 */

Boolean.prototype.__proto__ = Node.prototype;

/**
 * Return `this` node.
 *
 * @return {Boolean}
 * @api public
 */

Boolean.prototype.toBoolean = function(){
  return this;
};

/**
 * Return `true` if this node represents `true`.
 *
 * @return {Boolean}
 * @api public
 */

Boolean.prototype.__defineGetter__('isTrue', function(){
  return this.val;
});

/**
 * Return `true` if this node represents `false`.
 *
 * @return {Boolean}
 * @api public
 */

Boolean.prototype.__defineGetter__('isFalse', function(){
  return ! this.val;
});

/**
 * Negate the value.
 *
 * @return {Boolean}
 * @api public
 */

Boolean.prototype.negate = function(){
  return new Boolean(!this.val);
};

/**
 * Return 'Boolean'.
 *
 * @return {String}
 * @api public
 */

Boolean.prototype.inspect = function(){
  return '[Boolean ' + this.val + ']';
};

/**
 * Return 'true' or 'false'.
 *
 * @return {String}
 * @api public
 */

Boolean.prototype.toString = function(){
  return this.val
    ? 'true'
    : 'false';
};

/**
 * Return a JSON representaiton of this node.
 *
 * @return {Object}
 * @api public
 */

Boolean.prototype.toJSON = function(){
  return {
    __type: 'Boolean',
    val: this.val
  };
};

});
var _$literal_117 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Literal
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({})
  , nodes = _$nodes_115({});

/**
 * Initialize a new `Literal` with the given `str`.
 *
 * @param {String} str
 * @api public
 */

var Literal = module.exports = function Literal(str){
  Node.call(this);
  this.val = str;
  this.string = str;
  this.prefixed = false;
};

/**
 * Inherit from `Node.prototype`.
 */

Literal.prototype.__proto__ = Node.prototype;

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

Literal.prototype.__defineGetter__('hash', function(){
  return this.val;
});

/**
 * Return literal value.
 *
 * @return {String}
 * @api public
 */

Literal.prototype.toString = function(){
  return this.val.toString();
};

/**
 * Coerce `other` to a literal.
 *
 * @param {Node} other
 * @return {String}
 * @api public
 */

Literal.prototype.coerce = function(other){
  switch (other.nodeName) {
    case 'ident':
    case 'string':
    case 'literal':
      return new Literal(other.string);
    default:
      return Node.prototype.coerce.call(this, other);
  }
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

Literal.prototype.operate = function(op, right){
  var val = right.first;
  switch (op) {
    case '+':
      return new nodes.Literal(this.string + this.coerce(val).string);
    default:
      return Node.prototype.operate.call(this, op, right);
  }
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Literal.prototype.toJSON = function(){
  return {
    __type: 'Literal',
    val: this.val,
    string: this.string,
    prefixed: this.prefixed,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

});
var _$group_110 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Group
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `Group`.
 *
 * @api public
 */

var Group = module.exports = function Group(){
  Node.call(this);
  this.nodes = [];
  this.extends = [];
};

/**
 * Inherit from `Node.prototype`.
 */

Group.prototype.__proto__ = Node.prototype;

/**
 * Push the given `selector` node.
 *
 * @param {Selector} selector
 * @api public
 */

Group.prototype.push = function(selector){
  this.nodes.push(selector);
};

/**
 * Return this set's `Block`.
 */

Group.prototype.__defineGetter__('block', function(){
  return this.nodes[0].block;
});

/**
 * Assign `block` to each selector in this set.
 *
 * @param {Block} block
 * @api public
 */

Group.prototype.__defineSetter__('block', function(block){
  for (var i = 0, len = this.nodes.length; i < len; ++i) {
    this.nodes[i].block = block;
  }
});

/**
 * Check if this set has only placeholders.
 *
 * @return {Boolean}
 * @api public
 */

Group.prototype.__defineGetter__('hasOnlyPlaceholders', function(){
  return this.nodes.every(function(selector) { return selector.isPlaceholder; });
});

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Group.prototype.clone = function(parent){
  var clone = new Group;
  clone.lineno = this.lineno;
  clone.column = this.column;
  this.nodes.forEach(function(node){
    clone.push(node.clone(parent, clone));
  });
  clone.filename = this.filename;
  clone.block = this.block.clone(parent, clone);
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Group.prototype.toJSON = function(){
  return {
    __type: 'Group',
    nodes: this.nodes,
    block: this.block,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

});
var _$ident_112 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Ident
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({})
  , nodes = _$nodes_115({});

/**
 * Initialize a new `Ident` by `name` with the given `val` node.
 *
 * @param {String} name
 * @param {Node} val
 * @api public
 */

var Ident = module.exports = function Ident(name, val, mixin){
  Node.call(this);
  this.name = name;
  this.string = name;
  this.val = val || nodes.null;
  this.mixin = !!mixin;
};

/**
 * Check if the variable has a value.
 *
 * @return {Boolean}
 * @api public
 */

Ident.prototype.__defineGetter__('isEmpty', function(){
  return undefined == this.val;
});

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

Ident.prototype.__defineGetter__('hash', function(){
  return this.name;
});

/**
 * Inherit from `Node.prototype`.
 */

Ident.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Ident.prototype.clone = function(parent){
  var clone = new Ident(this.name);
  clone.val = this.val.clone(parent, clone);
  clone.mixin = this.mixin;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  clone.property = this.property;
  clone.rest = this.rest;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Ident.prototype.toJSON = function(){
  return {
    __type: 'Ident',
    name: this.name,
    val: this.val,
    mixin: this.mixin,
    property: this.property,
    rest: this.rest,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

/**
 * Return <name>.
 *
 * @return {String}
 * @api public
 */

Ident.prototype.toString = function(){
  return this.name;
};

/**
 * Coerce `other` to an ident.
 *
 * @param {Node} other
 * @return {String}
 * @api public
 */

Ident.prototype.coerce = function(other){
  switch (other.nodeName) {
    case 'ident':
    case 'string':
    case 'literal':
      return new Ident(other.string);
    case 'unit':
      return new Ident(other.toString());
    default:
      return Node.prototype.coerce.call(this, other);
  }
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

Ident.prototype.operate = function(op, right){
  var val = right.first;
  switch (op) {
    case '-':
      if ('unit' == val.nodeName) {
        var expr = new nodes.Expression;
        val = val.clone();
        val.val = -val.val;
        expr.push(this);
        expr.push(val);
        return expr;
      }
    case '+':
      return new nodes.Ident(this.string + this.coerce(val).string);
  }
  return Node.prototype.operate.call(this, op, right);
};

});
var _$rgba_129 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - RGBA
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({})
  , HSLA = _$hsla_111({})
  , functions = _$functions_50({})
  , adjust = functions.adjust
  , nodes = _$nodes_115({});

/**
 * Initialize a new `RGBA` with the given r,g,b,a component values.
 *
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} a
 * @api public
 */

var RGBA = exports = module.exports = function RGBA(r,g,b,a){
  Node.call(this);
  this.r = clamp(r);
  this.g = clamp(g);
  this.b = clamp(b);
  this.a = clampAlpha(a);
  this.name = '';
  this.rgba = this;
};

/**
 * Inherit from `Node.prototype`.
 */

RGBA.prototype.__proto__ = Node.prototype;

/**
 * Return an `RGBA` without clamping values.
 * 
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} a
 * @return {RGBA}
 * @api public
 */

RGBA.withoutClamping = function(r,g,b,a){
  var rgba = new RGBA(0,0,0,0);
  rgba.r = r;
  rgba.g = g;
  rgba.b = b;
  rgba.a = a;
  return rgba;
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

RGBA.prototype.clone = function(){
  var clone = new RGBA(
      this.r
    , this.g
    , this.b
    , this.a);
  clone.raw = this.raw;
  clone.name = this.name;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

RGBA.prototype.toJSON = function(){
  return {
    __type: 'RGBA',
    r: this.r,
    g: this.g,
    b: this.b,
    a: this.a,
    raw: this.raw,
    name: this.name,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

/**
 * Return true.
 *
 * @return {Boolean}
 * @api public
 */

RGBA.prototype.toBoolean = function(){
  return nodes.true;
};

/**
 * Return `HSLA` representation.
 *
 * @return {HSLA}
 * @api public
 */

RGBA.prototype.__defineGetter__('hsla', function(){
  return HSLA.fromRGBA(this);
});

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

RGBA.prototype.__defineGetter__('hash', function(){
  return this.toString();
});

/**
 * Add r,g,b,a to the current component values.
 *
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} a
 * @return {RGBA} new node
 * @api public
 */

RGBA.prototype.add = function(r,g,b,a){
  return new RGBA(
      this.r + r
    , this.g + g
    , this.b + b
    , this.a + a);
};

/**
 * Subtract r,g,b,a from the current component values.
 *
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} a
 * @return {RGBA} new node
 * @api public
 */

RGBA.prototype.sub = function(r,g,b,a){
  return new RGBA(
      this.r - r
    , this.g - g
    , this.b - b
    , a == 1 ? this.a : this.a - a);
};

/**
 * Multiply rgb components by `n`.
 *
 * @param {String} n
 * @return {RGBA} new node
 * @api public
 */

RGBA.prototype.multiply = function(n){
  return new RGBA(
      this.r * n
    , this.g * n
    , this.b * n
    , this.a); 
};

/**
 * Divide rgb components by `n`.
 *
 * @param {String} n
 * @return {RGBA} new node
 * @api public
 */

RGBA.prototype.divide = function(n){
  return new RGBA(
      this.r / n
    , this.g / n
    , this.b / n
    , this.a); 
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

RGBA.prototype.operate = function(op, right){
  if ('in' != op) right = right.first

  switch (op) {
    case 'is a':
      if ('string' == right.nodeName && 'color' == right.string) {
        return nodes.true;
      }
      break;
    case '+':
      switch (right.nodeName) {
        case 'unit':
          var n = right.val;
          switch (right.type) {
            case '%': return adjust(this, new nodes.String('lightness'), right);
            case 'deg': return this.hsla.adjustHue(n).rgba;
            default: return this.add(n,n,n,0);
          }
        case 'rgba':
          return this.add(right.r, right.g, right.b, right.a);
        case 'hsla':
          return this.hsla.add(right.h, right.s, right.l);
      }
      break;
    case '-':
      switch (right.nodeName) {
        case 'unit':
          var n = right.val;
          switch (right.type) {
            case '%': return adjust(this, new nodes.String('lightness'), new nodes.Unit(-n, '%'));
            case 'deg': return this.hsla.adjustHue(-n).rgba;
            default: return this.sub(n,n,n,0);
          }
        case 'rgba':
          return this.sub(right.r, right.g, right.b, right.a);
        case 'hsla':
          return this.hsla.sub(right.h, right.s, right.l);
      }
      break;
    case '*':
      switch (right.nodeName) {
        case 'unit':
          return this.multiply(right.val);
      }
      break;
    case '/':
      switch (right.nodeName) {
        case 'unit':
          return this.divide(right.val);
      }
      break;
  }
  return Node.prototype.operate.call(this, op, right);
};

/**
 * Return #nnnnnn, #nnn, or rgba(n,n,n,n) string representation of the color.
 *
 * @return {String}
 * @api public
 */

RGBA.prototype.toString = function(){
  function pad(n) {
    return n < 16
      ? '0' + n.toString(16)
      : n.toString(16);
  }

  // special case for transparent named color
  if ('transparent' == this.name)
    return this.name;

  if (1 == this.a) {
    var r = pad(this.r)
      , g = pad(this.g)
      , b = pad(this.b);

    // Compress
    if (r[0] == r[1] && g[0] == g[1] && b[0] == b[1]) {
      return '#' + r[0] + g[0] + b[0];
    } else {
      return '#' + r + g + b;
    }
  } else {
    return 'rgba('
      + this.r + ','
      + this.g + ','
      + this.b + ','
      + (+this.a.toFixed(3)) + ')';
  }
};

/**
 * Return a `RGBA` from the given `hsla`.
 *
 * @param {HSLA} hsla
 * @return {RGBA}
 * @api public
 */

exports.fromHSLA = function(hsla){
  var h = hsla.h / 360
    , s = hsla.s / 100
    , l = hsla.l / 100
    , a = hsla.a;

  var m2 = l <= .5 ? l * (s + 1) : l + s - l * s
    , m1 = l * 2 - m2;

  var r = hue(h + 1/3) * 0xff
    , g = hue(h) * 0xff
    , b = hue(h - 1/3) * 0xff;

  function hue(h) {
    if (h < 0) ++h;
    if (h > 1) --h;
    if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
    if (h * 2 < 1) return m2;
    if (h * 3 < 2) return m1 + (m2 - m1) * (2/3 - h) * 6;
    return m1;
  }
  
  return new RGBA(r,g,b,a);
};

/**
 * Clamp `n` >= 0 and <= 255.
 *
 * @param {Number} n
 * @return {Number}
 * @api private
 */

function clamp(n) {
  return Math.max(0, Math.min(n.toFixed(0), 255));
}

/**
 * Clamp alpha `n` >= 0 and <= 1.
 *
 * @param {Number} n
 * @return {Number}
 * @api private
 */

function clampAlpha(n) {
  return Math.max(0, Math.min(n, 1));
}

});
var _$hsla_111 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - HSLA
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({})
  , nodes = _$nodes_115({});

/**
 * Initialize a new `HSLA` with the given h,s,l,a component values.
 *
 * @param {Number} h
 * @param {Number} s
 * @param {Number} l
 * @param {Number} a
 * @api public
 */

var HSLA = exports = module.exports = function HSLA(h,s,l,a){
  Node.call(this);
  this.h = clampDegrees(h);
  this.s = clampPercentage(s);
  this.l = clampPercentage(l);
  this.a = clampAlpha(a);
  this.hsla = this;
};

/**
 * Inherit from `Node.prototype`.
 */

HSLA.prototype.__proto__ = Node.prototype;

/**
 * Return hsla(n,n,n,n).
 *
 * @return {String}
 * @api public
 */

HSLA.prototype.toString = function(){
  return 'hsla('
    + this.h + ','
    + this.s.toFixed(0) + '%,'
    + this.l.toFixed(0) + '%,'
    + this.a + ')';
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

HSLA.prototype.clone = function(parent){
  var clone = new HSLA(
      this.h
    , this.s
    , this.l
    , this.a);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

HSLA.prototype.toJSON = function(){
  return {
    __type: 'HSLA',
    h: this.h,
    s: this.s,
    l: this.l,
    a: this.a,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

/**
 * Return rgba `RGBA` representation.
 *
 * @return {RGBA}
 * @api public
 */

HSLA.prototype.__defineGetter__('rgba', function(){
  return nodes.RGBA.fromHSLA(this);
});

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

HSLA.prototype.__defineGetter__('hash', function(){
  return this.rgba.toString();
});

/**
 * Add h,s,l to the current component values.
 *
 * @param {Number} h
 * @param {Number} s
 * @param {Number} l
 * @return {HSLA} new node
 * @api public
 */

HSLA.prototype.add = function(h,s,l){
  return new HSLA(
      this.h + h
    , this.s + s
    , this.l + l
    , this.a);
};

/**
 * Subtract h,s,l from the current component values.
 *
 * @param {Number} h
 * @param {Number} s
 * @param {Number} l
 * @return {HSLA} new node
 * @api public
 */

HSLA.prototype.sub = function(h,s,l){
  return this.add(-h, -s, -l);
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

HSLA.prototype.operate = function(op, right){
  switch (op) {
    case '==':
    case '!=':
    case '<=':
    case '>=':
    case '<':
    case '>':
    case 'is a':
    case '||':
    case '&&':
      return this.rgba.operate(op, right);
    default:
      return this.rgba.operate(op, right).hsla;
  }
};

/**
 * Return `HSLA` representation of the given `color`.
 *
 * @param {RGBA} color
 * @return {HSLA}
 * @api public
 */

exports.fromRGBA = function(rgba){
  var r = rgba.r / 255
    , g = rgba.g / 255
    , b = rgba.b / 255
    , a = rgba.a;

  var min = Math.min(r,g,b)
    , max = Math.max(r,g,b)
    , l = (max + min) / 2
    , d = max - min
    , h, s;

  switch (max) {
    case min: h = 0; break;
    case r: h = 60 * (g-b) / d; break;
    case g: h = 60 * (b-r) / d + 120; break;
    case b: h = 60 * (r-g) / d + 240; break;
  }

  if (max == min) {
    s = 0;
  } else if (l < .5) {
    s = d / (2 * l);
  } else {
    s = d / (2 - 2 * l);
  }

  h %= 360;
  s *= 100;
  l *= 100;

  return new HSLA(h,s,l,a);
};

/**
 * Adjust lightness by `percent`.
 *
 * @param {Number} percent
 * @return {HSLA} for chaining
 * @api public
 */

HSLA.prototype.adjustLightness = function(percent){
  this.l = clampPercentage(this.l + this.l * (percent / 100));
  return this;
};

/**
 * Adjust hue by `deg`.
 *
 * @param {Number} deg
 * @return {HSLA} for chaining
 * @api public
 */

HSLA.prototype.adjustHue = function(deg){
  this.h = clampDegrees(this.h + deg);
  return this;
};

/**
 * Clamp degree `n` >= 0 and <= 360.
 *
 * @param {Number} n
 * @return {Number}
 * @api private
 */

function clampDegrees(n) {
  n = n % 360;
  return n >= 0 ? n : 360 + n;
}

/**
 * Clamp percentage `n` >= 0 and <= 100.
 *
 * @param {Number} n
 * @return {Number}
 * @api private
 */

function clampPercentage(n) {
  return Math.max(0, Math.min(n, 100));
}

/**
 * Clamp alpha `n` >= 0 and <= 1.
 *
 * @param {Number} n
 * @return {Number}
 * @api private
 */

function clampAlpha(n) {
  return Math.max(0, Math.min(n, 1));
}

});
var _$string_132 = createModuleFactory(function (module, exports) {
/*!
 * Stylus - String
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({})
  , sprintf = _$functions_50({}).s
  , utils = _$utils_146({})
  , nodes = _$nodes_115({});

/**
 * Initialize a new `String` with the given `val`.
 *
 * @param {String} val
 * @param {String} quote
 * @api public
 */

var String = module.exports = function String(val, quote){
  Node.call(this);
  this.val = val;
  this.string = val;
  this.prefixed = false;
  if (typeof quote !== 'string') {
    this.quote = "'";
  } else {
    this.quote = quote;
  }
};

/**
 * Inherit from `Node.prototype`.
 */

String.prototype.__proto__ = Node.prototype;

/**
 * Return quoted string.
 *
 * @return {String}
 * @api public
 */

String.prototype.toString = function(){
  return this.quote + this.val + this.quote;
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

String.prototype.clone = function(){
  var clone = new String(this.val, this.quote);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

String.prototype.toJSON = function(){
  return {
    __type: 'String',
    val: this.val,
    quote: this.quote,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

/**
 * Return Boolean based on the length of this string.
 *
 * @return {Boolean}
 * @api public
 */

String.prototype.toBoolean = function(){
  return nodes.Boolean(this.val.length);
};

/**
 * Coerce `other` to a string.
 *
 * @param {Node} other
 * @return {String}
 * @api public
 */

String.prototype.coerce = function(other){
  switch (other.nodeName) {
    case 'string':
      return other;
    case 'expression':
      return new String(other.nodes.map(function(node){
        return this.coerce(node).val;
      }, this).join(' '));
    default:
      return new String(other.toString());
  }
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

String.prototype.operate = function(op, right){
  switch (op) {
    case '%':
      var expr = new nodes.Expression;
      expr.push(this);

      // constructargs
      var args = 'expression' == right.nodeName
        ? utils.unwrap(right).nodes
        : [right];

      // apply
      return sprintf.apply(null, [expr].concat(args));
    case '+':
      var expr = new nodes.Expression;
      expr.push(new String(this.val + this.coerce(right).val));
      return expr;
    default:
      return Node.prototype.operate.call(this, op, right);
  }
};

});
var _$unit_136 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Unit
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({})
  , nodes = _$nodes_115({});

/**
 * Unit conversion table.
 */

var FACTOR_TABLE = {
  'mm': {val: 1, label: 'mm'},
  'cm': {val: 10, label: 'mm'},
  'in': {val: 25.4, label: 'mm'},
  'pt': {val: 25.4/72, label: 'mm'},
  'ms': {val: 1, label: 'ms'},
  's': {val: 1000, label: 'ms'},
  'Hz': {val: 1, label: 'Hz'},
  'kHz': {val: 1000, label: 'Hz'}
};

/**
 * Initialize a new `Unit` with the given `val` and unit `type`
 * such as "px", "pt", "in", etc.
 *
 * @param {String} val
 * @param {String} type
 * @api public
 */

var Unit = module.exports = function Unit(val, type){
  Node.call(this);
  this.val = val;
  this.type = type;
};

/**
 * Inherit from `Node.prototype`.
 */

Unit.prototype.__proto__ = Node.prototype;

/**
 * Return Boolean based on the unit value.
 *
 * @return {Boolean}
 * @api public
 */

Unit.prototype.toBoolean = function(){
  return nodes.Boolean(this.type
      ? true
      : this.val);
};

/**
 * Return unit string.
 *
 * @return {String}
 * @api public
 */

Unit.prototype.toString = function(){
  return this.val + (this.type || '');
};

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

Unit.prototype.clone = function(){
  var clone = new Unit(this.val, this.type);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Unit.prototype.toJSON = function(){
  return {
    __type: 'Unit',
    val: this.val,
    type: this.type,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

Unit.prototype.operate = function(op, right){
  var type = this.type || right.first.type;

  // swap color
  if ('rgba' == right.nodeName || 'hsla' == right.nodeName) {
    return right.operate(op, this);
  }

  // operate
  if (this.shouldCoerce(op)) {
    right = right.first;
    // percentages
    if ('%' != this.type && ('-' == op || '+' == op) && '%' == right.type) {
      right = new Unit(this.val * (right.val / 100), '%');
    } else {
      right = this.coerce(right);
    }

    switch (op) {
      case '-':
        return new Unit(this.val - right.val, type);
      case '+':
        // keyframes interpolation
        type = type || (right.type == '%' && right.type);
        return new Unit(this.val + right.val, type);
      case '/':
        return new Unit(this.val / right.val, type);
      case '*':
        return new Unit(this.val * right.val, type);
      case '%':
        return new Unit(this.val % right.val, type);
      case '**':
        return new Unit(Math.pow(this.val, right.val), type);
      case '..':
      case '...':
        var start = this.val
          , end = right.val
          , expr = new nodes.Expression
          , inclusive = '..' == op;
        if (start < end) {
          do {
            expr.push(new nodes.Unit(start));
          } while (inclusive ? ++start <= end : ++start < end);
        } else {
          do {
            expr.push(new nodes.Unit(start));
          } while (inclusive ? --start >= end : --start > end);
        }
        return expr;
    }
  }

  return Node.prototype.operate.call(this, op, right);
};

/**
 * Coerce `other` unit to the same type as `this` unit.
 *
 * Supports:
 *
 *    mm -> cm | in
 *    cm -> mm | in
 *    in -> mm | cm
 *
 *    ms -> s
 *    s  -> ms
 *
 *    Hz  -> kHz
 *    kHz -> Hz
 *
 * @param {Unit} other
 * @return {Unit}
 * @api public
 */

Unit.prototype.coerce = function(other){
  if ('unit' == other.nodeName) {
    var a = this
      , b = other
      , factorA = FACTOR_TABLE[a.type]
      , factorB = FACTOR_TABLE[b.type];

    if (factorA && factorB && (factorA.label == factorB.label)) {
      var bVal = b.val * (factorB.val / factorA.val);
      return new nodes.Unit(bVal, a.type);
    } else {
      return new nodes.Unit(b.val, a.type);
    }
  } else if ('string' == other.nodeName) {
    // keyframes interpolation
    if ('%' == other.val) return new nodes.Unit(0, '%');
    var val = parseFloat(other.val);
    if (isNaN(val)) Node.prototype.coerce.call(this, other);
    return new nodes.Unit(val);
  } else {
    return Node.prototype.coerce.call(this, other);
  }
};

});
var _$block_100 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Block
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `Block` node with `parent` Block.
 *
 * @param {Block} parent
 * @api public
 */

var Block = module.exports = function Block(parent, node){
  Node.call(this);
  this.nodes = [];
  this.parent = parent;
  this.node = node;
  this.scope = true;
};

/**
 * Inherit from `Node.prototype`.
 */

Block.prototype.__proto__ = Node.prototype;

/**
 * Check if this block has properties..
 *
 * @return {Boolean}
 * @api public
 */

Block.prototype.__defineGetter__('hasProperties', function(){
  for (var i = 0, len = this.nodes.length; i < len; ++i) {
    if ('property' == this.nodes[i].nodeName) {
      return true;
    }
  }
});

/**
 * Check if this block has @media nodes.
 *
 * @return {Boolean}
 * @api public
 */

Block.prototype.__defineGetter__('hasMedia', function(){
  for (var i = 0, len = this.nodes.length; i < len; ++i) {
    var nodeName = this.nodes[i].nodeName;
    if ('media' == nodeName) {
      return true;
    }
  }
  return false;
});

/**
 * Check if this block is empty.
 *
 * @return {Boolean}
 * @api public
 */

Block.prototype.__defineGetter__('isEmpty', function(){
  return !this.nodes.length || this.nodes.every(function(n){return n.nodeName == 'comment'});
});

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Block.prototype.clone = function(parent, node){
  parent = parent || this.parent;
  var clone = new Block(parent, node || this.node);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  clone.scope = this.scope;
  this.nodes.forEach(function(node){
    clone.push(node.clone(clone, clone));
  });
  return clone;
};

/**
 * Push a `node` to this block.
 *
 * @param {Node} node
 * @api public
 */

Block.prototype.push = function(node){
  this.nodes.push(node);
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Block.prototype.toJSON = function(){
  return {
    __type: 'Block',
    // parent: this.parent,
    // node: this.node,
    scope: this.scope,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename,
    nodes: this.nodes
  };
};

});
var _$ternary_134 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Ternary
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `Ternary` with `cond`, `trueExpr` and `falseExpr`.
 *
 * @param {Expression} cond
 * @param {Expression} trueExpr
 * @param {Expression} falseExpr
 * @api public
 */

var Ternary = module.exports = function Ternary(cond, trueExpr, falseExpr){
  Node.call(this);
  this.cond = cond;
  this.trueExpr = trueExpr;
  this.falseExpr = falseExpr;
};

/**
 * Inherit from `Node.prototype`.
 */

Ternary.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Ternary.prototype.clone = function(parent){
  var clone = new Ternary();
  clone.cond = this.cond.clone(parent, clone);
  clone.trueExpr = this.trueExpr.clone(parent, clone);
  clone.falseExpr = this.falseExpr.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Ternary.prototype.toJSON = function(){
  return {
    __type: 'Ternary',
    cond: this.cond,
    trueExpr: this.trueExpr,
    falseExpr: this.falseExpr,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

});
var _$binop_99 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - BinOp
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `BinOp` with `op`, `left` and `right`.
 *
 * @param {String} op
 * @param {Node} left
 * @param {Node} right
 * @api public
 */

var BinOp = module.exports = function BinOp(op, left, right){
  Node.call(this);
  this.op = op;
  this.left = left;
  this.right = right;
};

/**
 * Inherit from `Node.prototype`.
 */

BinOp.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

BinOp.prototype.clone = function(parent){
  var clone = new BinOp(this.op);
  clone.left = this.left.clone(parent, clone);
  clone.right = this.right && this.right.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  if (this.val) clone.val = this.val.clone(parent, clone);
  return clone;
};

/**
 * Return <left> <op> <right>
 *
 * @return {String}
 * @api public
 */
BinOp.prototype.toString = function() {
  return this.left.toString() + ' ' + this.op + ' ' + this.right.toString();
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

BinOp.prototype.toJSON = function(){
  var json = {
    __type: 'BinOp',
    left: this.left,
    right: this.right,
    op: this.op,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
  if (this.val) json.val = this.val;
  return json;
};

});
var _$unaryop_135 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - UnaryOp
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `UnaryOp` with `op`, and `expr`.
 *
 * @param {String} op
 * @param {Node} expr
 * @api public
 */

var UnaryOp = module.exports = function UnaryOp(op, expr){
  Node.call(this);
  this.op = op;
  this.expr = expr;
};

/**
 * Inherit from `Node.prototype`.
 */

UnaryOp.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

UnaryOp.prototype.clone = function(parent){
  var clone = new UnaryOp(this.op);
  clone.expr = this.expr.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

UnaryOp.prototype.toJSON = function(){
  return {
    __type: 'UnaryOp',
    op: this.op,
    expr: this.expr,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

});
var _$call_102 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Call
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `Call` with `name` and `args`.
 *
 * @param {String} name
 * @param {Expression} args
 * @api public
 */

var Call = module.exports = function Call(name, args){
  Node.call(this);
  this.name = name;
  this.args = args;
};

/**
 * Inherit from `Node.prototype`.
 */

Call.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Call.prototype.clone = function(parent){
  var clone = new Call(this.name);
  clone.args = this.args.clone(parent, clone);
  if (this.block) clone.block = this.block.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return <name>(param1, param2, ...).
 *
 * @return {String}
 * @api public
 */

Call.prototype.toString = function(){
  var args = this.args.nodes.map(function(node) {
    var str = node.toString();
    return str.slice(1, str.length - 1);
  }).join(', ');

  return this.name + '(' + args + ')';
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Call.prototype.toJSON = function(){
  var json = {
    __type: 'Call',
    name: this.name,
    args: this.args,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
  if (this.block) json.block = this.block;
  return json;
};

});
var _$if_113 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - If
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `If` with the given `cond`.
 *
 * @param {Expression} cond
 * @param {Boolean|Block} negate, block
 * @api public
 */

var If = module.exports = function If(cond, negate){
  Node.call(this);
  this.cond = cond;
  this.elses = [];
  if (negate && negate.nodeName) {
    this.block = negate;
  } else {
    this.negate = negate;
  }
};

/**
 * Inherit from `Node.prototype`.
 */

If.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

If.prototype.clone = function(parent){
  var clone = new If();
  clone.cond = this.cond.clone(parent, clone);
  clone.block = this.block.clone(parent, clone);
  clone.elses = this.elses.map(function(node){ return node.clone(parent, clone); });
  clone.negate = this.negate;
  clone.postfix = this.postfix;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

If.prototype.toJSON = function(){
  return {
    __type: 'If',
    cond: this.cond,
    block: this.block,
    elses: this.elses,
    negate: this.negate,
    postfix: this.postfix,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

});
var _$each_105 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Each
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({})
  , nodes = _$nodes_115({});

/**
 * Initialize a new `Each` node with the given `val` name,
 * `key` name, `expr`, and `block`.
 *
 * @param {String} val
 * @param {String} key
 * @param {Expression} expr
 * @param {Block} block
 * @api public
 */

var Each = module.exports = function Each(val, key, expr, block){
  Node.call(this);
  this.val = val;
  this.key = key;
  this.expr = expr;
  this.block = block;
};

/**
 * Inherit from `Node.prototype`.
 */

Each.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Each.prototype.clone = function(parent){
  var clone = new Each(this.val, this.key);
  clone.expr = this.expr.clone(parent, clone);
  clone.block = this.block.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Each.prototype.toJSON = function(){
  return {
    __type: 'Each',
    val: this.val,
    key: this.key,
    expr: this.expr,
    block: this.block,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

});
var _$null_122 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Null
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({})
  , nodes = _$nodes_115({});

/**
 * Initialize a new `Null` node.
 *
 * @api public
 */

var Null = module.exports = function Null(){};

/**
 * Inherit from `Node.prototype`.
 */

Null.prototype.__proto__ = Node.prototype;

/**
 * Return 'Null'.
 *
 * @return {String}
 * @api public
 */

Null.prototype.inspect = 
Null.prototype.toString = function(){
  return 'null';
};

/**
 * Return false.
 *
 * @return {Boolean}
 * @api public
 */

Null.prototype.toBoolean = function(){
  return nodes.false;
};

/**
 * Check if the node is a null node.
 *
 * @return {Boolean}
 * @api public
 */

Null.prototype.__defineGetter__('isNull', function(){
  return true;
});

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

Null.prototype.__defineGetter__('hash', function(){
  return null;
});

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Null.prototype.toJSON = function(){
  return {
    __type: 'Null',
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

});
var _$root_130 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Root
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = _$node_121({});

/**
 * Initialize a new `Root` node.
 *
 * @api public
 */

var Root = module.exports = function Root(){
  this.nodes = [];
};

/**
 * Inherit from `Node.prototype`.
 */

Root.prototype.__proto__ = Node.prototype;

/**
 * Push a `node` to this block.
 *
 * @param {Node} node
 * @api public
 */

Root.prototype.push = function(node){
  this.nodes.push(node);
};

/**
 * Unshift a `node` to this block.
 *
 * @param {Node} node
 * @api public
 */

Root.prototype.unshift = function(node){
  this.nodes.unshift(node);
};

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

Root.prototype.clone = function(){
  var clone = new Root();
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  this.nodes.forEach(function(node){
    clone.push(node.clone(clone, clone));
  });
  return clone;
};

/**
 * Return "root".
 *
 * @return {String}
 * @api public
 */

Root.prototype.toString = function(){
  return '[Root]';
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Root.prototype.toJSON = function(){
  return {
    __type: 'Root',
    nodes: this.nodes,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};

});
var _$node_121 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Node
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Evaluator = _$evaluator_149({})
  , utils = _$utils_146({})
  , nodes = _$nodes_115({});

/**
 * Initialize a new `CoercionError` with the given `msg`.
 *
 * @param {String} msg
 * @api private
 */

function CoercionError(msg) {
  this.name = 'CoercionError'
  this.message = msg
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, CoercionError);
  }
}

/**
 * Inherit from `Error.prototype`.
 */

CoercionError.prototype.__proto__ = Error.prototype;

/**
 * Node constructor.
 *
 * @api public
 */

var Node = module.exports = function Node(){
  this.lineno = nodes.lineno || 1;
  this.column = nodes.column || 1;
  this.filename = nodes.filename;
};

Node.prototype = {
  constructor: Node,

  /**
   * Return this node.
   *
   * @return {Node}
   * @api public
   */

  get first() {
    return this;
  },

  /**
   * Return hash.
   *
   * @return {String}
   * @api public
   */

  get hash() {
    return this.val;
  },

  /**
   * Return node name.
   *
   * @return {String}
   * @api public
   */

  get nodeName() {
    return this.constructor.name.toLowerCase();
  },

  /**
   * Return this node.
   * 
   * @return {Node}
   * @api public
   */

  clone: function(){
    return this;
  },

  /**
   * Return a JSON representation of this node.
   *
   * @return {Object}
   * @api public
   */

  toJSON: function(){
    return {
      lineno: this.lineno,
      column: this.column,
      filename: this.filename
    };
  },

  /**
   * Nodes by default evaluate to themselves.
   *
   * @return {Node}
   * @api public
   */

  eval: function(){
    return new Evaluator(this).evaluate();
  },

  /**
   * Return true.
   *
   * @return {Boolean}
   * @api public
   */

  toBoolean: function(){
    return nodes.true;
  },

  /**
   * Return the expression, or wrap this node in an expression.
   *
   * @return {Expression}
   * @api public
   */

  toExpression: function(){
    if ('expression' == this.nodeName) return this;
    var expr = new nodes.Expression;
    expr.push(this);
    return expr;
  },

  /**
   * Return false if `op` is generally not coerced.
   *
   * @param {String} op
   * @return {Boolean}
   * @api private
   */

  shouldCoerce: function(op){
    switch (op) {
      case 'is a':
      case 'in':
      case '||':
      case '&&':
        return false;
      default:
        return true;
    }
  },

  /**
   * Operate on `right` with the given `op`.
   *
   * @param {String} op
   * @param {Node} right
   * @return {Node}
   * @api public
   */

  operate: function(op, right){
    switch (op) {
      case 'is a':
        if ('string' == right.first.nodeName) {
          return nodes.Boolean(this.nodeName == right.val);
        } else {
          throw new Error('"is a" expects a string, got ' + right.toString());
        }
      case '==':
        return nodes.Boolean(this.hash == right.hash);
      case '!=':
        return nodes.Boolean(this.hash != right.hash);
      case '>=':
        return nodes.Boolean(this.hash >= right.hash);
      case '<=':
        return nodes.Boolean(this.hash <= right.hash);
      case '>':
        return nodes.Boolean(this.hash > right.hash);
      case '<':
        return nodes.Boolean(this.hash < right.hash);
      case '||':
        return this.toBoolean().isTrue
          ? this
          : right;
      case 'in':
        var vals = utils.unwrap(right).nodes
          , len = vals && vals.length
          , hash = this.hash;
        if (!vals) throw new Error('"in" given invalid right-hand operand, expecting an expression');

        // 'prop' in obj
        if (1 == len && 'object' == vals[0].nodeName) {
          return nodes.Boolean(vals[0].has(this.hash));
        }

        for (var i = 0; i < len; ++i) {
          if (hash == vals[i].hash) {
            return nodes.true;
          }
        }
        return nodes.false;
      case '&&':
        var a = this.toBoolean()
          , b = right.toBoolean();
        return a.isTrue && b.isTrue
          ? right
          : a.isFalse
            ? this
            : right;
      default:
        if ('[]' == op) {
          var msg = 'cannot perform '
            + this
            + '[' + right + ']';
        } else {
          var msg = 'cannot perform'
            + ' ' + this
            + ' ' + op
            + ' ' + right;
        }
        throw new Error(msg);
    }
  },

  /**
   * Default coercion throws.
   *
   * @param {Node} other
   * @return {Node}
   * @api public
   */

  coerce: function(other){
    if (other.nodeName == this.nodeName) return other;
    throw new CoercionError('cannot coerce ' + other + ' to ' + this.nodeName);
  }
};

});
var _$evaluator_149 = createModuleFactory(function (module, exports) {
var nodes = _$nodes_115({}), utils = _$utils_146({}), bifs = _$functions_50({}), dirname = _$pathBrowserify_14.dirname, debug = _$debug_159('stylus:evaluator'), fs = require("fs");
function importFile(node, file, literal) {
    var importStack = this.importStack, Parser = _$parser_137({}), stat;
    if (node.once) {
        if (this.requireHistory[file])
            return nodes.null;
        this.requireHistory[file] = true;
        if (literal && !this.includeCSS) {
            return node;
        }
    }
    if (~importStack.indexOf(file))
        throw new Error('import loop has been found');
    var str = fs.readFileSync(file, 'utf8');
    if (!str.trim())
        return nodes.null;
    node.path = file;
    node.dirname = dirname(file);
    stat = fs.statSync(file);
    node.mtime = stat.mtime;
    this.paths.push(node.dirname);
    if (this.options._imports)
        this.options._imports.push(node.clone());
    importStack.push(file);
    nodes.filename = file;
    if (literal) {
        literal = new nodes.Literal(str.replace(/\r\n?/g, '\n'));
        literal.lineno = literal.column = 1;
        if (!this.resolveURL)
            return literal;
    }
    var block = new nodes.Block(), parser = new Parser(str, utils.merge({ root: block }, this.options));
    try {
        block = parser.parse();
    } catch (err) {
        var line = parser.lexer.lineno, column = parser.lexer.column;
        if (literal && this.includeCSS && this.resolveURL) {
            this.warn('ParseError: ' + file + ':' + line + ':' + column + '. This file included as-is');
            return literal;
        } else {
            err.filename = file;
            err.lineno = line;
            err.column = column;
            err.input = str;
            throw err;
        }
    }
    block = block.clone(this.currentBlock);
    block.parent = this.currentBlock;
    block.scope = false;
    var ret = this.visit(block);
    importStack.pop();
    if (!this.resolveURL || this.resolveURL.nocheck)
        this.paths.pop();
    return ret;
}
var Evaluator = module.exports = function Evaluator(root, options) {
    options = options || {};
    _$visitor_150.call(this, root);
    var functions = this.functions = options.functions || {};
    this.stack = new _$stack_141();
    this.imports = options.imports || [];
    this.globals = options.globals || {};
    this.paths = options.paths || [];
    this.prefix = options.prefix || '';
    this.filename = options.filename;
    this.includeCSS = options['include css'];
    this.resolveURL = functions.url && 'resolver' == functions.url.name && functions.url.options;
    this.paths.push(dirname(options.filename || '.'));
    this.stack.push(this.global = new _$frame_140(root));
    this.warnings = options.warn;
    this.options = options;
    this.calling = [];
    this.importStack = [];
    this.requireHistory = {};
    this.return = 0;
};
Evaluator.prototype.__proto__ = _$visitor_150.prototype;
var visit = _$visitor_150.prototype.visit;
Evaluator.prototype.visit = function (node) {
    try {
        return visit.call(this, node);
    } catch (err) {
        if (err.filename)
            throw err;
        err.lineno = node.lineno;
        err.column = node.column;
        err.filename = node.filename;
        err.stylusStack = this.stack.toString();
        try {
            err.input = fs.readFileSync(err.filename, 'utf8');
        } catch (err) {
        }
        throw err;
    }
};
Evaluator.prototype.setup = function () {
    var root = this.root;
    var imports = [];
    this.populateGlobalScope();
    this.imports.forEach(function (file) {
        var expr = new nodes.Expression();
        expr.push(new nodes.String(file));
        imports.push(new nodes.Import(expr));
    }, this);
    root.nodes = imports.concat(root.nodes);
};
Evaluator.prototype.populateGlobalScope = function () {
    var scope = this.global.scope;
    Object.keys(_$colors_21).forEach(function (name) {
        var color = _$colors_21[name], rgba = new nodes.RGBA(color[0], color[1], color[2], color[3]), node = new nodes.Ident(name, rgba);
        rgba.name = name;
        scope.add(node);
    });
    scope.add(new nodes.Ident('embedurl', new nodes.Function('embedurl', _$url_91({})({ limit: false }))));
    var globals = this.globals;
    Object.keys(globals).forEach(function (name) {
        var val = globals[name];
        if (!val.nodeName)
            val = new nodes.Literal(val);
        scope.add(new nodes.Ident(name, val));
    });
};
Evaluator.prototype.evaluate = function () {
    debug('eval %s', this.filename);
    this.setup();
    return this.visit(this.root);
};
Evaluator.prototype.visitGroup = function (group) {
    group.nodes = group.nodes.map(function (selector) {
        selector.val = this.interpolate(selector);
        debug('ruleset %s', selector.val);
        return selector;
    }, this);
    group.block = this.visit(group.block);
    return group;
};
Evaluator.prototype.visitReturn = function (ret) {
    ret.expr = this.visit(ret.expr);
    throw ret;
};
Evaluator.prototype.visitMedia = function (media) {
    media.block = this.visit(media.block);
    media.val = this.visit(media.val);
    return media;
};
Evaluator.prototype.visitQueryList = function (queries) {
    var val, query;
    queries.nodes.forEach(this.visit, this);
    if (1 == queries.nodes.length) {
        query = queries.nodes[0];
        if (val = this.lookup(query.type)) {
            val = val.first.string;
            if (!val)
                return queries;
            var Parser = _$parser_137({}), parser = new Parser(val, this.options);
            queries = this.visit(parser.queries());
        }
    }
    return queries;
};
Evaluator.prototype.visitQuery = function (node) {
    node.predicate = this.visit(node.predicate);
    node.type = this.visit(node.type);
    node.nodes.forEach(this.visit, this);
    return node;
};
Evaluator.prototype.visitFeature = function (node) {
    node.name = this.interpolate(node);
    if (node.expr) {
        this.return++;
        node.expr = this.visit(node.expr);
        this.return--;
    }
    return node;
};
Evaluator.prototype.visitObject = function (obj) {
    for (var key in obj.vals) {
        obj.vals[key] = this.visit(obj.vals[key]);
    }
    return obj;
};
Evaluator.prototype.visitMember = function (node) {
    var left = node.left, right = node.right, obj = this.visit(left).first;
    if ('object' != obj.nodeName) {
        throw new Error(left.toString() + ' has no property .' + right);
    }
    if (node.val) {
        this.return++;
        obj.set(right.name, this.visit(node.val));
        this.return--;
    }
    return obj.get(right.name);
};
Evaluator.prototype.visitKeyframes = function (keyframes) {
    var val;
    if (keyframes.fabricated)
        return keyframes;
    keyframes.val = this.interpolate(keyframes).trim();
    if (val = this.lookup(keyframes.val)) {
        keyframes.val = val.first.string || val.first.name;
    }
    keyframes.block = this.visit(keyframes.block);
    if ('official' != keyframes.prefix)
        return keyframes;
    this.vendors.forEach(function (prefix) {
        if ('ms' == prefix)
            return;
        var node = keyframes.clone();
        node.val = keyframes.val;
        node.prefix = prefix;
        node.block = keyframes.block;
        node.fabricated = true;
        this.currentBlock.push(node);
    }, this);
    return nodes.null;
};
Evaluator.prototype.visitFunction = function (fn) {
    var local = this.stack.currentFrame.scope.lookup(fn.name);
    if (local)
        this.warn('local ' + local.nodeName + ' "' + fn.name + '" previously defined in this scope');
    var user = this.functions[fn.name];
    if (user)
        this.warn('user-defined function "' + fn.name + '" is already defined');
    var bif = bifs[fn.name];
    if (bif)
        this.warn('built-in function "' + fn.name + '" is already defined');
    return fn;
};
Evaluator.prototype.visitEach = function (each) {
    this.return++;
    var expr = utils.unwrap(this.visit(each.expr)), len = expr.nodes.length, val = new nodes.Ident(each.val), key = new nodes.Ident(each.key || '__index__'), scope = this.currentScope, block = this.currentBlock, vals = [], self = this, body, obj;
    this.return--;
    each.block.scope = false;
    function visitBody(key, val) {
        scope.add(val);
        scope.add(key);
        body = self.visit(each.block.clone());
        vals = vals.concat(body.nodes);
    }
    if (1 == len && 'object' == expr.nodes[0].nodeName) {
        obj = expr.nodes[0];
        for (var prop in obj.vals) {
            val.val = new nodes.String(prop);
            key.val = obj.get(prop);
            visitBody(key, val);
        }
    } else {
        for (var i = 0; i < len; ++i) {
            val.val = expr.nodes[i];
            key.val = new nodes.Unit(i);
            visitBody(key, val);
        }
    }
    this.mixin(vals, block);
    return vals[vals.length - 1] || nodes.null;
};
Evaluator.prototype.visitCall = function (call) {
    debug('call %s', call);
    var fn = this.lookup(call.name), literal, ret;
    this.ignoreColors = 'url' == call.name;
    if (fn && 'expression' == fn.nodeName) {
        fn = fn.nodes[0];
    }
    if (fn && 'function' != fn.nodeName) {
        fn = this.lookupFunction(call.name);
    }
    if (!fn || fn.nodeName != 'function') {
        debug('%s is undefined', call);
        if ('calc' == this.unvendorize(call.name)) {
            literal = call.args.nodes && call.args.nodes[0];
            if (literal)
                ret = new nodes.Literal(call.name + literal);
        } else {
            ret = this.literalCall(call);
        }
        this.ignoreColors = false;
        return ret;
    }
    this.calling.push(call.name);
    if (this.calling.length > 200) {
        throw new RangeError('Maximum stylus call stack size exceeded');
    }
    if ('expression' == fn.nodeName)
        fn = fn.first;
    this.return++;
    var args = this.visit(call.args);
    for (var key in args.map) {
        args.map[key] = this.visit(args.map[key].clone());
    }
    this.return--;
    if (fn.fn) {
        debug('%s is built-in', call);
        ret = this.invokeBuiltin(fn.fn, args);
    } else if ('function' == fn.nodeName) {
        debug('%s is user-defined', call);
        if (call.block)
            call.block = this.visit(call.block);
        ret = this.invokeFunction(fn, args, call.block);
    }
    this.calling.pop();
    this.ignoreColors = false;
    return ret;
};
Evaluator.prototype.visitIdent = function (ident) {
    var prop;
    if (ident.property) {
        if (prop = this.lookupProperty(ident.name)) {
            return this.visit(prop.expr.clone());
        }
        return nodes.null;
    } else if (ident.val.isNull) {
        var val = this.lookup(ident.name);
        if (val && ident.mixin)
            this.mixinNode(val);
        return val ? this.visit(val) : ident;
    } else {
        this.return++;
        ident.val = this.visit(ident.val);
        this.return--;
        this.currentScope.add(ident);
        return ident.val;
    }
};
Evaluator.prototype.visitBinOp = function (binop) {
    if ('is defined' == binop.op)
        return this.isDefined(binop.left);
    this.return++;
    var op = binop.op, left = this.visit(binop.left), right = '||' == op || '&&' == op ? binop.right : this.visit(binop.right);
    var val = binop.val ? this.visit(binop.val) : null;
    this.return--;
    try {
        return this.visit(left.operate(op, right, val));
    } catch (err) {
        if ('CoercionError' == err.name) {
            switch (op) {
            case '==':
                return nodes.false;
            case '!=':
                return nodes.true;
            }
        }
        throw err;
    }
};
Evaluator.prototype.visitUnaryOp = function (unary) {
    var op = unary.op, node = this.visit(unary.expr);
    if ('!' != op) {
        node = node.first.clone();
        utils.assertType(node, 'unit');
    }
    switch (op) {
    case '-':
        node.val = -node.val;
        break;
    case '+':
        node.val = +node.val;
        break;
    case '~':
        node.val = ~node.val;
        break;
    case '!':
        return node.toBoolean().negate();
    }
    return node;
};
Evaluator.prototype.visitTernary = function (ternary) {
    var ok = this.visit(ternary.cond).toBoolean();
    return ok.isTrue ? this.visit(ternary.trueExpr) : this.visit(ternary.falseExpr);
};
Evaluator.prototype.visitExpression = function (expr) {
    for (var i = 0, len = expr.nodes.length; i < len; ++i) {
        expr.nodes[i] = this.visit(expr.nodes[i]);
    }
    if (this.castable(expr))
        expr = this.cast(expr);
    return expr;
};
Evaluator.prototype.visitArguments = Evaluator.prototype.visitExpression;
Evaluator.prototype.visitProperty = function (prop) {
    var name = this.interpolate(prop), fn = this.lookup(name), call = fn && 'function' == fn.first.nodeName, literal = ~this.calling.indexOf(name), _prop = this.property;
    if (call && !literal && !prop.literal) {
        var args = nodes.Arguments.fromExpression(utils.unwrap(prop.expr.clone()));
        prop.name = name;
        this.property = prop;
        this.return++;
        this.property.expr = this.visit(prop.expr);
        this.return--;
        var ret = this.visit(new nodes.Call(name, args));
        this.property = _prop;
        return ret;
    } else {
        this.return++;
        prop.name = name;
        prop.literal = true;
        this.property = prop;
        prop.expr = this.visit(prop.expr);
        this.property = _prop;
        this.return--;
        return prop;
    }
};
Evaluator.prototype.visitRoot = function (block) {
    if (block != this.root) {
        block.constructor = nodes.Block;
        return this.visit(block);
    }
    for (var i = 0; i < block.nodes.length; ++i) {
        block.index = i;
        block.nodes[i] = this.visit(block.nodes[i]);
    }
    return block;
};
Evaluator.prototype.visitBlock = function (block) {
    this.stack.push(new _$frame_140(block));
    for (block.index = 0; block.index < block.nodes.length; ++block.index) {
        try {
            block.nodes[block.index] = this.visit(block.nodes[block.index]);
        } catch (err) {
            if ('return' == err.nodeName) {
                if (this.return) {
                    this.stack.pop();
                    throw err;
                } else {
                    block.nodes[block.index] = err;
                    break;
                }
            } else {
                throw err;
            }
        }
    }
    this.stack.pop();
    return block;
};
Evaluator.prototype.visitAtblock = function (atblock) {
    atblock.block = this.visit(atblock.block);
    return atblock;
};
Evaluator.prototype.visitAtrule = function (atrule) {
    atrule.val = this.interpolate(atrule);
    if (atrule.block)
        atrule.block = this.visit(atrule.block);
    return atrule;
};
Evaluator.prototype.visitSupports = function (node) {
    var condition = node.condition, val;
    this.return++;
    node.condition = this.visit(condition);
    this.return--;
    val = condition.first;
    if (1 == condition.nodes.length && 'string' == val.nodeName) {
        node.condition = val.string;
    }
    node.block = this.visit(node.block);
    return node;
};
Evaluator.prototype.visitIf = function (node) {
    var ret, block = this.currentBlock, negate = node.negate;
    this.return++;
    var ok = this.visit(node.cond).first.toBoolean();
    this.return--;
    node.block.scope = node.block.hasMedia;
    if (negate) {
        if (ok.isFalse) {
            ret = this.visit(node.block);
        }
    } else {
        if (ok.isTrue) {
            ret = this.visit(node.block);
        } else if (node.elses.length) {
            var elses = node.elses, len = elses.length, cond;
            for (var i = 0; i < len; ++i) {
                if (elses[i].cond) {
                    elses[i].block.scope = elses[i].block.hasMedia;
                    this.return++;
                    cond = this.visit(elses[i].cond).first.toBoolean();
                    this.return--;
                    if (cond.isTrue) {
                        ret = this.visit(elses[i].block);
                        break;
                    }
                } else {
                    elses[i].scope = elses[i].hasMedia;
                    ret = this.visit(elses[i]);
                }
            }
        }
    }
    if (ret && !node.postfix && block.node && ~[
            'group',
            'atrule',
            'media',
            'supports',
            'keyframes'
        ].indexOf(block.node.nodeName)) {
        this.mixin(ret.nodes, block);
        return nodes.null;
    }
    return ret || nodes.null;
};
Evaluator.prototype.visitExtend = function (extend) {
    var block = this.currentBlock;
    if ('group' != block.node.nodeName)
        block = this.closestGroup;
    extend.selectors.forEach(function (selector) {
        block.node.extends.push({
            selector: this.interpolate(selector.clone()).trim(),
            optional: selector.optional,
            lineno: selector.lineno,
            column: selector.column
        });
    }, this);
    return nodes.null;
};
Evaluator.prototype.visitImport = function (imported) {
    this.return++;
    var path = this.visit(imported.path).first, nodeName = imported.once ? 'require' : 'import', found, literal;
    this.return--;
    debug('import %s', path);
    if ('url' == path.name) {
        if (imported.once)
            throw new Error('You cannot @require a url');
        return imported;
    }
    if (!path.string)
        throw new Error('@' + nodeName + ' string expected');
    var name = path = path.string;
    if (/(?:url\s*\(\s*)?['"]?(?:#|(?:https?:)?\/\/)/i.test(path)) {
        if (imported.once)
            throw new Error('You cannot @require a url');
        return imported;
    }
    if (/\.css(?:"|$)/.test(path)) {
        literal = true;
        if (!imported.once && !this.includeCSS) {
            return imported;
        }
    }
    if (!literal && !/\.styl$/i.test(path))
        path += '.styl';
    found = utils.find(path, this.paths, this.filename);
    if (!found) {
        found = utils.lookupIndex(name, this.paths, this.filename);
    }
    if (!found)
        throw new Error('failed to locate @' + nodeName + ' file ' + path);
    var block = new nodes.Block();
    for (var i = 0, len = found.length; i < len; ++i) {
        block.push(importFile.call(this, imported, found[i], literal));
    }
    return block;
};
Evaluator.prototype.invokeFunction = function (fn, args, content) {
    var block = new nodes.Block(fn.block.parent);
    var body = fn.block.clone(block);
    var mixinBlock = this.stack.currentFrame.block;
    this.stack.push(new _$frame_140(block));
    var scope = this.currentScope;
    if ('arguments' != args.nodeName) {
        var expr = new nodes.Expression();
        expr.push(args);
        args = nodes.Arguments.fromExpression(expr);
    }
    scope.add(new nodes.Ident('arguments', args));
    scope.add(new nodes.Ident('mixin', this.return ? nodes.false : new nodes.String(mixinBlock.nodeName)));
    if (this.property) {
        var prop = this.propertyExpression(this.property, fn.name);
        scope.add(new nodes.Ident('current-property', prop));
    } else {
        scope.add(new nodes.Ident('current-property', nodes.null));
    }
    var expr = new nodes.Expression();
    for (var i = this.calling.length - 1; i--;) {
        expr.push(new nodes.Literal(this.calling[i]));
    }
    ;
    scope.add(new nodes.Ident('called-from', expr));
    var i = 0, len = args.nodes.length;
    fn.params.nodes.forEach(function (node) {
        if (node.rest) {
            node.val = new nodes.Expression();
            for (; i < len; ++i)
                node.val.push(args.nodes[i]);
            node.val.preserve = true;
            node.val.isList = args.isList;
        } else {
            var arg = args.map[node.name] || args.nodes[i++];
            node = node.clone();
            if (arg) {
                arg.isEmpty ? args.nodes[i - 1] = this.visit(node) : node.val = arg;
            } else {
                args.push(node.val);
            }
            if (node.val.isNull) {
                throw new Error('argument "' + node + '" required for ' + fn);
            }
        }
        scope.add(node);
    }, this);
    if (content)
        scope.add(new nodes.Ident('block', content, true));
    return this.invoke(body, true, fn.filename);
};
Evaluator.prototype.invokeBuiltin = function (fn, args) {
    if (fn.raw) {
        args = args.nodes;
    } else {
        if (!fn.params) {
            fn.params = utils.params(fn);
        }
        args = fn.params.reduce(function (ret, param) {
            var arg = args.map[param] || args.nodes.shift();
            if (arg) {
                arg = utils.unwrap(arg);
                var len = arg.nodes.length;
                if (len > 1) {
                    for (var i = 0; i < len; ++i) {
                        ret.push(utils.unwrap(arg.nodes[i].first));
                    }
                } else {
                    ret.push(arg.first);
                }
            }
            return ret;
        }, []);
    }
    var body = utils.coerce(fn.apply(this, args));
    var expr = new nodes.Expression();
    expr.push(body);
    body = expr;
    return this.invoke(body);
};
Evaluator.prototype.invoke = function (body, stack, filename) {
    var self = this, ret;
    if (filename)
        this.paths.push(dirname(filename));
    if (this.return) {
        ret = this.eval(body.nodes);
        if (stack)
            this.stack.pop();
    } else {
        body = this.visit(body);
        if (stack)
            this.stack.pop();
        this.mixin(body.nodes, this.currentBlock);
        ret = nodes.null;
    }
    if (filename)
        this.paths.pop();
    return ret;
};
Evaluator.prototype.mixin = function (nodes, block) {
    if (!nodes.length)
        return;
    var len = block.nodes.length, head = block.nodes.slice(0, block.index), tail = block.nodes.slice(block.index + 1, len);
    this._mixin(nodes, head, block);
    block.index = 0;
    block.nodes = head.concat(tail);
};
Evaluator.prototype._mixin = function (items, dest, block) {
    var node, len = items.length;
    for (var i = 0; i < len; ++i) {
        switch ((node = items[i]).nodeName) {
        case 'return':
            return;
        case 'block':
            this._mixin(node.nodes, dest, block);
            break;
        case 'media':
            var parentNode = node.block.parent.node;
            if (parentNode && 'call' != parentNode.nodeName) {
                node.block.parent = block;
            }
        case 'property':
            var val = node.expr;
            if (node.literal && 'block' == val.first.name) {
                val = utils.unwrap(val);
                val.nodes[0] = new nodes.Literal('block');
            }
        default:
            dest.push(node);
        }
    }
};
Evaluator.prototype.mixinNode = function (node) {
    node = this.visit(node.first);
    switch (node.nodeName) {
    case 'object':
        this.mixinObject(node);
        return nodes.null;
    case 'block':
    case 'atblock':
        this.mixin(node.nodes, this.currentBlock);
        return nodes.null;
    }
};
Evaluator.prototype.mixinObject = function (object) {
    var Parser = _$parser_137({}), root = this.root, str = '$block ' + object.toBlock(), parser = new Parser(str, utils.merge({ root: block }, this.options)), block;
    try {
        block = parser.parse();
    } catch (err) {
        err.filename = this.filename;
        err.lineno = parser.lexer.lineno;
        err.column = parser.lexer.column;
        err.input = str;
        throw err;
    }
    block.parent = root;
    block.scope = false;
    var ret = this.visit(block), vals = ret.first.nodes;
    for (var i = 0, len = vals.length; i < len; ++i) {
        if (vals[i].block) {
            this.mixin(vals[i].block.nodes, this.currentBlock);
            break;
        }
    }
};
Evaluator.prototype.eval = function (vals) {
    if (!vals)
        return nodes.null;
    var len = vals.length, node = nodes.null;
    try {
        for (var i = 0; i < len; ++i) {
            node = vals[i];
            switch (node.nodeName) {
            case 'if':
                if ('block' != node.block.nodeName) {
                    node = this.visit(node);
                    break;
                }
            case 'each':
            case 'block':
                node = this.visit(node);
                if (node.nodes)
                    node = this.eval(node.nodes);
                break;
            default:
                node = this.visit(node);
            }
        }
    } catch (err) {
        if ('return' == err.nodeName) {
            return err.expr;
        } else {
            throw err;
        }
    }
    return node;
};
Evaluator.prototype.literalCall = function (call) {
    call.args = this.visit(call.args);
    return call;
};
Evaluator.prototype.lookupProperty = function (name) {
    var i = this.stack.length, index = this.currentBlock.index, top = i, nodes, block, len, other;
    while (i--) {
        block = this.stack[i].block;
        if (!block.node)
            continue;
        switch (block.node.nodeName) {
        case 'group':
        case 'function':
        case 'if':
        case 'each':
        case 'atrule':
        case 'media':
        case 'atblock':
        case 'call':
            nodes = block.nodes;
            if (i + 1 == top) {
                while (index--) {
                    if (this.property == nodes[index])
                        continue;
                    other = this.interpolate(nodes[index]);
                    if (name == other)
                        return nodes[index].clone();
                }
            } else {
                len = nodes.length;
                while (len--) {
                    if ('property' != nodes[len].nodeName || this.property == nodes[len])
                        continue;
                    other = this.interpolate(nodes[len]);
                    if (name == other)
                        return nodes[len].clone();
                }
            }
            break;
        }
    }
    return nodes.null;
};
Evaluator.prototype.__defineGetter__('closestBlock', function () {
    var i = this.stack.length, block;
    while (i--) {
        block = this.stack[i].block;
        if (block.node) {
            switch (block.node.nodeName) {
            case 'group':
            case 'keyframes':
            case 'atrule':
            case 'atblock':
            case 'media':
            case 'call':
                return block;
            }
        }
    }
});
Evaluator.prototype.__defineGetter__('closestGroup', function () {
    var i = this.stack.length, block;
    while (i--) {
        block = this.stack[i].block;
        if (block.node && 'group' == block.node.nodeName) {
            return block;
        }
    }
});
Evaluator.prototype.__defineGetter__('selectorStack', function () {
    var block, stack = [];
    for (var i = 0, len = this.stack.length; i < len; ++i) {
        block = this.stack[i].block;
        if (block.node && 'group' == block.node.nodeName) {
            block.node.nodes.forEach(function (selector) {
                if (!selector.val)
                    selector.val = this.interpolate(selector);
            }, this);
            stack.push(block.node.nodes);
        }
    }
    return stack;
});
Evaluator.prototype.lookup = function (name) {
    var val;
    if (this.ignoreColors && name in _$colors_21)
        return;
    if (val = this.stack.lookup(name)) {
        return utils.unwrap(val);
    } else {
        return this.lookupFunction(name);
    }
};
Evaluator.prototype.interpolate = function (node) {
    var self = this, isSelector = 'selector' == node.nodeName;
    function toString(node) {
        switch (node.nodeName) {
        case 'function':
        case 'ident':
            return node.name;
        case 'literal':
        case 'string':
            if (self.prefix && !node.prefixed && !node.val.nodeName) {
                node.val = node.val.replace(/\.(?=[\w-])|^\.$/g, '.' + self.prefix);
                node.prefixed = true;
            }
            return node.val;
        case 'unit':
            return '%' == node.type ? node.val + '%' : node.val;
        case 'member':
            return toString(self.visit(node));
        case 'expression':
            if (self.calling && ~self.calling.indexOf('selector') && self._selector)
                return self._selector;
            self.return++;
            var ret = toString(self.visit(node).first);
            self.return--;
            if (isSelector)
                self._selector = ret;
            return ret;
        }
    }
    if (node.segments) {
        return node.segments.map(toString).join('');
    } else {
        return toString(node);
    }
};
Evaluator.prototype.lookupFunction = function (name) {
    var fn = this.functions[name] || bifs[name];
    if (fn)
        return new nodes.Function(name, fn);
};
Evaluator.prototype.isDefined = function (node) {
    if ('ident' == node.nodeName) {
        return nodes.Boolean(this.lookup(node.name));
    } else {
        throw new Error('invalid "is defined" check on non-variable ' + node);
    }
};
Evaluator.prototype.propertyExpression = function (prop, name) {
    var expr = new nodes.Expression(), val = prop.expr.clone();
    expr.push(new nodes.String(prop.name));
    function replace(node) {
        if ('call' == node.nodeName && name == node.name) {
            return new nodes.Literal('__CALL__');
        }
        if (node.nodes)
            node.nodes = node.nodes.map(replace);
        return node;
    }
    replace(val);
    expr.push(val);
    return expr;
};
Evaluator.prototype.cast = function (expr) {
    return new nodes.Unit(expr.first.val, expr.nodes[1].name);
};
Evaluator.prototype.castable = function (expr) {
    return 2 == expr.nodes.length && 'unit' == expr.first.nodeName && ~_$units_145.indexOf(expr.nodes[1].name);
};
Evaluator.prototype.warn = function (msg) {
    if (!this.warnings)
        return;
    console.warn('\x1B[33mWarning:\x1B[0m ' + msg);
};
Evaluator.prototype.__defineGetter__('currentBlock', function () {
    return this.stack.currentFrame.block;
});
Evaluator.prototype.__defineGetter__('vendors', function () {
    return this.lookup('vendors').nodes.map(function (node) {
        return node.string;
    });
});
Evaluator.prototype.unvendorize = function (prop) {
    for (var i = 0, len = this.vendors.length; i < len; i++) {
        if ('official' != this.vendors[i]) {
            var vendor = '-' + this.vendors[i] + '-';
            if (~prop.indexOf(vendor))
                return prop.replace(vendor, '');
        }
    }
    return prop;
};
Evaluator.prototype.__defineGetter__('currentScope', function () {
    return this.stack.currentFrame.scope;
});
Evaluator.prototype.__defineGetter__('currentFrame', function () {
    return this.stack.currentFrame;
});
});
var _$url_91 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - plugin - url
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Compiler = _$compiler_147({})
  , events = _$renderer_138({}).events
  , nodes = _$nodes_115({})
  , parse = _$url_164.parse
  , extname = _$pathBrowserify_14.extname
  , utils = _$utils_146({})
  , fs = require("fs");

/**
 * Mime table.
 */

var defaultMimes = {
    '.gif': 'image/gif'
  , '.png': 'image/png'
  , '.jpg': 'image/jpeg'
  , '.jpeg': 'image/jpeg'
  , '.svg': 'image/svg+xml'
  , '.webp': 'image/webp'
  , '.ttf': 'application/x-font-ttf'
  , '.eot': 'application/vnd.ms-fontobject'
  , '.woff': 'application/font-woff'
  , '.woff2': 'application/font-woff2'
};

/**
 * Supported encoding types
 */
var encodingTypes = {
  BASE_64: 'base64',
  UTF8: 'charset=utf-8'
}

/**
 * Return a url() function with the given `options`.
 *
 * Options:
 *
 *    - `limit` bytesize limit defaulting to 30Kb
 *    - `paths` image resolution path(s), merged with general lookup paths
 *
 * Examples:
 *
 *    stylus(str)
 *      .set('filename', __dirname + '/css/test.styl')
 *      .define('url', stylus.url({ paths: [__dirname + '/public'] }))
 *      .render(function(err, css) { ... })
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function(options) {
  options = options || {};

  var _paths = options.paths || [];
  var sizeLimit = null != options.limit ? options.limit : 30000;
  var mimes = options.mimes || defaultMimes;

  /**
   * @param {object} url - The path to the image you want to encode.
   * @param {object} enc - The encoding for the image. Defaults to base64, the 
   * other valid option is `utf8`.
   */
  function fn(url, enc) {
    // Compile the url
    var compiler = new Compiler(url)
      , encoding = encodingTypes.BASE_64;

    compiler.isURL = true;
    url = url.nodes.map(function(node) {
      return compiler.visit(node);
    }).join('');

    // Parse literal
    url = parse(url);
    var ext = extname(url.pathname || '')
      , mime = mimes[ext]
      , hash = url.hash || ''
      , literal = new nodes.Literal('url("' + url.href + '")')
      , paths = _paths.concat(this.paths)
      , buf
      , result;

    // Not supported
    if(!mime) return literal;

    // Absolute
    if(url.protocol) return literal;

    // Lookup
    var found = utils.lookup(url.pathname, paths);

    // Failed to lookup
    if(!found) {
      events.emit(
          'file not found'
        , 'File ' + literal + ' could not be found, literal url retained!'
      );

      return literal;
    }

    // Read data
    buf = fs.readFileSync(found);

    // Too large
    if(false !== sizeLimit && buf.length > sizeLimit) return literal;

    if(enc && 'utf8' == enc.first.val.toLowerCase()) {
      encoding = encodingTypes.UTF8;
      result = buf.toString().replace(/\s+/g, ' ')
        .replace(/[{}\|\\\^~\[\]`"<>#%]/g, function(match) {
          return '%' + match[0].charCodeAt(0).toString(16).toUpperCase();
        }).trim();
    } else {
      result = buf.toString(encoding) + hash;
    }

    // Encode
    return new nodes.Literal('url("data:' + mime + ';' +  encoding + ',' + result + '")');
  };

  fn.raw = true;
  return fn;
};

// Exporting default mimes so we could easily access them
module.exports.mimes = defaultMimes;


});
var _$functions_50 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Evaluator - built-in functions
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

exports['add-property'] = _$addProperty_25({});
exports.adjust = _$adjust_26({});
exports.alpha = _$alpha_27({});
exports['base-convert'] = _$baseConvert_30({});
exports.basename = _$basename_31({});
exports.blend = _$blend_32({});
exports.blue = _$blue_33({});
exports.clone = _$clone_34({});
exports.component = _$component_35({});
exports.contrast = _$contrast_36({});
exports.convert = _$convert_38({});
exports['current-media'] = _$currentMedia_39({});
exports.define = _$define_40({});
exports.dirname = _$dirname_41({});
exports.error = _$error_42({});
exports.extname = _$extname_43({});
exports.green = _$green_44({});
exports.hsl = _$hsl_45({});
exports.hsla = _$hsla_46({});
exports.hue = _$hue_47({});
exports['image-size'] = _$imageSize_48({});
exports.json = _$json_51({});
exports.length = _$length_52({});
exports.lightness = _$lightness_53({});
exports['list-separator'] = _$listSeparator_54({});
exports.lookup = _$lookup_55({});
exports.luminosity = _$luminosity_56({});
exports.match = _$match_57({});
exports.math = _$math_59({});
exports.merge = exports.extend = _$merge_60({});
exports.operate = _$operate_61({});
exports['opposite-position'] = _$oppositePosition_62({});
exports.p = _$p_63({});
exports.pathjoin = _$pathjoin_64;
exports.pop = _$pop_65({});
exports.push = exports.append = _$push_67({});
exports.range = _$range_68({});
exports.red = _$red_69({});
exports.remove = _$remove_70({});
exports.replace = _$replace_71({});
exports.rgb = _$rgb_73({});
exports.atan = _$atan_29({});
exports.asin = _$atan_28({});
exports.acos = _$acos_24({});
exports.rgba = _$rgba_74({});
exports.s = _$s_75({});
exports.saturation = _$saturation_76({});
exports['selector-exists'] = _$selectorExists_77({});
exports.selector = _$selector_78({});
exports.selectors = _$selectors_79({});
exports.shift = _$shift_80({});
exports.split = _$split_82({});
exports.substr = _$substr_83({});
exports.slice = _$slice_81({});
exports.tan = _$tan_84({});
exports.trace = _$trace_85({});
exports.transparentify = _$transparentify_86({});
exports.type = exports.typeof = exports['type-of'] = _$type_87({});
exports.unit = _$unit_88({});
exports.unquote = _$unquote_89({});
exports.unshift = exports.prepend = _$unshift_90({});
exports.use = _$use_92({});
exports.warn = _$warn_93({});
exports['-math-prop'] = _$math_58({});
exports['-prefix-classes'] = _$prefixClasses_66({});

});
var _$prefixClasses_66 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});
function prefixClasses(prefix, block) {
    utils.assertString(prefix, 'prefix');
    utils.assertType(block, 'block', 'block');
    var _prefix = this.prefix;
    this.options.prefix = this.prefix = prefix.string;
    block = this.visit(block);
    this.options.prefix = this.prefix = _prefix;
    return block;
}
prefixClasses.params = [
    'prefix',
    'block'
];
module.exports = prefixClasses;
});
var _$math_58 = createModuleFactory(function (module, exports) {
var nodes = _$nodes_115({});

/**
 * Get Math `prop`.
 *
 * @param {String} prop
 * @return {Unit}
 * @api private
 */

function math(prop){
  return new nodes.Unit(Math[prop.string]);
}
math.params = ['prop'];
module.exports = math;

});
var _$warn_93 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
function warn(msg) {
    utils.assertType(msg, 'string', 'msg');
    console.warn('Warning: %s', msg.val);
    return nodes.null;
}
warn.params = ['msg'];
module.exports = warn;
});
var _$use_92 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});
function use(plugin, options) {
    utils.assertString(plugin, 'plugin');
    if (options) {
        utils.assertType(options, 'object', 'options');
        options = parseObject(options);
    }
    plugin = plugin.string;
    var found = utils.lookup(plugin, this.options.paths, this.options.filename);
    if (!found)
        throw new Error('failed to locate plugin file "' + plugin + '"');
    var fn = require(_$pathBrowserify_14.resolve(found));
    if ('function' != typeof fn) {
        throw new Error('plugin "' + plugin + '" does not export a function');
    }
    this.renderer.use(fn(options || this.options));
}
use.params = [
    'plugin',
    'options'
];
module.exports = use;
function parseObject(obj) {
    obj = obj.vals;
    for (var key in obj) {
        var nodes = obj[key].nodes[0].nodes;
        if (nodes && nodes.length) {
            obj[key] = [];
            for (var i = 0, len = nodes.length; i < len; ++i) {
                obj[key].push(convert(nodes[i]));
            }
        } else {
            obj[key] = convert(obj[key].first);
        }
    }
    return obj;
    function convert(node) {
        switch (node.nodeName) {
        case 'object':
            return parseObject(node);
        case 'boolean':
            return node.isTrue;
        case 'unit':
            return node.type ? node.toString() : +node.val;
        case 'string':
        case 'literal':
            return node.val;
        default:
            return node.toString();
        }
    }
}
});
var _$unshift_90 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});

/**
 * Unshift the given args to `expr`.
 *
 * @param {Expression} expr
 * @param {Node} ...
 * @return {Unit}
 * @api public
 */

(module.exports = function(expr){
  expr = utils.unwrap(expr);
  for (var i = 1, len = arguments.length; i < len; ++i) {
    expr.nodes.unshift(utils.unwrap(arguments[i]));
  }
  return expr.nodes.length;
}).raw = true;

});
var _$unquote_89 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
function unquote(string) {
    utils.assertString(string, 'string');
    return new nodes.Literal(string.string);
}
unquote.params = ['string'];
module.exports = unquote;
});
var _$unit_88 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
function unit(unit, type) {
    utils.assertType(unit, 'unit', 'unit');
    if (type) {
        utils.assertString(type, 'type');
        return new nodes.Unit(unit.val, type.string);
    } else {
        return unit.type || '';
    }
}
unit.params = [
    'unit',
    'type'
];
module.exports = unit;
});
var _$type_87 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});
function type(node) {
    utils.assertPresent(node, 'expression');
    return node.nodeName;
}
type.params = ['node'];
module.exports = type;
});
var _$transparentify_86 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
function transparentify(top, bottom, alpha) {
    utils.assertColor(top);
    top = top.rgba;
    bottom = bottom || new nodes.RGBA(255, 255, 255, 1);
    if (!alpha && bottom && !bottom.rgba) {
        alpha = bottom;
        bottom = new nodes.RGBA(255, 255, 255, 1);
    }
    utils.assertColor(bottom);
    bottom = bottom.rgba;
    var bestAlpha = [
        'r',
        'g',
        'b'
    ].map(function (channel) {
        return (top[channel] - bottom[channel]) / ((0 < top[channel] - bottom[channel] ? 255 : 0) - bottom[channel]);
    }).sort(function (a, b) {
        return b - a;
    })[0];
    if (alpha) {
        utils.assertType(alpha, 'unit', 'alpha');
        if ('%' == alpha.type) {
            bestAlpha = alpha.val / 100;
        } else if (!alpha.type) {
            bestAlpha = alpha = alpha.val;
        }
    }
    bestAlpha = Math.max(Math.min(bestAlpha, 1), 0);
    function processChannel(channel) {
        if (0 == bestAlpha) {
            return bottom[channel];
        } else {
            return bottom[channel] + (top[channel] - bottom[channel]) / bestAlpha;
        }
    }
    return new nodes.RGBA(processChannel('r'), processChannel('g'), processChannel('b'), Math.round(bestAlpha * 100) / 100);
}
transparentify.params = [
    'top',
    'bottom',
    'alpha'
];
module.exports = transparentify;
});
var _$trace_85 = createModuleFactory(function (module, exports) {
var nodes = _$nodes_115({});

/**
 * Output stack trace.
 *
 * @api public
 */

module.exports = function trace(){
  console.log(this.stack);
  return nodes.null;
};

});
var _$tan_84 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
function tan(angle) {
    utils.assertType(angle, 'unit', 'angle');
    var radians = angle.val;
    if (angle.type === 'deg') {
        radians *= Math.PI / 180;
    }
    var m = Math.pow(10, 9);
    var sin = Math.round(Math.sin(radians) * m) / m, cos = Math.round(Math.cos(radians) * m) / m, tan = Math.round(m * sin / cos) / m;
    return new nodes.Unit(tan, '');
}
tan.params = ['angle'];
module.exports = tan;
});
var _$slice_81 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}),
    nodes = _$nodes_115({});

/**
 * This is a helper function for the slice method
 *
 * @param {String|Ident} vals
 * @param {Unit} start [0]
 * @param {Unit} end [vals.length]
 * @return {String|Literal|Null}
 * @api public
*/
(module.exports = function slice(val, start, end) {
  start = start && start.nodes[0].val;
  end = end && end.nodes[0].val;

  val = utils.unwrap(val).nodes;

  if (val.length > 1) {
    return utils.coerce(val.slice(start, end), true);
  }

  var result = val[0].string.slice(start, end);

  return val[0] instanceof nodes.Ident
    ? new nodes.Ident(result)
    : new nodes.String(result);
}).raw = true;

});
var _$substr_83 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
function substr(val, start, length) {
    utils.assertString(val, 'val');
    utils.assertType(start, 'unit', 'start');
    length = length && length.val;
    var res = val.string.substr(start.val, length);
    return val instanceof nodes.Ident ? new nodes.Ident(res) : new nodes.String(res);
}
substr.params = [
    'val',
    'start',
    'length'
];
module.exports = substr;
});
var _$split_82 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
function split(delim, val) {
    utils.assertString(delim, 'delimiter');
    utils.assertString(val, 'val');
    var splitted = val.string.split(delim.string);
    var expr = new nodes.Expression();
    var ItemNode = val instanceof nodes.Ident ? nodes.Ident : nodes.String;
    for (var i = 0, len = splitted.length; i < len; ++i) {
        expr.nodes.push(new ItemNode(splitted[i]));
    }
    return expr;
}
split.params = [
    'delim',
    'val'
];
module.exports = split;
});
var _$shift_80 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});

/**
 * Shift an element from `expr`.
 *
 * @param {Expression} expr
 * @return {Node}
 * @api public
 */

 (module.exports = function(expr){
   expr = utils.unwrap(expr);
   return expr.nodes.shift();
 }).raw = true;


});
var _$selectors_79 = createModuleFactory(function (module, exports) {
var nodes = _$nodes_115({})
  , Parser = _$selectorParser_139({});

/**
 * Return a list with raw selectors parts
 * of the current group.
 *
 * For example:
 *
 *    .a, .b
 *      .c
 *        .d
 *          test: selectors() // => '.a,.b', '& .c', '& .d'
 *
 * @return {Expression}
 * @api public
 */

module.exports = function selectors(){
  var stack = this.selectorStack
    , expr = new nodes.Expression(true);

  if (stack.length) {
    for (var i = 0; i < stack.length; i++) {
      var group = stack[i]
        , nested;

      if (group.length > 1) {
        expr.push(new nodes.String(group.map(function(selector) {
          nested = new Parser(selector.val).parse().nested;
          return (nested && i ? '& ' : '') + selector.val;
        }).join(',')))
      } else {
        var selector = group[0].val
        nested = new Parser(selector).parse().nested;
        expr.push(new nodes.String((nested && i ? '& ' : '') + selector));
      }
    }
  } else {
    expr.push(new nodes.String('&'));
  }
  return expr;
};

});
var _$selector_78 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});
(module.exports = function selector() {
    var stack = this.selectorStack, args = [].slice.call(arguments);
    if (1 == args.length) {
        var expr = utils.unwrap(args[0]), len = expr.nodes.length;
        if (1 == len) {
            utils.assertString(expr.first, 'selector');
            var SelectorParser = _$selectorParser_139({}), val = expr.first.string, parsed = new SelectorParser(val).parse().val;
            if (parsed == val)
                return val;
            stack.push(parse(val));
        } else if (len > 1) {
            if (expr.isList) {
                pushToStack(expr.nodes, stack);
            } else {
                stack.push(parse(expr.nodes.map(function (node) {
                    utils.assertString(node, 'selector');
                    return node.string;
                }).join(' ')));
            }
        }
    } else if (args.length > 1) {
        pushToStack(args, stack);
    }
    return stack.length ? utils.compileSelectors(stack).join(',') : '&';
}).raw = true;
function pushToStack(selectors, stack) {
    selectors.forEach(function (sel) {
        sel = sel.first;
        utils.assertString(sel, 'selector');
        stack.push(parse(sel.string));
    });
}
function parse(selector) {
    var Parser = new require('../parser'), parser = new Parser(selector), nodes;
    parser.state.push('selector-parts');
    nodes = parser.selector();
    nodes.forEach(function (node) {
        node.val = node.segments.map(function (seg) {
            return seg.toString();
        }).join('');
    });
    return nodes;
}
});
var _$selectorExists_77 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});
function selectorExists(sel) {
    utils.assertString(sel, 'selector');
    if (!this.__selectorsMap__) {
        var Normalizer = _$normalizer_151({}), visitor = new Normalizer(this.root.clone());
        visitor.visit(visitor.root);
        this.__selectorsMap__ = visitor.map;
    }
    return sel.string in this.__selectorsMap__;
}
selectorExists.params = ['sel'];
module.exports = selectorExists;
});
var _$normalizer_151 = createModuleFactory(function (module, exports) {

/*!
 * Stylus - Normalizer
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var nodes = _$nodes_115({})
  , utils = _$utils_146({});

/**
 * Initialize a new `Normalizer` with the given `root` Node.
 *
 * This visitor implements the first stage of the duel-stage
 * compiler, tasked with stripping the "garbage" from
 * the evaluated nodes, ditching null rules, resolving
 * ruleset selectors etc. This step performs the logic
 * necessary to facilitate the "@extend" functionality,
 * as these must be resolved _before_ buffering output.
 *
 * @param {Node} root
 * @api public
 */

var Normalizer = module.exports = function Normalizer(root, options) {
  options = options || {};
  _$visitor_150.call(this, root);
  this.hoist = options['hoist atrules'];
  this.stack = [];
  this.map = {};
  this.imports = [];
};

/**
 * Inherit from `Visitor.prototype`.
 */

Normalizer.prototype.__proto__ = _$visitor_150.prototype;

/**
 * Normalize the node tree.
 *
 * @return {Node}
 * @api private
 */

Normalizer.prototype.normalize = function(){
  var ret = this.visit(this.root);

  if (this.hoist) {
    // hoist @import
    if (this.imports.length) ret.nodes = this.imports.concat(ret.nodes);

    // hoist @charset
    if (this.charset) ret.nodes = [this.charset].concat(ret.nodes);
  }

  return ret;
};

/**
 * Bubble up the given `node`.
 *
 * @param {Node} node
 * @api private
 */

Normalizer.prototype.bubble = function(node){
  var props = []
    , other = []
    , self = this;

  function filterProps(block) {
    block.nodes.forEach(function(node) {
      node = self.visit(node);

      switch (node.nodeName) {
        case 'property':
          props.push(node);
          break;
        case 'block':
          filterProps(node);
          break;
        default:
          other.push(node);
      }
    });
  }

  filterProps(node.block);

  if (props.length) {
    var selector = new nodes.Selector([new nodes.Literal('&')]);
    selector.lineno = node.lineno;
    selector.column = node.column;
    selector.filename = node.filename;
    selector.val = '&';

    var group = new nodes.Group;
    group.lineno = node.lineno;
    group.column = node.column;
    group.filename = node.filename;

    var block = new nodes.Block(node.block, group);
    block.lineno = node.lineno;
    block.column = node.column;
    block.filename = node.filename;

    props.forEach(function(prop){
      block.push(prop);
    });

    group.push(selector);
    group.block = block;

    node.block.nodes = [];
    node.block.push(group);
    other.forEach(function(n){
      node.block.push(n);
    });

    var group = this.closestGroup(node.block);
    if (group) node.group = group.clone();

    node.bubbled = true;
  }
};

/**
 * Return group closest to the given `block`.
 *
 * @param {Block} block
 * @return {Group}
 * @api private
 */

Normalizer.prototype.closestGroup = function(block){
  var parent = block.parent
    , node;
  while (parent && (node = parent.node)) {
    if ('group' == node.nodeName) return node;
    parent = node.block && node.block.parent;
  }
};

/**
 * Visit Root.
 */

Normalizer.prototype.visitRoot = function(block){
  var ret = new nodes.Root
    , node;

  for (var i = 0; i < block.nodes.length; ++i) {
    node = block.nodes[i];
    switch (node.nodeName) {
      case 'null':
      case 'expression':
      case 'function':
      case 'unit':
      case 'atblock':
        continue;
      default:
        this.rootIndex = i;
        ret.push(this.visit(node));
    }
  }

  return ret;
};

/**
 * Visit Property.
 */

Normalizer.prototype.visitProperty = function(prop){
  this.visit(prop.expr);
  return prop;
};

/**
 * Visit Expression.
 */

Normalizer.prototype.visitExpression = function(expr){
  expr.nodes = expr.nodes.map(function(node){
    // returns `block` literal if mixin's block
    // is used as part of a property value
    if ('block' == node.nodeName) {
      var literal = new nodes.Literal('block');
      literal.lineno = expr.lineno;
      literal.column = expr.column;
      return literal;
    }
    return node;
  });
  return expr;
};

/**
 * Visit Block.
 */

Normalizer.prototype.visitBlock = function(block){
  var node;

  if (block.hasProperties) {
    for (var i = 0, len = block.nodes.length; i < len; ++i) {
      node = block.nodes[i];
      switch (node.nodeName) {
        case 'null':
        case 'expression':
        case 'function':
        case 'group':
        case 'unit':
        case 'atblock':
          continue;
        default:
          block.nodes[i] = this.visit(node);
      }
    }
  }

  // nesting
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    node = block.nodes[i];
    block.nodes[i] = this.visit(node);
  }

  return block;
};

/**
 * Visit Group.
 */

Normalizer.prototype.visitGroup = function(group){
  var stack = this.stack
    , map = this.map
    , parts;

  // normalize interpolated selectors with comma
  group.nodes.forEach(function(selector, i){
    if (!~selector.val.indexOf(',')) return;
    if (~selector.val.indexOf('\\,')) {
      selector.val = selector.val.replace(/\\,/g, ',');
      return;
    }
    parts = selector.val.split(',');
    var root = '/' == selector.val.charAt(0)
      , part, s;
    for (var k = 0, len = parts.length; k < len; ++k){
      part = parts[k].trim();
      if (root && k > 0 && !~part.indexOf('&')) {
        part = '/' + part;
      }
      s = new nodes.Selector([new nodes.Literal(part)]);
      s.val = part;
      s.block = group.block;
      group.nodes[i++] = s;
    }
  });
  stack.push(group.nodes);

  var selectors = utils.compileSelectors(stack, true);

  // map for extension lookup
  selectors.forEach(function(selector){
    map[selector] = map[selector] || [];
    map[selector].push(group);
  });

  // extensions
  this.extend(group, selectors);

  stack.pop();
  return group;
};

/**
 * Visit Function.
 */

Normalizer.prototype.visitFunction = function(){
  return nodes.null;
};

/**
 * Visit Media.
 */

Normalizer.prototype.visitMedia = function(media){
  var medias = []
    , group = this.closestGroup(media.block)
    , parent;

  function mergeQueries(block) {
    block.nodes.forEach(function(node, i){
      switch (node.nodeName) {
        case 'media':
          node.val = media.val.merge(node.val);
          medias.push(node);
          block.nodes[i] = nodes.null;
          break;
        case 'block':
          mergeQueries(node);
          break;
        default:
          if (node.block && node.block.nodes)
            mergeQueries(node.block);
      }
    });
  }

  mergeQueries(media.block);
  this.bubble(media);

  if (medias.length) {
    medias.forEach(function(node){
      if (group) {
        group.block.push(node);
      } else {
        this.root.nodes.splice(++this.rootIndex, 0, node);
      }
      node = this.visit(node);
      parent = node.block.parent;
      if (node.bubbled && (!group || 'group' == parent.node.nodeName)) {
        node.group.block = node.block.nodes[0].block;
        node.block.nodes[0] = node.group;
      }
    }, this);
  }
  return media;
};

/**
 * Visit Supports.
 */

Normalizer.prototype.visitSupports = function(node){
  this.bubble(node);
  return node;
};

/**
 * Visit Atrule.
 */

Normalizer.prototype.visitAtrule = function(node){
  if (node.block) node.block = this.visit(node.block);
  return node;
};

/**
 * Visit Keyframes.
 */

Normalizer.prototype.visitKeyframes = function(node){
  var frames = node.block.nodes.filter(function(frame){
    return frame.block && frame.block.hasProperties;
  });
  node.frames = frames.length;
  return node;
};

/**
 * Visit Import.
 */

Normalizer.prototype.visitImport = function(node){
  this.imports.push(node);
  return this.hoist ? nodes.null : node;
};

/**
 * Visit Charset.
 */

Normalizer.prototype.visitCharset = function(node){
  this.charset = node;
  return this.hoist ? nodes.null : node;
};

/**
 * Apply `group` extensions.
 *
 * @param {Group} group
 * @param {Array} selectors
 * @api private
 */

Normalizer.prototype.extend = function(group, selectors){
  var map = this.map
    , self = this
    , parent = this.closestGroup(group.block);

  group.extends.forEach(function(extend){
    var groups = map[extend.selector];
    if (!groups) {
      if (extend.optional) return;
      groups = self._checkForPrefixedGroups(extend.selector);
      if(!groups) {
        var err = new Error('Failed to @extend "' + extend.selector + '"');
        err.lineno = extend.lineno;
        err.column = extend.column;
        throw err;
      }
    }
    selectors.forEach(function(selector){
      var node = new nodes.Selector;
      node.val = selector;
      node.inherits = false;
      groups.forEach(function(group){
        // prevent recursive extend
        if (!parent || (parent != group)) self.extend(group, selectors);
        group.push(node);
      });
    });
  });

  group.block = this.visit(group.block);
};

Normalizer.prototype._checkForPrefixedGroups = function (selector) {
  var prefix = [];
  var map = this.map;
  var result = null;
  for (var i = 0; i < this.stack.length; i++) {
    var stackElementArray=this.stack[i];
    var stackElement = stackElementArray[0];
    prefix.push(stackElement.val);
    var fullSelector = prefix.join(" ") + " " + selector;
    result = map[fullSelector];
    if (result)
      break;
  }
  return result;
};
});
var _$saturation_76 = createModuleFactory(function (module, exports) {
var nodes = _$nodes_115({})
  , hsla = _$hsla_46({})
  , component = _$component_35({});

/**
 * Return the saturation component of the given `color`,
 * or set the saturation component to the optional second `value` argument.
 *
 * Examples:
 *
 *    saturation(#00c)
 *    // => 100%
 *
 *    saturation(#00c, 50%)
 *    // => #339
 *
 * @param {RGBA|HSLA} color
 * @param {Unit} [value]
 * @return {Unit|RGBA}
 * @api public
 */

function saturation(color, value){
  if (value) {
    var hslaColor = color.hsla;
    return hsla(
      new nodes.Unit(hslaColor.h),
      value,
      new nodes.Unit(hslaColor.l),
      new nodes.Unit(hslaColor.a)
    )
  }
  return component(color, new nodes.String('saturation'));
}
saturation.params = ['color', 'value'];
module.exports = saturation;

});
var _$s_75 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({}), Compiler = _$compiler_147({});
(module.exports = function s(fmt) {
    fmt = utils.unwrap(fmt).nodes[0];
    utils.assertString(fmt);
    var self = this, str = fmt.string, args = arguments, i = 1;
    str = str.replace(/%(s|d)/g, function (_, specifier) {
        var arg = args[i++] || nodes.null;
        switch (specifier) {
        case 's':
            return new Compiler(arg, self.options).compile();
        case 'd':
            arg = utils.unwrap(arg).first;
            if ('unit' != arg.nodeName)
                throw new Error('%d requires a unit');
            return arg.val;
        }
    });
    return new nodes.Literal(str);
}).raw = true;
});
var _$compiler_147 = createModuleFactory(function (module, exports) {
/*!
 * Stylus - Compiler
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = _$utils_146({})
  , fs = require("fs");

/**
 * Initialize a new `Compiler` with the given `root` Node
 * and the following `options`.
 *
 * Options:
 *
 *   - `compress`  Compress the CSS output (default: false)
 *
 * @param {Node} root
 * @api public
 */

var Compiler = module.exports = function Compiler(root, options) {
  options = options || {};
  this.compress = options.compress;
  this.firebug = options.firebug;
  this.linenos = options.linenos;
  this.spaces = options['indent spaces'] || 2;
  this.indents = 1;
  _$visitor_150.call(this, root);
  this.stack = [];
};

/**
 * Inherit from `Visitor.prototype`.
 */

Compiler.prototype.__proto__ = _$visitor_150.prototype;

/**
 * Compile to css, and return a string of CSS.
 *
 * @return {String}
 * @api private
 */

Compiler.prototype.compile = function(){
  return this.visit(this.root);
};

/**
 * Output `str`
 *
 * @param {String} str
 * @param {Node} node
 * @return {String}
 * @api private
 */

Compiler.prototype.out = function(str, node){
  return str;
};

/**
 * Return indentation string.
 *
 * @return {String}
 * @api private
 */

Compiler.prototype.__defineGetter__('indent', function(){
  if (this.compress) return '';
  return new Array(this.indents).join(Array(this.spaces + 1).join(' '));
});

/**
 * Check if given `node` needs brackets.
 *
 * @param {Node} node
 * @return {Boolean}
 * @api private
 */

Compiler.prototype.needBrackets = function(node){
  return 1 == this.indents
    || 'atrule' != node.nodeName
    || node.hasOnlyProperties;
};

/**
 * Visit Root.
 */

Compiler.prototype.visitRoot = function(block){
  this.buf = '';
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    var node = block.nodes[i];
    if (this.linenos || this.firebug) this.debugInfo(node);
    var ret = this.visit(node);
    if (ret) this.buf += this.out(ret + '\n', node);
  }
  return this.buf;
};

/**
 * Visit Block.
 */

Compiler.prototype.visitBlock = function(block){
  var node
    , separator = this.compress ? '' : '\n'
    , needBrackets
    , lastPropertyIndex;

  if (block.hasProperties && !block.lacksRenderedSelectors) {
    needBrackets = this.needBrackets(block.node);

    if (this.compress) {
        for (var i = block.nodes.length - 1; i >= 0; --i) {
            if (block.nodes[i].nodeName === 'property') {
                lastPropertyIndex = i;
                break;
            }
        }
    }
    if (needBrackets) {
      this.buf += this.out(this.compress ? '{' : ' {\n');
      ++this.indents;
    }
    for (var i = 0, len = block.nodes.length; i < len; ++i) {
      this.last = lastPropertyIndex === i;
      node = block.nodes[i];
      switch (node.nodeName) {
        case 'null':
        case 'expression':
        case 'function':
        case 'group':
        case 'block':
        case 'unit':
        case 'media':
        case 'keyframes':
        case 'atrule':
        case 'supports':
          continue;
        // inline comments
        case !this.compress && node.inline && 'comment':
          this.buf = this.buf.slice(0, -1);
          this.buf += this.out(' ' + this.visit(node) + '\n', node);
          break;
        case 'property':
          var ret = this.visit(node) + separator;
          this.buf += this.compress ? ret : this.out(ret, node);
          break;
        default:
          this.buf += this.out(this.visit(node) + separator, node);
      }
    }
    if (needBrackets) {
      --this.indents;
      this.buf += this.out(this.indent + '}' + separator);
    }
  }

  // Nesting
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    node = block.nodes[i];
    switch (node.nodeName) {
      case 'group':
      case 'block':
      case 'keyframes':
        if (this.linenos || this.firebug) this.debugInfo(node);
        this.visit(node);
        break;
      case 'media':
      case 'import':
      case 'atrule':
      case 'supports':
        this.visit(node);
        break;
      case 'comment':
        // only show unsuppressed comments
        if (!node.suppress) {
          this.buf += this.out(this.indent + this.visit(node) + '\n', node);
        }
        break;
      case 'charset':
      case 'literal':
      case 'namespace':
        this.buf += this.out(this.visit(node) + '\n', node);
        break;
    }
  }
};

/**
 * Visit Keyframes.
 */

Compiler.prototype.visitKeyframes = function(node){
  if (!node.frames) return;

  var prefix = 'official' == node.prefix
    ? ''
    : '-' + node.prefix + '-';

  this.buf += this.out('@' + prefix + 'keyframes '
    + this.visit(node.val)
    + (this.compress ? '{' : ' {\n'), node);

  this.keyframe = true;
  ++this.indents;
  this.visit(node.block);
  --this.indents;
  this.keyframe = false;

  this.buf += this.out('}' + (this.compress ? '' : '\n'));
};

/**
 * Visit Media.
 */

Compiler.prototype.visitMedia = function(media){
  var val = media.val;
  if (!media.hasOutput || !val.nodes.length) return;

  this.buf += this.out('@media ', media);
  this.visit(val);
  this.buf += this.out(this.compress ? '{' : ' {\n');
  ++this.indents;
  this.visit(media.block);
  --this.indents;
  this.buf += this.out('}' + (this.compress ? '' : '\n'));
};

/**
 * Visit QueryList.
 */

Compiler.prototype.visitQueryList = function(queries){
  for (var i = 0, len = queries.nodes.length; i < len; ++i) {
    this.visit(queries.nodes[i]);
    if (len - 1 != i) this.buf += this.out(',' + (this.compress ? '' : ' '));
  }
};

/**
 * Visit Query.
 */

Compiler.prototype.visitQuery = function(node){
  var len = node.nodes.length;
  if (node.predicate) this.buf += this.out(node.predicate + ' ');
  if (node.type) this.buf += this.out(node.type + (len ? ' and ' : ''));
  for (var i = 0; i < len; ++i) {
    this.buf += this.out(this.visit(node.nodes[i]));
    if (len - 1 != i) this.buf += this.out(' and ');
  }
};

/**
 * Visit Feature.
 */

Compiler.prototype.visitFeature = function(node){
  if (!node.expr) {
    return node.name;
  } else if (node.expr.isEmpty) {
    return '(' + node.name + ')';
  } else {
    return '(' + node.name + ':' + (this.compress ? '' : ' ') + this.visit(node.expr) + ')';
  }
};

/**
 * Visit Import.
 */

Compiler.prototype.visitImport = function(imported){
  this.buf += this.out('@import ' + this.visit(imported.path) + ';\n', imported);
};

/**
 * Visit Atrule.
 */

Compiler.prototype.visitAtrule = function(atrule){
  var newline = this.compress ? '' : '\n';

  this.buf += this.out(this.indent + '@' + atrule.type, atrule);

  if (atrule.val) this.buf += this.out(' ' + atrule.val.trim());

  if (atrule.block) {
    if (atrule.block.isEmpty) {
      this.buf += this.out((this.compress ? '' : ' ') + '{}' + newline);
    } else if (atrule.hasOnlyProperties) {
      this.visit(atrule.block);
    } else {
      this.buf += this.out(this.compress ? '{' : ' {\n');
      ++this.indents;
      this.visit(atrule.block);
      --this.indents;
      this.buf += this.out(this.indent + '}' + newline);
    }
  } else {
    this.buf += this.out(';' + newline);
  }
};

/**
 * Visit Supports.
 */

Compiler.prototype.visitSupports = function(node){
  if (!node.hasOutput) return;

  this.buf += this.out(this.indent + '@supports ', node);
  this.isCondition = true;
  this.buf += this.out(this.visit(node.condition));
  this.isCondition = false;
  this.buf += this.out(this.compress ? '{' : ' {\n');
  ++this.indents;
  this.visit(node.block);
  --this.indents;
  this.buf += this.out(this.indent + '}' + (this.compress ? '' : '\n'));
},

/**
 * Visit Comment.
 */

Compiler.prototype.visitComment = function(comment){
  return this.compress
    ? comment.suppress
      ? ''
      : comment.str
    : comment.str;
};

/**
 * Visit Function.
 */

Compiler.prototype.visitFunction = function(fn){
  return fn.name;
};

/**
 * Visit Charset.
 */

Compiler.prototype.visitCharset = function(charset){
  return '@charset ' + this.visit(charset.val) + ';';
};

/**
 * Visit Namespace.
 */

Compiler.prototype.visitNamespace = function(namespace){
  return '@namespace '
    + (namespace.prefix ? this.visit(namespace.prefix) + ' ' : '')
    + this.visit(namespace.val) + ';';
};

/**
 * Visit Literal.
 */

Compiler.prototype.visitLiteral = function(lit){
  var val = lit.val;
  if (lit.css) val = val.replace(/^  /gm, '');
  return val;
};

/**
 * Visit Boolean.
 */

Compiler.prototype.visitBoolean = function(bool){
  return bool.toString();
};

/**
 * Visit RGBA.
 */

Compiler.prototype.visitRGBA = function(rgba){
  return rgba.toString();
};

/**
 * Visit HSLA.
 */

Compiler.prototype.visitHSLA = function(hsla){
  return hsla.rgba.toString();
};

/**
 * Visit Unit.
 */

Compiler.prototype.visitUnit = function(unit){
  var type = unit.type || ''
    , n = unit.val
    , float = n != (n | 0);

  // Compress
  if (this.compress) {
    // Always return '0' unless the unit is a percentage, time, degree or fraction
    if (!(['%', 's', 'ms', 'deg', 'fr'].includes(type)) && 0 == n) return '0';
    // Omit leading '0' on floats
    if (float && n < 1 && n > -1) {
      return n.toString().replace('0.', '.') + type;
    }
  }

  return (float ? parseFloat(n.toFixed(15)) : n).toString() + type;
};

/**
 * Visit Group.
 */

Compiler.prototype.visitGroup = function(group){
  var stack = this.keyframe ? [] : this.stack
    , comma = this.compress ? ',' : ',\n';

  stack.push(group.nodes);

  // selectors
  if (group.block.hasProperties) {
    var selectors = utils.compileSelectors.call(this, stack)
      , len = selectors.length;

    if (len) {
      if (this.keyframe) comma = this.compress ? ',' : ', ';

      for (var i = 0; i < len; ++i) {
        var selector = selectors[i]
          , last = (i == len - 1);

        // keyframe blocks (10%, 20% { ... })
        if (this.keyframe) selector = i ? selector.trim() : selector;

        this.buf += this.out(selector + (last ? '' : comma), group.nodes[i]);
      }
    } else {
      group.block.lacksRenderedSelectors = true;
    }
  }

  // output block
  this.visit(group.block);
  stack.pop();
};

/**
 * Visit Ident.
 */

Compiler.prototype.visitIdent = function(ident){
  return ident.name;
};

/**
 * Visit String.
 */

Compiler.prototype.visitString = function(string){
  return this.isURL
    ? string.val
    : string.toString();
};

/**
 * Visit Null.
 */

Compiler.prototype.visitNull = function(node){
  return '';
};

/**
 * Visit Call.
 */

Compiler.prototype.visitCall = function(call){
  this.isURL = 'url' == call.name;
  var args = call.args.nodes.map(function(arg){
    return this.visit(arg);
  }, this).join(this.compress ? ',' : ', ');
  if (this.isURL) args = '"' + args + '"';
  this.isURL = false;
  return call.name + '(' + args + ')';
};

/**
 * Visit Expression.
 */

Compiler.prototype.visitExpression = function(expr){
  var buf = []
    , self = this
    , len = expr.nodes.length
    , nodes = expr.nodes.map(function(node){ return self.visit(node); });

  nodes.forEach(function(node, i){
    var last = i == len - 1;
    buf.push(node);
    if ('/' == nodes[i + 1] || '/' == node) return;
    if (last) return;

    var space = self.isURL || (self.isCondition
        && (')' == nodes[i + 1] || '(' == node))
        ? '' : ' ';

    buf.push(expr.isList
      ? (self.compress ? ',' : ', ')
      : space);
  });

  return buf.join('');
};

/**
 * Visit Arguments.
 */

Compiler.prototype.visitArguments = Compiler.prototype.visitExpression;

/**
 * Visit Property.
 */

Compiler.prototype.visitProperty = function(prop){
  var val = this.visit(prop.expr).trim()
    , name = (prop.name || prop.segments.join(''))
    , arr = [];

  if (name === '@apply') {
    arr.push(
      this.out(this.indent),
      this.out(name + ' ', prop),
      this.out(val, prop.expr),
      this.out(this.compress ? (this.last ? '' : ';') : ';')
    );
    return arr.join('');
  }
  arr.push(
    this.out(this.indent),
    this.out(name + (this.compress ? ':' : ': '), prop),
    this.out(val, prop.expr),
    this.out(this.compress ? (this.last ? '' : ';') : ';')
  );
  return arr.join('');
};

/**
 * Debug info.
 */

Compiler.prototype.debugInfo = function(node){

  var path = node.filename == 'stdin' ? 'stdin' : fs.realpathSync(node.filename)
    , line = (node.nodes && node.nodes.length ? node.nodes[0].lineno : node.lineno) || 1;

  if (this.linenos){
    this.buf += '\n/* ' + 'line ' + line + ' : ' + path + ' */\n';
  }

  if (this.firebug){
    // debug info for firebug, the crazy formatting is needed
    path = 'file\\\:\\\/\\\/' + path.replace(/([.:/\\])/g, function(m) {
      return '\\' + (m === '\\' ? '\/' : m)
    });
    line = '\\00003' + line;
    this.buf += '\n@media -stylus-debug-info'
      + '{filename{font-family:' + path
      + '}line{font-family:' + line + '}}\n';
  }
}

});
var _$acos_24 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({})
  , nodes = _$nodes_115({})
	, asin    = _$atan_28({});

/**
 * Return the arccosine of the given `value`.
 *
 * @param {Double} trigValue
 * @param {Unit} output 
 * @return {Unit}
 * @api public
 */
module.exports = function acos(trigValue, output) {
	var output = typeof output !== 'undefined' ? output : 'deg';
	var convertedValue = _$convertAngle_37(Math.PI / 2, output) - asin(trigValue, output).val;
	var m = Math.pow(10, 9);
	convertedValue = Math.round(convertedValue * m) / m;
  return new nodes.Unit(convertedValue, output);
};

});
var _$atan_28 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({})
  , nodes = _$nodes_115({});

/**
 * Return the arcsine of the given `value`.
 *
 * @param {Double} trigValue
 * @param {Unit} output 
 * @return {Unit}
 * @api public
 */

module.exports = function atan(trigValue, output) {
	var output = typeof output !== 'undefined' ? output : 'deg';
  var m = Math.pow(10, 9);
	var value = Math.asin(trigValue) ;
	var convertedValue = _$convertAngle_37(value, output);
	convertedValue = Math.round(convertedValue * m) / m;
  return new nodes.Unit(convertedValue, output);
};

});
var _$atan_29 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({})
  , nodes = _$nodes_115({});

/**
 * Return the arctangent of the given `value`.
 *
 * @param {Double} trigValue
 * @param {Unit} output 
 * @return {Unit}
 * @api public
 */

module.exports = function atan(trigValue, output) {
	var output = typeof output !== 'undefined' ? output : 'deg';
	var value = Math.atan(trigValue) ;
	var m = Math.pow(10, 9);
	var convertedValue = _$convertAngle_37(value, output);
	convertedValue = Math.round(convertedValue * m) / m;
  return new nodes.Unit(convertedValue, output);
};

});
var _$rgb_73 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({}), rgba = _$rgba_74({});
function rgb(red, green, blue) {
    switch (arguments.length) {
    case 1:
        utils.assertColor(red);
        var color = red.rgba;
        return new nodes.RGBA(color.r, color.g, color.b, 1);
    default:
        return rgba(red, green, blue, new nodes.Unit(1));
    }
}
rgb.params = [
    'red',
    'green',
    'blue'
];
module.exports = rgb;
});
var _$replace_71 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
function replace(pattern, replacement, val) {
    utils.assertString(pattern, 'pattern');
    utils.assertString(replacement, 'replacement');
    utils.assertString(val, 'val');
    pattern = new RegExp(pattern.string, 'g');
    var res = val.string.replace(pattern, replacement.string);
    return val instanceof nodes.Ident ? new nodes.Ident(res) : new nodes.String(res);
}
replace.params = [
    'pattern',
    'replacement',
    'val'
];
module.exports = replace;
});
var _$remove_70 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});
function remove(object, key) {
    utils.assertType(object, 'object', 'object');
    utils.assertString(key, 'key');
    delete object.vals[key.string];
    return object;
}
remove.params = [
    'object',
    'key'
];
module.exports = remove;
});
var _$red_69 = createModuleFactory(function (module, exports) {
var nodes = _$nodes_115({})
  , rgba = _$rgba_74({});

/**
 * Return the red component of the given `color`,
 * or set the red component to the optional second `value` argument.
 *
 * Examples:
 *
 *    red(#c00)
 *    // => 204
 *
 *    red(#000, 255)
 *    // => #f00
 *
 * @param {RGBA|HSLA} color
 * @param {Unit} [value]
 * @return {Unit|RGBA}
 * @api public
 */

function red(color, value){
  color = color.rgba;
  if (value) {
    return rgba(
      value,
      new nodes.Unit(color.g),
      new nodes.Unit(color.b),
      new nodes.Unit(color.a)
    );
  }
  return new nodes.Unit(color.r, '');
}
red.params = ['color', 'value'];
module.exports = red;

});
var _$range_68 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
function range(start, stop, step) {
    utils.assertType(start, 'unit', 'start');
    utils.assertType(stop, 'unit', 'stop');
    if (step) {
        utils.assertType(step, 'unit', 'step');
        if (0 == step.val) {
            throw new Error('ArgumentError: "step" argument must not be zero');
        }
    } else {
        step = new nodes.Unit(1);
    }
    var list = new nodes.Expression();
    for (var i = start.val; i <= stop.val; i += step.val) {
        list.push(new nodes.Unit(i, start.type));
    }
    return list;
}
range.params = [
    'start',
    'stop',
    'step'
];
module.exports = range;
});
var _$push_67 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});

/**
 * Push the given args to `expr`.
 *
 * @param {Expression} expr
 * @param {Node} ...
 * @return {Unit}
 * @api public
 */

(module.exports = function(expr){
  expr = utils.unwrap(expr);
  for (var i = 1, len = arguments.length; i < len; ++i) {
    expr.nodes.push(utils.unwrap(arguments[i]).clone());
  }
  return expr.nodes.length;
}).raw = true;

});
var _$pop_65 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});

/**
 * Pop a value from `expr`.
 *
 * @param {Expression} expr
 * @return {Node}
 * @api public
 */

(module.exports = function pop(expr) {
  expr = utils.unwrap(expr);
  return expr.nodes.pop();
}).raw = true;

});
var _$p_63 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({})
  , nodes = _$nodes_115({});

/**
 * Inspect the given `expr`.
 *
 * @param {Expression} expr
 * @api public
 */

(module.exports = function p(){
  [].slice.call(arguments).forEach(function(expr){
    expr = utils.unwrap(expr);
    if (!expr.nodes.length) return;
    console.log('\u001b[90minspect:\u001b[0m %s', expr.toString().replace(/^\(|\)$/g, ''));
  })
  return nodes.null;
}).raw = true;

});
var _$oppositePosition_62 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
(module.exports = function oppositePosition(positions) {
    var expr = [];
    utils.unwrap(positions).nodes.forEach(function (pos, i) {
        utils.assertString(pos, 'position ' + i);
        pos = function () {
            switch (pos.string) {
            case 'top':
                return 'bottom';
            case 'bottom':
                return 'top';
            case 'left':
                return 'right';
            case 'right':
                return 'left';
            case 'center':
                return 'center';
            default:
                throw new Error('invalid position ' + pos);
            }
        }();
        expr.push(new nodes.Literal(pos));
    });
    return expr;
}).raw = true;
});
var _$operate_61 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});
function operate(op, left, right) {
    utils.assertType(op, 'string', 'op');
    utils.assertPresent(left, 'left');
    utils.assertPresent(right, 'right');
    return left.operate(op.val, right);
}
operate.params = [
    'op',
    'left',
    'right'
];
module.exports = operate;
});
var _$merge_60 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});
(module.exports = function merge(dest) {
    utils.assertPresent(dest, 'dest');
    dest = utils.unwrap(dest).first;
    utils.assertType(dest, 'object', 'dest');
    var last = utils.unwrap(arguments[arguments.length - 1]).first, deep = true === last.val;
    for (var i = 1, len = arguments.length - deep; i < len; ++i) {
        utils.merge(dest.vals, utils.unwrap(arguments[i]).first.vals, deep);
    }
    return dest;
}).raw = true;
});
var _$math_59 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
function math(n, fn) {
    utils.assertType(n, 'unit', 'n');
    utils.assertString(fn, 'fn');
    return new nodes.Unit(Math[fn.string](n.val), n.type);
}
math.params = [
    'n',
    'fn'
];
module.exports = math;
});
var _$match_57 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
var VALID_FLAGS = 'igm';
function match(pattern, val, flags) {
    utils.assertType(pattern, 'string', 'pattern');
    utils.assertString(val, 'val');
    var re = new RegExp(pattern.val, validateFlags(flags) ? flags.string : '');
    return val.string.match(re);
}
match.params = [
    'pattern',
    'val',
    'flags'
];
module.exports = match;
function validateFlags(flags) {
    flags = flags && flags.string;
    if (flags) {
        return flags.split('').every(function (flag) {
            return ~VALID_FLAGS.indexOf(flag);
        });
    }
    return false;
}
});
var _$lookup_55 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
function lookup(name) {
    utils.assertType(name, 'string', 'name');
    var node = this.lookup(name.val);
    if (!node)
        return nodes.null;
    return this.visit(node);
}
lookup.params = ['name'];
module.exports = lookup;
});
var _$listSeparator_54 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({})
  , nodes = _$nodes_115({});

/**
 * Return the separator of the given `list`.
 *
 * Examples:
 *
 *    list1 = a b c
 *    list-separator(list1)
 *    // => ' '
 *
 *    list2 = a, b, c
 *    list-separator(list2)
 *    // => ','
 *
 * @param {Experssion} list
 * @return {String}
 * @api public
 */

(module.exports = function listSeparator(list){
  list = utils.unwrap(list);
  return new nodes.String(list.isList ? ',' : ' ');
}).raw = true;

});
var _$lightness_53 = createModuleFactory(function (module, exports) {
var nodes = _$nodes_115({})
  , hsla = _$hsla_46({})
  , component = _$component_35({});

/**
 * Return the lightness component of the given `color`,
 * or set the lightness component to the optional second `value` argument.
 *
 * Examples:
 *
 *    lightness(#00c)
 *    // => 100%
 *
 *    lightness(#00c, 80%)
 *    // => #99f
 *
 * @param {RGBA|HSLA} color
 * @param {Unit} [value]
 * @return {Unit|RGBA}
 * @api public
 */

function lightness(color, value){
  if (value) {
    var hslaColor = color.hsla;
    return hsla(
      new nodes.Unit(hslaColor.h),
      new nodes.Unit(hslaColor.s),
      value,
      new nodes.Unit(hslaColor.a)
    )
  }
  return component(color, new nodes.String('lightness'));
};
lightness.params = ['color', 'value'];
module.exports = lightness;

});
var _$length_52 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});

/**
 * Return length of the given `expr`.
 *
 * @param {Expression} expr
 * @return {Unit}
 * @api public
 */

(module.exports = function length(expr){
  if (expr) {
    if (expr.nodes) {
      var nodes = utils.unwrap(expr).nodes;
      if (1 == nodes.length && 'object' == nodes[0].nodeName) {
        return nodes[0].length;
      } else if (1 == nodes.length && 'string' == nodes[0].nodeName) {
        return nodes[0].val.length;
      } else {
        return nodes.length;
      }
    } else {
      return 1;
    }
  }
  return 0;
}).raw = true;

});
var _$json_51 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({}), readFile = require("fs").readFileSync;
function json(path, local, namePrefix) {
    utils.assertString(path, 'path');
    path = path.string;
    var found = utils.lookup(path, this.options.paths, this.options.filename), options = local && 'object' == local.nodeName && local;
    if (!found) {
        if (options && options.get('optional').toBoolean().isTrue) {
            return nodes.null;
        }
        throw new Error('failed to locate .json file ' + path);
    }
    var json = JSON.parse(readFile(found, 'utf8'));
    if (options) {
        return convert(json, options);
    } else {
        oldJson.call(this, json, local, namePrefix);
    }
    function convert(obj, options) {
        var ret = new nodes.Object(), leaveStrings = options.get('leave-strings').toBoolean();
        for (var key in obj) {
            var val = obj[key];
            if ('object' == typeof val) {
                ret.set(key, convert(val, options));
            } else {
                val = utils.coerce(val);
                if ('string' == val.nodeName && leaveStrings.isFalse) {
                    val = utils.parseString(val.string);
                }
                ret.set(key, val);
            }
        }
        return ret;
    }
}
;
json.params = [
    'path',
    'local',
    'namePrefix'
];
module.exports = json;
function oldJson(json, local, namePrefix) {
    if (namePrefix) {
        utils.assertString(namePrefix, 'namePrefix');
        namePrefix = namePrefix.val;
    } else {
        namePrefix = '';
    }
    local = local ? local.toBoolean() : new nodes.Boolean(local);
    var scope = local.isTrue ? this.currentScope : this.global.scope;
    convert(json);
    return;
    function convert(obj, prefix) {
        prefix = prefix ? prefix + '-' : '';
        for (var key in obj) {
            var val = obj[key];
            var name = prefix + key;
            if ('object' == typeof val) {
                convert(val, name);
            } else {
                val = utils.coerce(val);
                if ('string' == val.nodeName)
                    val = utils.parseString(val.string);
                scope.add({
                    name: namePrefix + name,
                    val: val
                });
            }
        }
    }
}
;
});
var _$imageSize_48 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({}), Image = _$image_49({});
function imageSize(img, ignoreErr) {
    utils.assertType(img, 'string', 'img');
    try {
        var img = new Image(this, img.string);
    } catch (err) {
        if (ignoreErr) {
            return [
                new nodes.Unit(0),
                new nodes.Unit(0)
            ];
        } else {
            throw err;
        }
    }
    img.open();
    var size = img.size();
    img.close();
    var expr = [];
    expr.push(new nodes.Unit(size[0], 'px'));
    expr.push(new nodes.Unit(size[1], 'px'));
    return expr;
}
;
imageSize.params = [
    'img',
    'ignoreErr'
];
module.exports = imageSize;
});
var _$image_49 = createModuleFactory(function (module, exports) {


/*!
 * Stylus - plugin - url
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = _$utils_146({})
  , nodes = _$nodes_115({})
  , Buffer = _$safer_16.Buffer
  , fs = require("fs");

/**
 * Initialize a new `Image` with the given `ctx` and `path.
 *
 * @param {Evaluator} ctx
 * @param {String} path
 * @api private
 */

var Image = module.exports = function Image(ctx, path) {
  this.ctx = ctx;
  this.path = utils.lookup(path, ctx.paths);
  if (!this.path) throw new Error('failed to locate file ' + path);
};

/**
 * Open the image for reading.
 *
 * @api private
 */

Image.prototype.open = function(){
  this.fd = fs.openSync(this.path, 'r');
  this.length = fs.fstatSync(this.fd).size;
  this.extname = _$pathBrowserify_14.extname(this.path).slice(1);
};

/**
 * Close the file.
 *
 * @api private
 */

Image.prototype.close = function(){
  if (this.fd) fs.closeSync(this.fd);
};

/**
 * Return the type of image, supports:
 *
 *  - gif
 *  - png
 *  - jpeg
 *  - svg
 *
 * @return {String}
 * @api private
 */

Image.prototype.type = function(){
  var type
    , buf = Buffer.alloc(4);
  
  fs.readSync(this.fd, buf, 0, 4, 0);

  // GIF
  if (0x47 == buf[0] && 0x49 == buf[1] && 0x46 == buf[2]) type = 'gif';

  // PNG
  else if (0x50 == buf[1] && 0x4E == buf[2] && 0x47 == buf[3]) type = 'png';

  // JPEG
  else if (0xff == buf[0] && 0xd8 == buf[1]) type = 'jpeg';

  // SVG
  else if ('svg' == this.extname) type = this.extname;

  return type;
};

/**
 * Return image dimensions `[width, height]`.
 *
 * @return {Array}
 * @api private
 */

Image.prototype.size = function(){
  var type = this.type()
    , width
    , height
    , buf
    , offset
    , blockSize
    , parser;

  function uint16(b) { return b[1] << 8 | b[0]; }
  function uint32(b) { return b[0] << 24 | b[1] << 16 | b[2] << 8 | b[3]; } 

  // Determine dimensions
  switch (type) {
    case 'jpeg':
      buf = Buffer.alloc(this.length);
      fs.readSync(this.fd, buf, 0, this.length, 0);
      offset = 4;
      blockSize = buf[offset] << 8 | buf[offset + 1];

      while (offset < this.length) {
        offset += blockSize;
        if (offset >= this.length || 0xff != buf[offset]) break;
        // SOF0 or SOF2 (progressive)
        if (0xc0 == buf[offset + 1] || 0xc2 == buf[offset + 1]) {
          height = buf[offset + 5] << 8 | buf[offset + 6];
          width = buf[offset + 7] << 8 | buf[offset + 8];
        } else {
          offset += 2;
          blockSize = buf[offset] << 8 | buf[offset + 1];
        }
      }
      break;
    case 'png':
      buf = Buffer.alloc(8);
      // IHDR chunk width / height uint32_t big-endian
      fs.readSync(this.fd, buf, 0, 8, 16);
      width = uint32(buf);
      height = uint32(buf.slice(4, 8));
      break;
    case 'gif':
      buf = Buffer.alloc(4);
      // width / height uint16_t little-endian
      fs.readSync(this.fd, buf, 0, 4, 6);
      width = uint16(buf);
      height = uint16(buf.slice(2, 4));
      break;
    case 'svg':
      offset = Math.min(this.length, 1024);
      buf = Buffer.alloc(offset);
      fs.readSync(this.fd, buf, 0, offset, 0);
      buf = buf.toString('utf8');
      parser = _$sax_162.parser(true);
      parser.onopentag = function(node) {
        if ('svg' == node.name && node.attributes.width && node.attributes.height) {
          width = parseInt(node.attributes.width, 10);
          height = parseInt(node.attributes.height, 10);
        }
      };
      parser.write(buf).close();
      break;
  }

  if ('number' != typeof width) throw new Error('failed to find width of "' + this.path + '"');
  if ('number' != typeof height) throw new Error('failed to find height of "' + this.path + '"');

  return [width, height];
};

});
var _$buffer_3 = createModuleFactory(function (module, exports) {
(function (Buffer){(function (){
'use strict';
/* removed: var _$base64Js_2 = require('base64-js'); */;
/* removed: var _$ieee754_12 = require('ieee754'); */;
exports.Buffer = Buffer;
exports.SlowBuffer = SlowBuffer;
exports.INSPECT_MAX_BYTES = 50;
var K_MAX_LENGTH = 2147483647;
exports.kMaxLength = K_MAX_LENGTH;
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();
if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error('This browser lacks typed array (Uint8Array) support which is required by ' + '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.');
}
function typedArraySupport() {
    try {
        var arr = new Uint8Array(1);
        arr.__proto__ = {
            __proto__: Uint8Array.prototype,
            foo: function () {
                return 42;
            }
        };
        return arr.foo() === 42;
    } catch (e) {
        return false;
    }
}
Object.defineProperty(Buffer.prototype, 'parent', {
    enumerable: true,
    get: function () {
        if (!Buffer.isBuffer(this))
            return undefined;
        return this.buffer;
    }
});
Object.defineProperty(Buffer.prototype, 'offset', {
    enumerable: true,
    get: function () {
        if (!Buffer.isBuffer(this))
            return undefined;
        return this.byteOffset;
    }
});
function createBuffer(length) {
    if (length > K_MAX_LENGTH) {
        throw new RangeError('The value "' + length + '" is invalid for option "size"');
    }
    var buf = new Uint8Array(length);
    buf.__proto__ = Buffer.prototype;
    return buf;
}
function Buffer(arg, encodingOrOffset, length) {
    if (typeof arg === 'number') {
        if (typeof encodingOrOffset === 'string') {
            throw new TypeError('The "string" argument must be of type string. Received type number');
        }
        return allocUnsafe(arg);
    }
    return from(arg, encodingOrOffset, length);
}
if (typeof Symbol !== 'undefined' && Symbol.species != null && Buffer[Symbol.species] === Buffer) {
    Object.defineProperty(Buffer, Symbol.species, {
        value: null,
        configurable: true,
        enumerable: false,
        writable: false
    });
}
Buffer.poolSize = 8192;
function from(value, encodingOrOffset, length) {
    if (typeof value === 'string') {
        return fromString(value, encodingOrOffset);
    }
    if (ArrayBuffer.isView(value)) {
        return fromArrayLike(value);
    }
    if (value == null) {
        throw TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + typeof value);
    }
    if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
        return fromArrayBuffer(value, encodingOrOffset, length);
    }
    if (typeof value === 'number') {
        throw new TypeError('The "value" argument must not be of type number. Received type number');
    }
    var valueOf = value.valueOf && value.valueOf();
    if (valueOf != null && valueOf !== value) {
        return Buffer.from(valueOf, encodingOrOffset, length);
    }
    var b = fromObject(value);
    if (b)
        return b;
    if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === 'function') {
        return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length);
    }
    throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + typeof value);
}
Buffer.from = function (value, encodingOrOffset, length) {
    return from(value, encodingOrOffset, length);
};
Buffer.prototype.__proto__ = Uint8Array.prototype;
Buffer.__proto__ = Uint8Array;
function assertSize(size) {
    if (typeof size !== 'number') {
        throw new TypeError('"size" argument must be of type number');
    } else if (size < 0) {
        throw new RangeError('The value "' + size + '" is invalid for option "size"');
    }
}
function alloc(size, fill, encoding) {
    assertSize(size);
    if (size <= 0) {
        return createBuffer(size);
    }
    if (fill !== undefined) {
        return typeof encoding === 'string' ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
    }
    return createBuffer(size);
}
Buffer.alloc = function (size, fill, encoding) {
    return alloc(size, fill, encoding);
};
function allocUnsafe(size) {
    assertSize(size);
    return createBuffer(size < 0 ? 0 : checked(size) | 0);
}
Buffer.allocUnsafe = function (size) {
    return allocUnsafe(size);
};
Buffer.allocUnsafeSlow = function (size) {
    return allocUnsafe(size);
};
function fromString(string, encoding) {
    if (typeof encoding !== 'string' || encoding === '') {
        encoding = 'utf8';
    }
    if (!Buffer.isEncoding(encoding)) {
        throw new TypeError('Unknown encoding: ' + encoding);
    }
    var length = byteLength(string, encoding) | 0;
    var buf = createBuffer(length);
    var actual = buf.write(string, encoding);
    if (actual !== length) {
        buf = buf.slice(0, actual);
    }
    return buf;
}
function fromArrayLike(array) {
    var length = array.length < 0 ? 0 : checked(array.length) | 0;
    var buf = createBuffer(length);
    for (var i = 0; i < length; i += 1) {
        buf[i] = array[i] & 255;
    }
    return buf;
}
function fromArrayBuffer(array, byteOffset, length) {
    if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('"offset" is outside of buffer bounds');
    }
    if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('"length" is outside of buffer bounds');
    }
    var buf;
    if (byteOffset === undefined && length === undefined) {
        buf = new Uint8Array(array);
    } else if (length === undefined) {
        buf = new Uint8Array(array, byteOffset);
    } else {
        buf = new Uint8Array(array, byteOffset, length);
    }
    buf.__proto__ = Buffer.prototype;
    return buf;
}
function fromObject(obj) {
    if (Buffer.isBuffer(obj)) {
        var len = checked(obj.length) | 0;
        var buf = createBuffer(len);
        if (buf.length === 0) {
            return buf;
        }
        obj.copy(buf, 0, 0, len);
        return buf;
    }
    if (obj.length !== undefined) {
        if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
            return createBuffer(0);
        }
        return fromArrayLike(obj);
    }
    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data);
    }
}
function checked(length) {
    if (length >= K_MAX_LENGTH) {
        throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes');
    }
    return length | 0;
}
function SlowBuffer(length) {
    if (+length != length) {
        length = 0;
    }
    return Buffer.alloc(+length);
}
Buffer.isBuffer = function isBuffer(b) {
    return b != null && b._isBuffer === true && b !== Buffer.prototype;
};
Buffer.compare = function compare(a, b) {
    if (isInstance(a, Uint8Array))
        a = Buffer.from(a, a.offset, a.byteLength);
    if (isInstance(b, Uint8Array))
        b = Buffer.from(b, b.offset, b.byteLength);
    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
        throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
    }
    if (a === b)
        return 0;
    var x = a.length;
    var y = b.length;
    for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
        }
    }
    if (x < y)
        return -1;
    if (y < x)
        return 1;
    return 0;
};
Buffer.isEncoding = function isEncoding(encoding) {
    switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
        return true;
    default:
        return false;
    }
};
Buffer.concat = function concat(list, length) {
    if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
    }
    if (list.length === 0) {
        return Buffer.alloc(0);
    }
    var i;
    if (length === undefined) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
            length += list[i].length;
        }
    }
    var buffer = Buffer.allocUnsafe(length);
    var pos = 0;
    for (i = 0; i < list.length; ++i) {
        var buf = list[i];
        if (isInstance(buf, Uint8Array)) {
            buf = Buffer.from(buf);
        }
        if (!Buffer.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
        }
        buf.copy(buffer, pos);
        pos += buf.length;
    }
    return buffer;
};
function byteLength(string, encoding) {
    if (Buffer.isBuffer(string)) {
        return string.length;
    }
    if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
        return string.byteLength;
    }
    if (typeof string !== 'string') {
        throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' + 'Received type ' + typeof string);
    }
    var len = string.length;
    var mustMatch = arguments.length > 2 && arguments[2] === true;
    if (!mustMatch && len === 0)
        return 0;
    var loweredCase = false;
    for (;;) {
        switch (encoding) {
        case 'ascii':
        case 'latin1':
        case 'binary':
            return len;
        case 'utf8':
        case 'utf-8':
            return utf8ToBytes(string).length;
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
            return len * 2;
        case 'hex':
            return len >>> 1;
        case 'base64':
            return base64ToBytes(string).length;
        default:
            if (loweredCase) {
                return mustMatch ? -1 : utf8ToBytes(string).length;
            }
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
    }
}
Buffer.byteLength = byteLength;
function slowToString(encoding, start, end) {
    var loweredCase = false;
    if (start === undefined || start < 0) {
        start = 0;
    }
    if (start > this.length) {
        return '';
    }
    if (end === undefined || end > this.length) {
        end = this.length;
    }
    if (end <= 0) {
        return '';
    }
    end >>>= 0;
    start >>>= 0;
    if (end <= start) {
        return '';
    }
    if (!encoding)
        encoding = 'utf8';
    while (true) {
        switch (encoding) {
        case 'hex':
            return hexSlice(this, start, end);
        case 'utf8':
        case 'utf-8':
            return utf8Slice(this, start, end);
        case 'ascii':
            return asciiSlice(this, start, end);
        case 'latin1':
        case 'binary':
            return latin1Slice(this, start, end);
        case 'base64':
            return base64Slice(this, start, end);
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
            return utf16leSlice(this, start, end);
        default:
            if (loweredCase)
                throw new TypeError('Unknown encoding: ' + encoding);
            encoding = (encoding + '').toLowerCase();
            loweredCase = true;
        }
    }
}
Buffer.prototype._isBuffer = true;
function swap(b, n, m) {
    var i = b[n];
    b[n] = b[m];
    b[m] = i;
}
Buffer.prototype.swap16 = function swap16() {
    var len = this.length;
    if (len % 2 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 16-bits');
    }
    for (var i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
    }
    return this;
};
Buffer.prototype.swap32 = function swap32() {
    var len = this.length;
    if (len % 4 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 32-bits');
    }
    for (var i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
    }
    return this;
};
Buffer.prototype.swap64 = function swap64() {
    var len = this.length;
    if (len % 8 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 64-bits');
    }
    for (var i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
    }
    return this;
};
Buffer.prototype.toString = function toString() {
    var length = this.length;
    if (length === 0)
        return '';
    if (arguments.length === 0)
        return utf8Slice(this, 0, length);
    return slowToString.apply(this, arguments);
};
Buffer.prototype.toLocaleString = Buffer.prototype.toString;
Buffer.prototype.equals = function equals(b) {
    if (!Buffer.isBuffer(b))
        throw new TypeError('Argument must be a Buffer');
    if (this === b)
        return true;
    return Buffer.compare(this, b) === 0;
};
Buffer.prototype.inspect = function inspect() {
    var str = '';
    var max = exports.INSPECT_MAX_BYTES;
    str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim();
    if (this.length > max)
        str += ' ... ';
    return '<Buffer ' + str + '>';
};
Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
    if (isInstance(target, Uint8Array)) {
        target = Buffer.from(target, target.offset, target.byteLength);
    }
    if (!Buffer.isBuffer(target)) {
        throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. ' + 'Received type ' + typeof target);
    }
    if (start === undefined) {
        start = 0;
    }
    if (end === undefined) {
        end = target ? target.length : 0;
    }
    if (thisStart === undefined) {
        thisStart = 0;
    }
    if (thisEnd === undefined) {
        thisEnd = this.length;
    }
    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError('out of range index');
    }
    if (thisStart >= thisEnd && start >= end) {
        return 0;
    }
    if (thisStart >= thisEnd) {
        return -1;
    }
    if (start >= end) {
        return 1;
    }
    start >>>= 0;
    end >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;
    if (this === target)
        return 0;
    var x = thisEnd - thisStart;
    var y = end - start;
    var len = Math.min(x, y);
    var thisCopy = this.slice(thisStart, thisEnd);
    var targetCopy = target.slice(start, end);
    for (var i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y = targetCopy[i];
            break;
        }
    }
    if (x < y)
        return -1;
    if (y < x)
        return 1;
    return 0;
};
function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
    if (buffer.length === 0)
        return -1;
    if (typeof byteOffset === 'string') {
        encoding = byteOffset;
        byteOffset = 0;
    } else if (byteOffset > 2147483647) {
        byteOffset = 2147483647;
    } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648;
    }
    byteOffset = +byteOffset;
    if (numberIsNaN(byteOffset)) {
        byteOffset = dir ? 0 : buffer.length - 1;
    }
    if (byteOffset < 0)
        byteOffset = buffer.length + byteOffset;
    if (byteOffset >= buffer.length) {
        if (dir)
            return -1;
        else
            byteOffset = buffer.length - 1;
    } else if (byteOffset < 0) {
        if (dir)
            byteOffset = 0;
        else
            return -1;
    }
    if (typeof val === 'string') {
        val = Buffer.from(val, encoding);
    }
    if (Buffer.isBuffer(val)) {
        if (val.length === 0) {
            return -1;
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
    } else if (typeof val === 'number') {
        val = val & 255;
        if (typeof Uint8Array.prototype.indexOf === 'function') {
            if (dir) {
                return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            } else {
                return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
            }
        }
        return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
    }
    throw new TypeError('val must be string, number or Buffer');
}
function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
    var indexSize = 1;
    var arrLength = arr.length;
    var valLength = val.length;
    if (encoding !== undefined) {
        encoding = String(encoding).toLowerCase();
        if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
            if (arr.length < 2 || val.length < 2) {
                return -1;
            }
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
        }
    }
    function read(buf, i) {
        if (indexSize === 1) {
            return buf[i];
        } else {
            return buf.readUInt16BE(i * indexSize);
        }
    }
    var i;
    if (dir) {
        var foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
            if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                if (foundIndex === -1)
                    foundIndex = i;
                if (i - foundIndex + 1 === valLength)
                    return foundIndex * indexSize;
            } else {
                if (foundIndex !== -1)
                    i -= i - foundIndex;
                foundIndex = -1;
            }
        }
    } else {
        if (byteOffset + valLength > arrLength)
            byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
            var found = true;
            for (var j = 0; j < valLength; j++) {
                if (read(arr, i + j) !== read(val, j)) {
                    found = false;
                    break;
                }
            }
            if (found)
                return i;
        }
    }
    return -1;
}
Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1;
};
Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
};
Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
};
function hexWrite(buf, string, offset, length) {
    offset = Number(offset) || 0;
    var remaining = buf.length - offset;
    if (!length) {
        length = remaining;
    } else {
        length = Number(length);
        if (length > remaining) {
            length = remaining;
        }
    }
    var strLen = string.length;
    if (length > strLen / 2) {
        length = strLen / 2;
    }
    for (var i = 0; i < length; ++i) {
        var parsed = parseInt(string.substr(i * 2, 2), 16);
        if (numberIsNaN(parsed))
            return i;
        buf[offset + i] = parsed;
    }
    return i;
}
function utf8Write(buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
}
function asciiWrite(buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length);
}
function latin1Write(buf, string, offset, length) {
    return asciiWrite(buf, string, offset, length);
}
function base64Write(buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length);
}
function ucs2Write(buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
}
Buffer.prototype.write = function write(string, offset, length, encoding) {
    if (offset === undefined) {
        encoding = 'utf8';
        length = this.length;
        offset = 0;
    } else if (length === undefined && typeof offset === 'string') {
        encoding = offset;
        length = this.length;
        offset = 0;
    } else if (isFinite(offset)) {
        offset = offset >>> 0;
        if (isFinite(length)) {
            length = length >>> 0;
            if (encoding === undefined)
                encoding = 'utf8';
        } else {
            encoding = length;
            length = undefined;
        }
    } else {
        throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
    }
    var remaining = this.length - offset;
    if (length === undefined || length > remaining)
        length = remaining;
    if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
        throw new RangeError('Attempt to write outside buffer bounds');
    }
    if (!encoding)
        encoding = 'utf8';
    var loweredCase = false;
    for (;;) {
        switch (encoding) {
        case 'hex':
            return hexWrite(this, string, offset, length);
        case 'utf8':
        case 'utf-8':
            return utf8Write(this, string, offset, length);
        case 'ascii':
            return asciiWrite(this, string, offset, length);
        case 'latin1':
        case 'binary':
            return latin1Write(this, string, offset, length);
        case 'base64':
            return base64Write(this, string, offset, length);
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
            return ucs2Write(this, string, offset, length);
        default:
            if (loweredCase)
                throw new TypeError('Unknown encoding: ' + encoding);
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
    }
};
Buffer.prototype.toJSON = function toJSON() {
    return {
        type: 'Buffer',
        data: Array.prototype.slice.call(this._arr || this, 0)
    };
};
function base64Slice(buf, start, end) {
    if (start === 0 && end === buf.length) {
        return _$base64Js_2.fromByteArray(buf);
    } else {
        return _$base64Js_2.fromByteArray(buf.slice(start, end));
    }
}
function utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    var res = [];
    var i = start;
    while (i < end) {
        var firstByte = buf[i];
        var codePoint = null;
        var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i + bytesPerSequence <= end) {
            var secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
            case 1:
                if (firstByte < 128) {
                    codePoint = firstByte;
                }
                break;
            case 2:
                secondByte = buf[i + 1];
                if ((secondByte & 192) === 128) {
                    tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                    if (tempCodePoint > 127) {
                        codePoint = tempCodePoint;
                    }
                }
                break;
            case 3:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                    tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                    if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                        codePoint = tempCodePoint;
                    }
                }
                break;
            case 4:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                fourthByte = buf[i + 3];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                    tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                    if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                        codePoint = tempCodePoint;
                    }
                }
            }
        }
        if (codePoint === null) {
            codePoint = 65533;
            bytesPerSequence = 1;
        } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | codePoint & 1023;
        }
        res.push(codePoint);
        i += bytesPerSequence;
    }
    return decodeCodePointsArray(res);
}
var MAX_ARGUMENTS_LENGTH = 4096;
function decodeCodePointsArray(codePoints) {
    var len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints);
    }
    var res = '';
    var i = 0;
    while (i < len) {
        res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
    }
    return res;
}
function asciiSlice(buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);
    for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 127);
    }
    return ret;
}
function latin1Slice(buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);
    for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
    }
    return ret;
}
function hexSlice(buf, start, end) {
    var len = buf.length;
    if (!start || start < 0)
        start = 0;
    if (!end || end < 0 || end > len)
        end = len;
    var out = '';
    for (var i = start; i < end; ++i) {
        out += toHex(buf[i]);
    }
    return out;
}
function utf16leSlice(buf, start, end) {
    var bytes = buf.slice(start, end);
    var res = '';
    for (var i = 0; i < bytes.length; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
    }
    return res;
}
Buffer.prototype.slice = function slice(start, end) {
    var len = this.length;
    start = ~~start;
    end = end === undefined ? len : ~~end;
    if (start < 0) {
        start += len;
        if (start < 0)
            start = 0;
    } else if (start > len) {
        start = len;
    }
    if (end < 0) {
        end += len;
        if (end < 0)
            end = 0;
    } else if (end > len) {
        end = len;
    }
    if (end < start)
        end = start;
    var newBuf = this.subarray(start, end);
    newBuf.__proto__ = Buffer.prototype;
    return newBuf;
};
function checkOffset(offset, ext, length) {
    if (offset % 1 !== 0 || offset < 0)
        throw new RangeError('offset is not uint');
    if (offset + ext > length)
        throw new RangeError('Trying to access beyond buffer length');
}
Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert)
        checkOffset(offset, byteLength, this.length);
    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 256)) {
        val += this[offset + i] * mul;
    }
    return val;
};
Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) {
        checkOffset(offset, byteLength, this.length);
    }
    var val = this[offset + --byteLength];
    var mul = 1;
    while (byteLength > 0 && (mul *= 256)) {
        val += this[offset + --byteLength] * mul;
    }
    return val;
};
Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
        checkOffset(offset, 1, this.length);
    return this[offset];
};
Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
        checkOffset(offset, 2, this.length);
    return this[offset] | this[offset + 1] << 8;
};
Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
        checkOffset(offset, 2, this.length);
    return this[offset] << 8 | this[offset + 1];
};
Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
        checkOffset(offset, 4, this.length);
    return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
};
Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
        checkOffset(offset, 4, this.length);
    return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
};
Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert)
        checkOffset(offset, byteLength, this.length);
    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 256)) {
        val += this[offset + i] * mul;
    }
    mul *= 128;
    if (val >= mul)
        val -= Math.pow(2, 8 * byteLength);
    return val;
};
Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert)
        checkOffset(offset, byteLength, this.length);
    var i = byteLength;
    var mul = 1;
    var val = this[offset + --i];
    while (i > 0 && (mul *= 256)) {
        val += this[offset + --i] * mul;
    }
    mul *= 128;
    if (val >= mul)
        val -= Math.pow(2, 8 * byteLength);
    return val;
};
Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
        checkOffset(offset, 1, this.length);
    if (!(this[offset] & 128))
        return this[offset];
    return (255 - this[offset] + 1) * -1;
};
Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
        checkOffset(offset, 2, this.length);
    var val = this[offset] | this[offset + 1] << 8;
    return val & 32768 ? val | 4294901760 : val;
};
Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
        checkOffset(offset, 2, this.length);
    var val = this[offset + 1] | this[offset] << 8;
    return val & 32768 ? val | 4294901760 : val;
};
Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
        checkOffset(offset, 4, this.length);
    return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
};
Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
        checkOffset(offset, 4, this.length);
    return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
};
Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
        checkOffset(offset, 4, this.length);
    return _$ieee754_12.read(this, offset, true, 23, 4);
};
Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
        checkOffset(offset, 4, this.length);
    return _$ieee754_12.read(this, offset, false, 23, 4);
};
Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
        checkOffset(offset, 8, this.length);
    return _$ieee754_12.read(this, offset, true, 52, 8);
};
Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
        checkOffset(offset, 8, this.length);
    return _$ieee754_12.read(this, offset, false, 52, 8);
};
function checkInt(buf, value, offset, ext, max, min) {
    if (!Buffer.isBuffer(buf))
        throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max || value < min)
        throw new RangeError('"value" argument is out of bounds');
    if (offset + ext > buf.length)
        throw new RangeError('Index out of range');
}
Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
    }
    var mul = 1;
    var i = 0;
    this[offset] = value & 255;
    while (++i < byteLength && (mul *= 256)) {
        this[offset + i] = value / mul & 255;
    }
    return offset + byteLength;
};
Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
    }
    var i = byteLength - 1;
    var mul = 1;
    this[offset + i] = value & 255;
    while (--i >= 0 && (mul *= 256)) {
        this[offset + i] = value / mul & 255;
    }
    return offset + byteLength;
};
Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
        checkInt(this, value, offset, 1, 255, 0);
    this[offset] = value & 255;
    return offset + 1;
};
Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
        checkInt(this, value, offset, 2, 65535, 0);
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    return offset + 2;
};
Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
        checkInt(this, value, offset, 2, 65535, 0);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 255;
    return offset + 2;
};
Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
        checkInt(this, value, offset, 4, 4294967295, 0);
    this[offset + 3] = value >>> 24;
    this[offset + 2] = value >>> 16;
    this[offset + 1] = value >>> 8;
    this[offset] = value & 255;
    return offset + 4;
};
Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
        checkInt(this, value, offset, 4, 4294967295, 0);
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 255;
    return offset + 4;
};
Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);
        checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }
    var i = 0;
    var mul = 1;
    var sub = 0;
    this[offset] = value & 255;
    while (++i < byteLength && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1;
        }
        this[offset + i] = (value / mul >> 0) - sub & 255;
    }
    return offset + byteLength;
};
Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);
        checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }
    var i = byteLength - 1;
    var mul = 1;
    var sub = 0;
    this[offset + i] = value & 255;
    while (--i >= 0 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1;
        }
        this[offset + i] = (value / mul >> 0) - sub & 255;
    }
    return offset + byteLength;
};
Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
        checkInt(this, value, offset, 1, 127, -128);
    if (value < 0)
        value = 255 + value + 1;
    this[offset] = value & 255;
    return offset + 1;
};
Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
        checkInt(this, value, offset, 2, 32767, -32768);
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    return offset + 2;
};
Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
        checkInt(this, value, offset, 2, 32767, -32768);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 255;
    return offset + 2;
};
Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
        checkInt(this, value, offset, 4, 2147483647, -2147483648);
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    this[offset + 2] = value >>> 16;
    this[offset + 3] = value >>> 24;
    return offset + 4;
};
Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
        checkInt(this, value, offset, 4, 2147483647, -2147483648);
    if (value < 0)
        value = 4294967295 + value + 1;
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 255;
    return offset + 4;
};
function checkIEEE754(buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length)
        throw new RangeError('Index out of range');
    if (offset < 0)
        throw new RangeError('Index out of range');
}
function writeFloat(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
        checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
    }
    _$ieee754_12.write(buf, value, offset, littleEndian, 23, 4);
    return offset + 4;
}
Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert);
};
Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert);
};
function writeDouble(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
        checkIEEE754(buf, value, offset, 8, 1.7976931348623157e+308, -1.7976931348623157e+308);
    }
    _$ieee754_12.write(buf, value, offset, littleEndian, 52, 8);
    return offset + 8;
}
Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert);
};
Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert);
};
Buffer.prototype.copy = function copy(target, targetStart, start, end) {
    if (!Buffer.isBuffer(target))
        throw new TypeError('argument should be a Buffer');
    if (!start)
        start = 0;
    if (!end && end !== 0)
        end = this.length;
    if (targetStart >= target.length)
        targetStart = target.length;
    if (!targetStart)
        targetStart = 0;
    if (end > 0 && end < start)
        end = start;
    if (end === start)
        return 0;
    if (target.length === 0 || this.length === 0)
        return 0;
    if (targetStart < 0) {
        throw new RangeError('targetStart out of bounds');
    }
    if (start < 0 || start >= this.length)
        throw new RangeError('Index out of range');
    if (end < 0)
        throw new RangeError('sourceEnd out of bounds');
    if (end > this.length)
        end = this.length;
    if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
    }
    var len = end - start;
    if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
        this.copyWithin(targetStart, start, end);
    } else if (this === target && start < targetStart && targetStart < end) {
        for (var i = len - 1; i >= 0; --i) {
            target[i + targetStart] = this[i + start];
        }
    } else {
        Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
    }
    return len;
};
Buffer.prototype.fill = function fill(val, start, end, encoding) {
    if (typeof val === 'string') {
        if (typeof start === 'string') {
            encoding = start;
            start = 0;
            end = this.length;
        } else if (typeof end === 'string') {
            encoding = end;
            end = this.length;
        }
        if (encoding !== undefined && typeof encoding !== 'string') {
            throw new TypeError('encoding must be a string');
        }
        if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
            throw new TypeError('Unknown encoding: ' + encoding);
        }
        if (val.length === 1) {
            var code = val.charCodeAt(0);
            if (encoding === 'utf8' && code < 128 || encoding === 'latin1') {
                val = code;
            }
        }
    } else if (typeof val === 'number') {
        val = val & 255;
    }
    if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError('Out of range index');
    }
    if (end <= start) {
        return this;
    }
    start = start >>> 0;
    end = end === undefined ? this.length : end >>> 0;
    if (!val)
        val = 0;
    var i;
    if (typeof val === 'number') {
        for (i = start; i < end; ++i) {
            this[i] = val;
        }
    } else {
        var bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
        var len = bytes.length;
        if (len === 0) {
            throw new TypeError('The value "' + val + '" is invalid for argument "value"');
        }
        for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len];
        }
    }
    return this;
};
var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
function base64clean(str) {
    str = str.split('=')[0];
    str = str.trim().replace(INVALID_BASE64_RE, '');
    if (str.length < 2)
        return '';
    while (str.length % 4 !== 0) {
        str = str + '=';
    }
    return str;
}
function toHex(n) {
    if (n < 16)
        return '0' + n.toString(16);
    return n.toString(16);
}
function utf8ToBytes(string, units) {
    units = units || Infinity;
    var codePoint;
    var length = string.length;
    var leadSurrogate = null;
    var bytes = [];
    for (var i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);
        if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
                if (codePoint > 56319) {
                    if ((units -= 3) > -1)
                        bytes.push(239, 191, 189);
                    continue;
                } else if (i + 1 === length) {
                    if ((units -= 3) > -1)
                        bytes.push(239, 191, 189);
                    continue;
                }
                leadSurrogate = codePoint;
                continue;
            }
            if (codePoint < 56320) {
                if ((units -= 3) > -1)
                    bytes.push(239, 191, 189);
                leadSurrogate = codePoint;
                continue;
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
        } else if (leadSurrogate) {
            if ((units -= 3) > -1)
                bytes.push(239, 191, 189);
        }
        leadSurrogate = null;
        if (codePoint < 128) {
            if ((units -= 1) < 0)
                break;
            bytes.push(codePoint);
        } else if (codePoint < 2048) {
            if ((units -= 2) < 0)
                break;
            bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
        } else if (codePoint < 65536) {
            if ((units -= 3) < 0)
                break;
            bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else if (codePoint < 1114112) {
            if ((units -= 4) < 0)
                break;
            bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else {
            throw new Error('Invalid code point');
        }
    }
    return bytes;
}
function asciiToBytes(str) {
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
        byteArray.push(str.charCodeAt(i) & 255);
    }
    return byteArray;
}
function utf16leToBytes(str, units) {
    var c, hi, lo;
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0)
            break;
        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
    }
    return byteArray;
}
function base64ToBytes(str) {
    return _$base64Js_2.toByteArray(base64clean(str));
}
function blitBuffer(src, dst, offset, length) {
    for (var i = 0; i < length; ++i) {
        if (i + offset >= dst.length || i >= src.length)
            break;
        dst[i + offset] = src[i];
    }
    return i;
}
function isInstance(obj, type) {
    return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
}
function numberIsNaN(obj) {
    return obj !== obj;
}
}).call(this)}).call(this,_$buffer_3({}).Buffer)
});
var _$hue_47 = createModuleFactory(function (module, exports) {
var nodes = _$nodes_115({})
  , hsla = _$hsla_46({})
  , component = _$component_35({});

/**
 * Return the hue component of the given `color`,
 * or set the hue component to the optional second `value` argument.
 *
 * Examples:
 *
 *    hue(#00c)
 *    // => 240deg
 *
 *    hue(#00c, 90deg)
 *    // => #6c0
 *
 * @param {RGBA|HSLA} color
 * @param {Unit} [value]
 * @return {Unit|RGBA}
 * @api public
 */

function hue(color, value){
  if (value) {
    var hslaColor = color.hsla;
    return hsla(
      value,
      new nodes.Unit(hslaColor.s),
      new nodes.Unit(hslaColor.l),
      new nodes.Unit(hslaColor.a)
    )
  }
  return component(color, new nodes.String('hue'));
};
hue.params = ['color', 'value'];
module.exports = hue;

});
var _$hsl_45 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({}), hsla = _$hsla_46({});
function hsl(hue, saturation, lightness) {
    if (1 == arguments.length) {
        utils.assertColor(hue, 'color');
        return hue.hsla;
    } else {
        return hsla(hue, saturation, lightness, new nodes.Unit(1));
    }
}
;
hsl.params = [
    'hue',
    'saturation',
    'lightness'
];
module.exports = hsl;
});
var _$hsla_46 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
function hsla(hue, saturation, lightness, alpha) {
    switch (arguments.length) {
    case 1:
        utils.assertColor(hue);
        return hue.hsla;
    case 2:
        utils.assertColor(hue);
        var color = hue.hsla;
        utils.assertType(saturation, 'unit', 'alpha');
        var alpha = saturation.clone();
        if ('%' == alpha.type)
            alpha.val /= 100;
        return new nodes.HSLA(color.h, color.s, color.l, alpha.val);
    default:
        utils.assertType(hue, 'unit', 'hue');
        utils.assertType(saturation, 'unit', 'saturation');
        utils.assertType(lightness, 'unit', 'lightness');
        utils.assertType(alpha, 'unit', 'alpha');
        var alpha = alpha.clone();
        if (alpha && '%' == alpha.type)
            alpha.val /= 100;
        return new nodes.HSLA(hue.val, saturation.val, lightness.val, alpha.val);
    }
}
;
hsla.params = [
    'hue',
    'saturation',
    'lightness',
    'alpha'
];
module.exports = hsla;
});
var _$green_44 = createModuleFactory(function (module, exports) {
var nodes = _$nodes_115({})
  , rgba = _$rgba_74({});

/**
 * Return the green component of the given `color`,
 * or set the green component to the optional second `value` argument.
 *
 * Examples:
 *
 *    green(#0c0)
 *    // => 204
 *
 *    green(#000, 255)
 *    // => #0f0
 *
 * @param {RGBA|HSLA} color
 * @param {Unit} [value]
 * @return {Unit|RGBA}
 * @api public
 */

function green(color, value){
  color = color.rgba;
  if (value) {
    return rgba(
      new nodes.Unit(color.r),
      value,
      new nodes.Unit(color.b),
      new nodes.Unit(color.a)
    );
  }
  return new nodes.Unit(color.g, '');
};
green.params = ['color', 'value'];
module.exports = green;

});
var _$extname_43 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});
function extname(p) {
    utils.assertString(p, 'path');
    return _$pathBrowserify_14.extname(p.val);
}
;
extname.params = ['p'];
module.exports = extname;
});
var _$error_42 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});
function error(msg) {
    utils.assertType(msg, 'string', 'msg');
    var err = new Error(msg.val);
    err.fromStylus = true;
    throw err;
}
;
error.params = ['msg'];
module.exports = error;
});
var _$dirname_41 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});
function dirname(p) {
    utils.assertString(p, 'path');
    return _$pathBrowserify_14.dirname(p.val).replace(/\\/g, '/');
}
;
dirname.params = ['p'];
module.exports = dirname;
});
var _$define_40 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
function define(name, expr, global) {
    utils.assertType(name, 'string', 'name');
    expr = utils.unwrap(expr);
    var scope = this.currentScope;
    if (global && global.toBoolean().isTrue) {
        scope = this.global.scope;
    }
    var node = new nodes.Ident(name.val, expr);
    scope.add(node);
    return nodes.null;
}
;
define.params = [
    'name',
    'expr',
    'global'
];
module.exports = define;
});
var _$currentMedia_39 = createModuleFactory(function (module, exports) {
var nodes = _$nodes_115({});

/**
 * Returns the @media string for the current block
 *
 * @return {String}
 * @api public
 */

module.exports = function currentMedia(){
  var self = this;
  return new nodes.String(lookForMedia(this.closestBlock.node) || '');

  function lookForMedia(node){
    if ('media' == node.nodeName) {
      node.val = self.visit(node.val);
      return node.toString();
    } else if (node.block.parent.node) {
      return lookForMedia(node.block.parent.node);
    }
  }
};

});
var _$convert_38 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});
function convert(str) {
    utils.assertString(str, 'str');
    return utils.parseString(str.string);
}
;
convert.params = ['str'];
module.exports = convert;
});
var _$contrast_36 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({}), blend = _$blend_32({}), luminosity = _$luminosity_56({});
function contrast(top, bottom) {
    if ('rgba' != top.nodeName && 'hsla' != top.nodeName) {
        return new nodes.Literal('contrast(' + (top.isNull ? '' : top.toString()) + ')');
    }
    var result = new nodes.Object();
    top = top.rgba;
    bottom = bottom || new nodes.RGBA(255, 255, 255, 1);
    utils.assertColor(bottom);
    bottom = bottom.rgba;
    function contrast(top, bottom) {
        if (1 > top.a) {
            top = blend(top, bottom);
        }
        var l1 = luminosity(bottom).val + 0.05, l2 = luminosity(top).val + 0.05, ratio = l1 / l2;
        if (l2 > l1) {
            ratio = 1 / ratio;
        }
        return Math.round(ratio * 10) / 10;
    }
    if (1 <= bottom.a) {
        var resultRatio = new nodes.Unit(contrast(top, bottom));
        result.set('ratio', resultRatio);
        result.set('error', new nodes.Unit(0));
        result.set('min', resultRatio);
        result.set('max', resultRatio);
    } else {
        var onBlack = contrast(top, blend(bottom, new nodes.RGBA(0, 0, 0, 1))), onWhite = contrast(top, blend(bottom, new nodes.RGBA(255, 255, 255, 1))), max = Math.max(onBlack, onWhite);
        function processChannel(topChannel, bottomChannel) {
            return Math.min(Math.max(0, (topChannel - bottomChannel * bottom.a) / (1 - bottom.a)), 255);
        }
        var closest = new nodes.RGBA(processChannel(top.r, bottom.r), processChannel(top.g, bottom.g), processChannel(top.b, bottom.b), 1);
        var min = contrast(top, blend(bottom, closest));
        result.set('ratio', new nodes.Unit(Math.round((min + max) * 50) / 100));
        result.set('error', new nodes.Unit(Math.round((max - min) * 50) / 100));
        result.set('min', new nodes.Unit(min));
        result.set('max', new nodes.Unit(max));
    }
    return result;
}
contrast.params = [
    'top',
    'bottom'
];
module.exports = contrast;
});
var _$luminosity_56 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
function luminosity(color) {
    utils.assertColor(color);
    color = color.rgba;
    function processChannel(channel) {
        channel = channel / 255;
        return 0.03928 > channel ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    }
    return new nodes.Unit(0.2126 * processChannel(color.r) + 0.7152 * processChannel(color.g) + 0.0722 * processChannel(color.b));
}
;
luminosity.params = ['color'];
module.exports = luminosity;
});
var _$component_35 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
var componentMap = {
    red: 'r',
    green: 'g',
    blue: 'b',
    alpha: 'a',
    hue: 'h',
    saturation: 's',
    lightness: 'l'
};
var unitMap = {
    hue: 'deg',
    saturation: '%',
    lightness: '%'
};
var typeMap = {
    red: 'rgba',
    blue: 'rgba',
    green: 'rgba',
    alpha: 'rgba',
    hue: 'hsla',
    saturation: 'hsla',
    lightness: 'hsla'
};
function component(color, name) {
    utils.assertColor(color, 'color');
    utils.assertString(name, 'name');
    var name = name.string, unit = unitMap[name], type = typeMap[name], name = componentMap[name];
    if (!name)
        throw new Error('invalid color component "' + name + '"');
    return new nodes.Unit(color[type][name], unit);
}
;
component.params = [
    'color',
    'name'
];
module.exports = component;
});
var _$clone_34 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});
(module.exports = function clone(expr) {
    utils.assertPresent(expr, 'expr');
    return expr.clone();
}).raw = true;
});
var _$blue_33 = createModuleFactory(function (module, exports) {
var nodes = _$nodes_115({})
  , rgba = _$rgba_74({});

/**
 * Return the blue component of the given `color`,
 * or set the blue component to the optional second `value` argument.
 *
 * Examples:
 *
 *    blue(#00c)
 *    // => 204
 *
 *    blue(#000, 255)
 *    // => #00f
 *
 * @param {RGBA|HSLA} color
 * @param {Unit} [value]
 * @return {Unit|RGBA}
 * @api public
 */

function blue(color, value){
  color = color.rgba;
  if (value) {
    return rgba(
      new nodes.Unit(color.r),
      new nodes.Unit(color.g),
      value,
      new nodes.Unit(color.a)
    );
  }
  return new nodes.Unit(color.b, '');
};
blue.params = ['color', 'value'];
module.exports = blue;

});
var _$blend_32 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
function blend(top, bottom) {
    utils.assertColor(top);
    top = top.rgba;
    bottom = bottom || new nodes.RGBA(255, 255, 255, 1);
    utils.assertColor(bottom);
    bottom = bottom.rgba;
    return new nodes.RGBA(top.r * top.a + bottom.r * (1 - top.a), top.g * top.a + bottom.g * (1 - top.a), top.b * top.a + bottom.b * (1 - top.a), top.a + bottom.a - top.a * bottom.a);
}
;
blend.params = [
    'top',
    'bottom'
];
module.exports = blend;
});
var _$basename_31 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});
function basename(p, ext) {
    utils.assertString(p, 'path');
    return _$pathBrowserify_14.basename(p.val, ext && ext.val);
}
;
basename.params = [
    'p',
    'ext'
];
module.exports = basename;
});
var _$baseConvert_30 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
(module.exports = function (num, base, width) {
    utils.assertPresent(num, 'number');
    utils.assertPresent(base, 'base');
    num = utils.unwrap(num).nodes[0].val;
    base = utils.unwrap(base).nodes[0].val;
    width = width && utils.unwrap(width).nodes[0].val || 2;
    var result = Number(num).toString(base);
    while (result.length < width) {
        result = '0' + result;
    }
    return new nodes.Literal(result);
}).raw = true;
});
var _$alpha_27 = createModuleFactory(function (module, exports) {
var nodes = _$nodes_115({})
  , rgba = _$rgba_74({});

/**
 * Return the alpha component of the given `color`,
 * or set the alpha component to the optional second `value` argument.
 *
 * Examples:
 *
 *    alpha(#fff)
 *    // => 1
 *
 *    alpha(rgba(0,0,0,0.3))
 *    // => 0.3
 *
 *    alpha(#fff, 0.5)
 *    // => rgba(255,255,255,0.5)
 *
 * @param {RGBA|HSLA} color
 * @param {Unit} [value]
 * @return {Unit|RGBA}
 * @api public
 */

function alpha(color, value){
  color = color.rgba;
  if (value) {
    return rgba(
      new nodes.Unit(color.r),
      new nodes.Unit(color.g),
      new nodes.Unit(color.b),
      value
    );
  }
  return new nodes.Unit(color.a, '');
};
alpha.params = ['color', 'value'];
module.exports = alpha;

});
var _$rgba_74 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
function rgba(red, green, blue, alpha) {
    switch (arguments.length) {
    case 1:
        utils.assertColor(red);
        return red.rgba;
    case 2:
        utils.assertColor(red);
        var color = red.rgba;
        utils.assertType(green, 'unit', 'alpha');
        alpha = green.clone();
        if ('%' == alpha.type)
            alpha.val /= 100;
        return new nodes.RGBA(color.r, color.g, color.b, alpha.val);
    default:
        utils.assertType(red, 'unit', 'red');
        utils.assertType(green, 'unit', 'green');
        utils.assertType(blue, 'unit', 'blue');
        utils.assertType(alpha, 'unit', 'alpha');
        var r = '%' == red.type ? Math.round(red.val * 2.55) : red.val, g = '%' == green.type ? Math.round(green.val * 2.55) : green.val, b = '%' == blue.type ? Math.round(blue.val * 2.55) : blue.val;
        alpha = alpha.clone();
        if (alpha && '%' == alpha.type)
            alpha.val /= 100;
        return new nodes.RGBA(r, g, b, alpha.val);
    }
}
rgba.params = [
    'red',
    'green',
    'blue',
    'alpha'
];
module.exports = rgba;
});
var _$adjust_26 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({});
function adjust(color, prop, amount) {
    utils.assertColor(color, 'color');
    utils.assertString(prop, 'prop');
    utils.assertType(amount, 'unit', 'amount');
    var hsl = color.hsla.clone();
    prop = {
        hue: 'h',
        saturation: 's',
        lightness: 'l'
    }[prop.string];
    if (!prop)
        throw new Error('invalid adjustment property');
    var val = amount.val;
    if ('%' == amount.type) {
        val = 'l' == prop && val > 0 ? (100 - hsl[prop]) * val / 100 : hsl[prop] * (val / 100);
    }
    hsl[prop] += val;
    return hsl.rgba;
}
;
adjust.params = [
    'color',
    'prop',
    'amount'
];
module.exports = adjust;
});
var _$addProperty_25 = createModuleFactory(function (module, exports) {
var utils = _$utils_146({}), nodes = _$nodes_115({});
(module.exports = function addProperty(name, expr) {
    utils.assertType(name, 'expression', 'name');
    name = utils.unwrap(name).first;
    utils.assertString(name, 'name');
    utils.assertType(expr, 'expression', 'expr');
    var prop = new nodes.Property([name], expr);
    var block = this.closestBlock;
    var len = block.nodes.length, head = block.nodes.slice(0, block.index), tail = block.nodes.slice(block.index++, len);
    head.push(prop);
    block.nodes = head.concat(tail);
    return prop;
}).raw = true;
});
var _$utils_146 = createModuleFactory(function (module, exports) {
(function (__dirname){(function (){
var nodes = _$nodes_115({}), basename = _$pathBrowserify_14.basename, relative = _$pathBrowserify_14.relative, join = _$pathBrowserify_14.join, isAbsolute = _$pathBrowserify_14.isAbsolute, fs = require("fs");
exports.absolute = isAbsolute || function (path) {
    return path.substr(0, 2) == '\\\\' || '/' === path.charAt(0) || /^[a-z]:[\\\/]/i.test(path);
};
exports.lookup = function (path, paths, ignore) {
    var lookup, i = paths.length;
    if (exports.absolute(path)) {
        try {
            fs.statSync(path);
            return path;
        } catch (err) {
        }
    }
    while (i--) {
        try {
            lookup = join(paths[i], path);
            if (ignore == lookup)
                continue;
            fs.statSync(lookup);
            return lookup;
        } catch (err) {
        }
    }
};
exports.find = function (path, paths, ignore) {
    var lookup, found, i = paths.length;
    if (exports.absolute(path)) {
        if ((found = _$glob_161.sync(path)).length) {
            return found;
        }
    }
    while (i--) {
        lookup = join(paths[i], path);
        if (ignore == lookup)
            continue;
        if ((found = _$glob_161.sync(lookup)).length) {
            return found;
        }
    }
};
exports.lookupIndex = function (name, paths, filename) {
    var found = exports.find(join(name, 'index.styl'), paths, filename);
    if (!found) {
        found = exports.find(join(name, basename(name).replace(/\.styl/i, '') + '.styl'), paths, filename);
    }
    if (!found && !~name.indexOf('node_modules')) {
        found = lookupPackage(join('node_modules', name));
    }
    return found;
    function lookupPackage(dir) {
        var pkg = exports.lookup(join(dir, 'package.json'), paths, filename);
        if (!pkg) {
            return /\.styl$/i.test(dir) ? exports.lookupIndex(dir, paths, filename) : lookupPackage(dir + '.styl');
        }
        var main = require(relative(__dirname, pkg)).main;
        if (main) {
            found = exports.find(join(dir, main), paths, filename);
        } else {
            found = exports.lookupIndex(dir, paths, filename);
        }
        return found;
    }
};
exports.formatException = function (err, options) {
    var lineno = options.lineno, column = options.column, filename = options.filename, str = options.input, context = options.context || 8, context = context / 2, lines = ('\n' + str).split('\n'), start = Math.max(lineno - context, 1), end = Math.min(lines.length, lineno + context), pad = end.toString().length;
    var context = lines.slice(start, end).map(function (line, i) {
        var curr = i + start;
        return '   ' + Array(pad - curr.toString().length + 1).join(' ') + curr + '| ' + line + (curr == lineno ? '\n' + Array(curr.toString().length + 5 + column).join('-') + '^' : '');
    }).join('\n');
    err.message = filename + ':' + lineno + ':' + column + '\n' + context + '\n\n' + err.message + '\n' + (err.stylusStack ? err.stylusStack + '\n' : '');
    if (err.fromStylus)
        err.stack = 'Error: ' + err.message;
    return err;
};
exports.assertType = function (node, type, param) {
    exports.assertPresent(node, param);
    if (node.nodeName == type)
        return;
    var actual = node.nodeName, msg = 'expected ' + (param ? '"' + param + '" to be a ' : '') + type + ', but got ' + actual + ':' + node;
    throw new Error('TypeError: ' + msg);
};
exports.assertString = function (node, param) {
    exports.assertPresent(node, param);
    switch (node.nodeName) {
    case 'string':
    case 'ident':
    case 'literal':
        return;
    default:
        var actual = node.nodeName, msg = 'expected string, ident or literal, but got ' + actual + ':' + node;
        throw new Error('TypeError: ' + msg);
    }
};
exports.assertColor = function (node, param) {
    exports.assertPresent(node, param);
    switch (node.nodeName) {
    case 'rgba':
    case 'hsla':
        return;
    default:
        var actual = node.nodeName, msg = 'expected rgba or hsla, but got ' + actual + ':' + node;
        throw new Error('TypeError: ' + msg);
    }
};
exports.assertPresent = function (node, name) {
    if (node)
        return;
    if (name)
        throw new Error('"' + name + '" argument required');
    throw new Error('argument missing');
};
exports.unwrap = function (expr) {
    if (expr.preserve)
        return expr;
    if ('arguments' != expr.nodeName && 'expression' != expr.nodeName)
        return expr;
    if (1 != expr.nodes.length)
        return expr;
    if ('arguments' != expr.nodes[0].nodeName && 'expression' != expr.nodes[0].nodeName)
        return expr;
    return exports.unwrap(expr.nodes[0]);
};
exports.coerce = function (val, raw) {
    switch (typeof val) {
    case 'function':
        return val;
    case 'string':
        return new nodes.String(val);
    case 'boolean':
        return new nodes.Boolean(val);
    case 'number':
        return new nodes.Unit(val);
    default:
        if (null == val)
            return nodes.null;
        if (Array.isArray(val))
            return exports.coerceArray(val, raw);
        if (val.nodeName)
            return val;
        return exports.coerceObject(val, raw);
    }
};
exports.coerceArray = function (val, raw) {
    var expr = new nodes.Expression();
    val.forEach(function (val) {
        expr.push(exports.coerce(val, raw));
    });
    return expr;
};
exports.coerceObject = function (obj, raw) {
    var node = raw ? new nodes.Object() : new nodes.Expression(), val;
    for (var key in obj) {
        val = exports.coerce(obj[key], raw);
        key = new nodes.Ident(key);
        if (raw) {
            node.set(key, val);
        } else {
            node.push(exports.coerceArray([
                key,
                val
            ]));
        }
    }
    return node;
};
exports.params = function (fn) {
    return fn.toString().match(/\(([^)]*)\)/)[1].split(/ *, */);
};
exports.merge = function (a, b, deep) {
    for (var k in b) {
        if (deep && a[k]) {
            var nodeA = exports.unwrap(a[k]).first, nodeB = exports.unwrap(b[k]).first;
            if ('object' == nodeA.nodeName && 'object' == nodeB.nodeName) {
                a[k].first.vals = exports.merge(nodeA.vals, nodeB.vals, deep);
            } else {
                a[k] = b[k];
            }
        } else {
            a[k] = b[k];
        }
    }
    return a;
};
exports.uniq = function (arr) {
    var obj = {}, ret = [];
    for (var i = 0, len = arr.length; i < len; ++i) {
        if (arr[i] in obj)
            continue;
        obj[arr[i]] = true;
        ret.push(arr[i]);
    }
    return ret;
};
exports.compileSelectors = function (arr, leaveHidden) {
    var selectors = [], Parser = _$selectorParser_139({}), indent = this.indent || '', buf = [];
    function parse(selector, buf) {
        var parts = [selector.val], str = new Parser(parts[0], parents, parts).parse().val, parents = [];
        if (buf.length) {
            for (var i = 0, len = buf.length; i < len; ++i) {
                parts.push(buf[i]);
                parents.push(str);
                var child = new Parser(buf[i], parents, parts).parse();
                if (child.nested) {
                    str += ' ' + child.val;
                } else {
                    str = child.val;
                }
            }
        }
        return str.trim();
    }
    function compile(arr, i) {
        if (i) {
            arr[i].forEach(function (selector) {
                if (!leaveHidden && selector.isPlaceholder)
                    return;
                if (selector.inherits) {
                    buf.unshift(selector.val);
                    compile(arr, i - 1);
                    buf.shift();
                } else {
                    selectors.push(indent + parse(selector, buf));
                }
            });
        } else {
            arr[0].forEach(function (selector) {
                if (!leaveHidden && selector.isPlaceholder)
                    return;
                var str = parse(selector, buf);
                if (str)
                    selectors.push(indent + str);
            });
        }
    }
    compile(arr, arr.length - 1);
    return exports.uniq(selectors);
};
exports.parseString = function (str) {
    var Parser = _$parser_137({}), parser, ret;
    try {
        parser = new Parser(str);
        ret = parser.list();
    } catch (e) {
        ret = new nodes.Literal(str);
    }
    return ret;
};
}).call(this)}).call(this,"/node_modules/stylus/lib")
});
var _$selectorParser_139 = createModuleFactory(function (module, exports) {
/*!
 * Stylus - Selector Parser
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

var COMBINATORS = ['>', '+', '~'];

/**
 * Initialize a new `SelectorParser`
 * with the given `str` and selectors `stack`.
 *
 * @param {String} str
 * @param {Array} stack
 * @param {Array} parts
 * @api private
 */

var SelectorParser = module.exports = function SelectorParser(str, stack, parts) {
  this.str = str;
  this.stack = stack || [];
  this.parts = parts || [];
  this.pos = 0;
  this.level = 2;
  this.nested = true;
  this.ignore = false;
};

/**
 * Consume the given `len` and move current position.
 *
 * @param {Number} len
 * @api private
 */

SelectorParser.prototype.skip = function(len) {
  this.str = this.str.substr(len);
  this.pos += len;
};

/**
 * Consume spaces.
 */

SelectorParser.prototype.skipSpaces = function() {
  while (' ' == this.str[0]) this.skip(1);
};

/**
 * Fetch next token.
 *
 * @return {String}
 * @api private
 */

SelectorParser.prototype.advance = function() {
  return this.root()
    || this.relative()
    || this.initial()
    || this.escaped()
    || this.parent()
    || this.partial()
    || this.char();
};

/**
 * '/'
 */

SelectorParser.prototype.root = function() {
  if (!this.pos && '/' == this.str[0]
    && 'deep' != this.str.slice(1, 5)) {
    this.nested = false;
    this.skip(1);
  }
};

/**
 * '../'
 */

SelectorParser.prototype.relative = function(multi) {
  if ((!this.pos || multi) && '../' == this.str.slice(0, 3)) {
    this.nested = false;
    this.skip(3);
    while (this.relative(true)) this.level++;
    if (!this.raw) {
      var ret = this.stack[this.stack.length - this.level];
      if (ret) {
        return ret;
      } else {
        this.ignore = true;
      }
    }
  }
};

/**
 * '~/'
 */

SelectorParser.prototype.initial = function() {
  if (!this.pos && '~' == this.str[0] && '/' == this.str[1]) {
    this.nested = false;
    this.skip(2);
    return this.stack[0];
  }
};

/**
 * '\' ('&' | '^')
 */

SelectorParser.prototype.escaped = function() {
  if ('\\' == this.str[0]) {
    var char = this.str[1];
    if ('&' == char || '^' == char) {
      this.skip(2);
      return char;
    }
  }
};

/**
 * '&'
 */

SelectorParser.prototype.parent = function() {
  if ('&' == this.str[0]) {
    this.nested = false;

    if (!this.pos && (!this.stack.length || this.raw)) {
      var i = 0;
      while (' ' == this.str[++i]) ;
      if (~COMBINATORS.indexOf(this.str[i])) {
        this.skip(i + 1);
        return;
      }
    }

    this.skip(1);
    if (!this.raw)
      return this.stack[this.stack.length - 1];
  }
};

/**
 * '^[' range ']'
 */

SelectorParser.prototype.partial = function() {
  if ('^' == this.str[0] && '[' == this.str[1]) {
    this.skip(2);
    this.skipSpaces();
    var ret = this.range();
    this.skipSpaces();
    if (']' != this.str[0]) return '^[';
    this.nested = false;
    this.skip(1);
    if (ret) {
      return ret;
    } else {
      this.ignore = true;
    }
  }
};

/**
 * '-'? 0-9+
 */

SelectorParser.prototype.number = function() {
  var i =  0, ret = '';
  if ('-' == this.str[i])
    ret += this.str[i++];

  while (this.str.charCodeAt(i) >= 48
    && this.str.charCodeAt(i) <= 57)
    ret += this.str[i++];

  if (ret) {
    this.skip(i);
    return Number(ret);
  }
};

/**
 * number ('..' number)?
 */

SelectorParser.prototype.range = function() {
  var start = this.number()
    , ret;

  if ('..' == this.str.slice(0, 2)) {
    this.skip(2);
    var end = this.number()
      , len = this.parts.length;

    if (start < 0) start = len + start - 1;
    if (end < 0) end = len + end - 1;

    if (start > end) {
      var tmp = start;
      start = end;
      end = tmp;
    }

    if (end < len - 1) {
      ret = this.parts.slice(start, end + 1).map(function(part) {
        var selector = new SelectorParser(part, this.stack, this.parts);
        selector.raw = true;
        return selector.parse();
      }, this).map(function(selector) {
        return (selector.nested ? ' ' : '') + selector.val;
      }).join('').trim();
    }
  } else {
    ret = this.stack[
      start < 0 ? this.stack.length + start - 1 : start
    ];
  }

  if (ret) {
    return ret;
  } else {
    this.ignore = true;
  }
};

/**
 * .+
 */

SelectorParser.prototype.char = function() {
  var char = this.str[0];
  this.skip(1);
  return char;
};

/**
 * Parses the selector.
 *
 * @return {Object}
 * @api private
 */

SelectorParser.prototype.parse = function() {
  var val = '';
  while (this.str.length) {
    val += this.advance() || '';
    if (this.ignore) {
      val = '';
      break;
    }
  }
  return { val: val.trimRight(), nested: this.nested };
};

});
var _$isBuffer_156 = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
var _$inherits_browser_155 = {};
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  _$inherits_browser_155 = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  _$inherits_browser_155 = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

var _$browser_15 = {};
// shim for using process in browser
var process = _$browser_15 = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

var _$util_157 = {};
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
_$util_157.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
_$util_157.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return _$util_157.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
_$util_157.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = _$util_157.format.apply(_$util_157, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    _$util_157._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
_$util_157.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== _$util_157.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
_$util_157.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
_$util_157.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
_$util_157.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
_$util_157.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
_$util_157.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
_$util_157.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
_$util_157.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
_$util_157.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
_$util_157.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
_$util_157.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
_$util_157.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
_$util_157.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
_$util_157.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
_$util_157.isPrimitive = isPrimitive;

_$util_157.isBuffer = _$isBuffer_156;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
_$util_157.log = function() {
  console.log('%s - %s', timestamp(), _$util_157.format.apply(_$util_157, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
_$util_157.inherits = _$inherits_browser_155;

_$util_157._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this)}).call(this,_$browser_15,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
var _$token_144 = {};

/*!
 * Stylus - Token
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var inspect = _$util_157.inspect;

/**
 * Initialize a new `Token` with the given `type` and `val`.
 *
 * @param {String} type
 * @param {Mixed} val
 * @api private
 */

var Token = _$token_144 = _$token_144 = function Token(type, val) {
  this.type = type;
  this.val = val;
};

/**
 * Custom inspect.
 *
 * @return {String}
 * @api public
 */

Token.prototype.inspect = function(){
  var val = ' ' + inspect(this.val);
  return '[Token:' + this.lineno + ':' + this.column + ' '
    + '\x1b[32m' + this.type + '\x1b[0m'
    + '\x1b[33m' + (this.val ? val : '') + '\x1b[0m'
    + ']';
};

/**
 * Return type or val.
 *
 * @return {String}
 * @api public
 */

Token.prototype.toString = function(){
  return (undefined === this.val
    ? this.type
    : this.val).toString();
};

var _$visitor_150 = {};

/*!
 * Stylus - Visitor
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Initialize a new `Visitor` with the given `root` Node.
 *
 * @param {Node} root
 * @api private
 */

var Visitor = _$visitor_150 = function Visitor(root) {
  this.root = root;
};

/**
 * Visit the given `node`.
 *
 * @param {Node|Array} node
 * @api public
 */

Visitor.prototype.visit = function(node, fn){
  var method = 'visit' + node.constructor.name;
  if (this[method]) return this[method](node);
  return node;
};



/*!
 * Stylus - units
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

// units found in http://www.w3.org/TR/css3-values

var _$units_145 = [
    'em', 'ex', 'ch', 'rem' // relative lengths
  , 'vw', 'vh', 'vmin', 'vmax' // relative viewport-percentage lengths
  , 'cm', 'mm', 'in', 'pt', 'pc', 'px' // absolute lengths
  , 'deg', 'grad', 'rad', 'turn' // angles
  , 's', 'ms' // times
  , 'Hz', 'kHz' // frequencies
  , 'dpi', 'dpcm', 'dppx', 'x' // resolutions
  , '%' // percentage type
  , 'fr' // grid-layout (http://www.w3.org/TR/css3-grid-layout/)
];

var _$stack_141 = {};

/*!
 * Stylus - Stack
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Initialize a new `Stack`.
 *
 * @api private
 */

var Stack = _$stack_141 = function Stack() {
  Array.apply(this, arguments);
};

/**
 * Inherit from `Array.prototype`.
 */

Stack.prototype.__proto__ = Array.prototype;

/**
 * Push the given `frame`.
 *
 * @param {Frame} frame
 * @api public
 */

Stack.prototype.push = function(frame){
  frame.stack = this;
  frame.parent = this.currentFrame;
  return [].push.apply(this, arguments);
};

/**
 * Return the current stack `Frame`.
 *
 * @return {Frame}
 * @api private
 */

Stack.prototype.__defineGetter__('currentFrame', function(){
  return this[this.length - 1];
});

/**
 * Lookup stack frame for the given `block`.
 *
 * @param {Block} block
 * @return {Frame}
 * @api private
 */

Stack.prototype.getBlockFrame = function(block){
  for (var i = 0; i < this.length; ++i) {
    if (block == this[i].block) {
      return this[i];
    }
  }
};

/**
 * Lookup the given local variable `name`, relative
 * to the lexical scope of the current frame's `Block`.
 *
 * When the result of a lookup is an identifier
 * a recursive lookup is performed, defaulting to
 * returning the identifier itself.
 *
 * @param {String} name
 * @return {Node}
 * @api private
 */

Stack.prototype.lookup = function(name){
  var block = this.currentFrame.block
    , val
    , ret;

  do {
    var frame = this.getBlockFrame(block);
    if (frame && (val = frame.lookup(name))) {
      return val;
    }
  } while (block = block.parent);
};

/**
 * Custom inspect.
 *
 * @return {String}
 * @api private
 */

Stack.prototype.inspect = function(){
  return this.reverse().map(function(frame){
    return frame.inspect();
  }).join('\n');
};

/**
 * Return stack string formatted as:
 *
 *   at <context> (<filename>:<lineno>:<column>)
 *
 * @return {String}
 * @api private
 */

Stack.prototype.toString = function(){
  var block
    , node
    , buf = []
    , location
    , len = this.length;

  while (len--) {
    block = this[len].block;
    if (node = block.node) {
      location = '(' + node.filename + ':' + (node.lineno + 1) + ':' + node.column + ')';
      switch (node.nodeName) {
        case 'function':
          buf.push('    at ' + node.name + '() ' + location);
          break;
        case 'group':
          buf.push('    at "' + node.nodes[0].val + '" ' + location);
          break;
      }
    }
  }

  return buf.join('\n');
};

var _$scope_142 = {};

/*!
 * Stylus - stack - Scope
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Initialize a new `Scope`.
 *
 * @api private
 */

var Scope = _$scope_142 = function Scope() {
  this.locals = {};
};

/**
 * Add `ident` node to the current scope.
 *
 * @param {Ident} ident
 * @api private
 */

Scope.prototype.add = function(ident){
  this.locals[ident.name] = ident.val;
};

/**
 * Lookup the given local variable `name`.
 *
 * @param {String} name
 * @return {Node}
 * @api private
 */

Scope.prototype.lookup = function(name){
  return hasOwnProperty(this.locals, name) ? this.locals[name] : undefined;
};

/**
 * Custom inspect.
 *
 * @return {String}
 * @api public
 */

Scope.prototype.inspect = function(){
  var keys = Object.keys(this.locals).map(function(key){ return '@' + key; });
  return '[Scope'
    + (keys.length ? ' ' + keys.join(', ') : '')
    + ']';
};

/**
 * @param {Object} obj
 * @param {String} propName
 * @returns {Boolean}
 */
function hasOwnProperty(obj, propName) {
  return Object.prototype.hasOwnProperty.call(obj, propName);
}

var _$frame_140 = {};

/*!
 * Stylus - stack - Frame
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

/* removed: var _$scope_142 = require('./scope'); */;

/**
 * Initialize a new `Frame` with the given `block`.
 *
 * @param {Block} block
 * @api private
 */

var Frame = _$frame_140 = function Frame(block) {
  this._scope = false === block.scope
    ? null
    : new _$scope_142;
  this.block = block;
};

/**
 * Return this frame's scope or the parent scope
 * for scope-less blocks.
 *
 * @return {Scope}
 * @api public
 */

Frame.prototype.__defineGetter__('scope', function(){
  return this._scope || this.parent.scope;
});

/**
 * Lookup the given local variable `name`.
 *
 * @param {String} name
 * @return {Node}
 * @api private
 */

Frame.prototype.lookup = function(name){
  return this.scope.lookup(name)
};

/**
 * Custom inspect.
 *
 * @return {String}
 * @api public
 */

Frame.prototype.inspect = function(){
  return '[Frame '
    + (false === this.block.scope
        ? 'scope-less'
        : this.scope.inspect())
    + ']';
};

var _$pathBrowserify_14 = {};
(function (process){(function (){
// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
_$pathBrowserify_14.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
_$pathBrowserify_14.normalize = function(path) {
  var isAbsolute = _$pathBrowserify_14.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
_$pathBrowserify_14.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
_$pathBrowserify_14.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return _$pathBrowserify_14.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
_$pathBrowserify_14.relative = function(from, to) {
  from = _$pathBrowserify_14.resolve(from).substr(1);
  to = _$pathBrowserify_14.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

_$pathBrowserify_14.sep = '/';
_$pathBrowserify_14.delimiter = ':';

_$pathBrowserify_14.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
_$pathBrowserify_14.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

_$pathBrowserify_14.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this)}).call(this,_$browser_15)
var _$glob_161 = {
  sync: function(path) {
    if (path === "/node_modules/stylus/lib/functions/index.styl") { return [path]; }
    //-if (path === "functions/index.styl") { return [path]; }
    return [];
  }
};

var _$base64Js_2 = {};
'use strict'

_$base64Js_2.byteLength = byteLength
_$base64Js_2.toByteArray = toByteArray
_$base64Js_2.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

var _$ieee754_12 = {};
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
_$ieee754_12.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

_$ieee754_12.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

var _$safer_16 = {};
(function (process){(function (){
/* eslint-disable node/no-deprecated-api */

'use strict'

var buffer = _$buffer_3({})
var Buffer = buffer.Buffer

var safer = {}

var key

for (key in buffer) {
  if (!buffer.hasOwnProperty(key)) continue
  if (key === 'SlowBuffer' || key === 'Buffer') continue
  safer[key] = buffer[key]
}

var Safer = safer.Buffer = {}
for (key in Buffer) {
  if (!Buffer.hasOwnProperty(key)) continue
  if (key === 'allocUnsafe' || key === 'allocUnsafeSlow') continue
  Safer[key] = Buffer[key]
}

safer.Buffer.prototype = Buffer.prototype

if (!Safer.from || Safer.from === Uint8Array.from) {
  Safer.from = function (value, encodingOrOffset, length) {
    if (typeof value === 'number') {
      throw new TypeError('The "value" argument must not be of type number. Received type ' + typeof value)
    }
    if (value && typeof value.length === 'undefined') {
      throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type ' + typeof value)
    }
    return Buffer(value, encodingOrOffset, length)
  }
}

if (!Safer.alloc) {
  Safer.alloc = function (size, fill, encoding) {
    if (typeof size !== 'number') {
      throw new TypeError('The "size" argument must be of type number. Received type ' + typeof size)
    }
    if (size < 0 || size >= 2 * (1 << 30)) {
      throw new RangeError('The value "' + size + '" is invalid for option "size"')
    }
    var buf = Buffer(size)
    if (!fill || fill.length === 0) {
      buf.fill(0)
    } else if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
    return buf
  }
}

if (!safer.kStringMaxLength) {
  try {
    safer.kStringMaxLength = process.binding('buffer').kStringMaxLength
  } catch (e) {
    // we can't determine kStringMaxLength in environments where process.binding
    // is unsupported, so let's not set it
  }
}

if (!safer.constants) {
  safer.constants = {
    MAX_LENGTH: safer.kMaxLength
  }
  if (safer.kStringMaxLength) {
    safer.constants.MAX_STRING_LENGTH = safer.kStringMaxLength
  }
}

_$safer_16 = safer

}).call(this)}).call(this,_$browser_15)
var _$sax_162 = {
  parser: function() {
    return {
      write: function() {
        return { close: function() {} };
      }
    }
  }
};

var _$pathjoin_64 = {};
/* removed: var _$pathBrowserify_14 = require('path'); */;

/**
 * Peform a path join.
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

(_$pathjoin_64 = function pathjoin(){
  var paths = [].slice.call(arguments).map(function(path){
    return path.first.string;
  });
  return _$pathBrowserify_14.join.apply(null, paths).replace(/\\/g, '/');
}).raw = true;


/**
 * Convert given value's base into the parameter unitName
 *
 * @param {Double} value
 * @param {String} unitName
 * @return {Double}
 * @api private
 */

var _$convertAngle_37 = function convertAngle(value, unitName) {
	var factors = {
		"rad" : 1,
		"deg" : 180 / Math.PI,
		"turn": 0.5 / Math.PI,
		"grad": 200 / Math.PI
	}
	return value * factors[unitName];
}


/*!
 * Stylus - colors
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

var _$colors_21 = {
    aliceblue: [240, 248, 255, 1]
  , antiquewhite: [250, 235, 215, 1]
  , aqua: [0, 255, 255, 1]
  , aquamarine: [127, 255, 212, 1]
  , azure: [240, 255, 255, 1]
  , beige: [245, 245, 220, 1]
  , bisque: [255, 228, 196, 1]
  , black: [0, 0, 0, 1]
  , blanchedalmond: [255, 235, 205, 1]
  , blue: [0, 0, 255, 1]
  , blueviolet: [138, 43, 226, 1]
  , brown: [165, 42, 42, 1]
  , burlywood: [222, 184, 135, 1]
  , cadetblue: [95, 158, 160, 1]
  , chartreuse: [127, 255, 0, 1]
  , chocolate: [210, 105, 30, 1]
  , coral: [255, 127, 80, 1]
  , cornflowerblue: [100, 149, 237, 1]
  , cornsilk: [255, 248, 220, 1]
  , crimson: [220, 20, 60, 1]
  , cyan: [0, 255, 255, 1]
  , darkblue: [0, 0, 139, 1]
  , darkcyan: [0, 139, 139, 1]
  , darkgoldenrod: [184, 134, 11, 1]
  , darkgray: [169, 169, 169, 1]
  , darkgreen: [0, 100, 0, 1]
  , darkgrey: [169, 169, 169, 1]
  , darkkhaki: [189, 183, 107, 1]
  , darkmagenta: [139, 0, 139, 1]
  , darkolivegreen: [85, 107, 47, 1]
  , darkorange: [255, 140, 0, 1]
  , darkorchid: [153, 50, 204, 1]
  , darkred: [139, 0, 0, 1]
  , darksalmon: [233, 150, 122, 1]
  , darkseagreen: [143, 188, 143, 1]
  , darkslateblue: [72, 61, 139, 1]
  , darkslategray: [47, 79, 79, 1]
  , darkslategrey: [47, 79, 79, 1]
  , darkturquoise: [0, 206, 209, 1]
  , darkviolet: [148, 0, 211, 1]
  , deeppink: [255, 20, 147, 1]
  , deepskyblue: [0, 191, 255, 1]
  , dimgray: [105, 105, 105, 1]
  , dimgrey: [105, 105, 105, 1]
  , dodgerblue: [30, 144, 255, 1]
  , firebrick: [178, 34, 34, 1]
  , floralwhite: [255, 250, 240, 1]
  , forestgreen: [34, 139, 34, 1]
  , fuchsia: [255, 0, 255, 1]
  , gainsboro: [220, 220, 220, 1]
  , ghostwhite: [248, 248, 255, 1]
  , gold: [255, 215, 0, 1]
  , goldenrod: [218, 165, 32, 1]
  , gray: [128, 128, 128, 1]
  , green: [0, 128, 0, 1]
  , greenyellow: [173, 255, 47, 1]
  , grey: [128, 128, 128, 1]
  , honeydew: [240, 255, 240, 1]
  , hotpink: [255, 105, 180, 1]
  , indianred: [205, 92, 92, 1]
  , indigo: [75, 0, 130, 1]
  , ivory: [255, 255, 240, 1]
  , khaki: [240, 230, 140, 1]
  , lavender: [230, 230, 250, 1]
  , lavenderblush: [255, 240, 245, 1]
  , lawngreen: [124, 252, 0, 1]
  , lemonchiffon: [255, 250, 205, 1]
  , lightblue: [173, 216, 230, 1]
  , lightcoral: [240, 128, 128, 1]
  , lightcyan: [224, 255, 255, 1]
  , lightgoldenrodyellow: [250, 250, 210, 1]
  , lightgray: [211, 211, 211, 1]
  , lightgreen: [144, 238, 144, 1]
  , lightgrey: [211, 211, 211, 1]
  , lightpink: [255, 182, 193, 1]
  , lightsalmon: [255, 160, 122, 1]
  , lightseagreen: [32, 178, 170, 1]
  , lightskyblue: [135, 206, 250, 1]
  , lightslategray: [119, 136, 153, 1]
  , lightslategrey: [119, 136, 153, 1]
  , lightsteelblue: [176, 196, 222, 1]
  , lightyellow: [255, 255, 224, 1]
  , lime: [0, 255, 0, 1]
  , limegreen: [50, 205, 50, 1]
  , linen: [250, 240, 230, 1]
  , magenta: [255, 0, 255, 1]
  , maroon: [128, 0, 0, 1]
  , mediumaquamarine: [102, 205, 170, 1]
  , mediumblue: [0, 0, 205, 1]
  , mediumorchid: [186, 85, 211, 1]
  , mediumpurple: [147, 112, 219, 1]
  , mediumseagreen: [60, 179, 113, 1]
  , mediumslateblue: [123, 104, 238, 1]
  , mediumspringgreen: [0, 250, 154, 1]
  , mediumturquoise: [72, 209, 204, 1]
  , mediumvioletred: [199, 21, 133, 1]
  , midnightblue: [25, 25, 112, 1]
  , mintcream: [245, 255, 250, 1]
  , mistyrose: [255, 228, 225, 1]
  , moccasin: [255, 228, 181, 1]
  , navajowhite: [255, 222, 173, 1]
  , navy: [0, 0, 128, 1]
  , oldlace: [253, 245, 230, 1]
  , olive: [128, 128, 0, 1]
  , olivedrab: [107, 142, 35, 1]
  , orange: [255, 165, 0, 1]
  , orangered: [255, 69, 0, 1]
  , orchid: [218, 112, 214, 1]
  , palegoldenrod: [238, 232, 170, 1]
  , palegreen: [152, 251, 152, 1]
  , paleturquoise: [175, 238, 238, 1]
  , palevioletred: [219, 112, 147, 1]
  , papayawhip: [255, 239, 213, 1]
  , peachpuff: [255, 218, 185, 1]
  , peru: [205, 133, 63, 1]
  , pink: [255, 192, 203, 1]
  , plum: [221, 160, 221, 1]
  , powderblue: [176, 224, 230, 1]
  , purple: [128, 0, 128, 1]
  , red: [255, 0, 0, 1]
  , rosybrown: [188, 143, 143, 1]
  , royalblue: [65, 105, 225, 1]
  , saddlebrown: [139, 69, 19, 1]
  , salmon: [250, 128, 114, 1]
  , sandybrown: [244, 164, 96, 1]
  , seagreen: [46, 139, 87, 1]
  , seashell: [255, 245, 238, 1]
  , sienna: [160, 82, 45, 1]
  , silver: [192, 192, 192, 1]
  , skyblue: [135, 206, 235, 1]
  , slateblue: [106, 90, 205, 1]
  , slategray: [112, 128, 144, 1]
  , slategrey: [112, 128, 144, 1]
  , snow: [255, 250, 250, 1]
  , springgreen: [0, 255, 127, 1]
  , steelblue: [70, 130, 180, 1]
  , tan: [210, 180, 140, 1]
  , teal: [0, 128, 128, 1]
  , thistle: [216, 191, 216, 1]
  , tomato: [255, 99, 71, 1]
  , transparent: [0, 0, 0, 0]
  , turquoise: [64, 224, 208, 1]
  , violet: [238, 130, 238, 1]
  , wheat: [245, 222, 179, 1]
  , white: [255, 255, 255, 1]
  , whitesmoke: [245, 245, 245, 1]
  , yellow: [255, 255, 0, 1]
  , yellowgreen: [154, 205, 50, 1]
  , rebeccapurple: [102, 51, 153, 1]
};

var _$debug_159 = function() {return function() {}};

function __parse_164(url) {
  return new URL(url);
}

var _$url_164 = {
  parse: __parse_164
};

var _$errors_23 = {};

/*!
 * Stylus - errors
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Expose constructors.
 */

_$errors_23.ParseError = ParseError;
_$errors_23.SyntaxError = SyntaxError;

/**
 * Initialize a new `ParseError` with the given `msg`.
 *
 * @param {String} msg
 * @api private
 */

function ParseError(msg) {
  this.name = 'ParseError';
  this.message = msg;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, ParseError);
  }
}

/**
 * Inherit from `Error.prototype`.
 */

ParseError.prototype.__proto__ = Error.prototype;

/**
 * Initialize a new `SyntaxError` with the given `msg`.
 *
 * @param {String} msg
 * @api private
 */

function SyntaxError(msg) {
  this.name = 'SyntaxError';
  this.message = msg;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, ParseError);
  }
}

/**
 * Inherit from `Error.prototype`.
 */

SyntaxError.prototype.__proto__ = Error.prototype;

var _$lexer_94 = {};

/*!
 * Stylus - Lexer
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var __nodes_94 = _$nodes_115({});

/**
 * Expose `Lexer`.
 */

_$lexer_94 = _$lexer_94 = Lexer;

/**
 * Operator aliases.
 */

var alias = {
    'and': '&&'
  , 'or': '||'
  , 'is': '=='
  , 'isnt': '!='
  , 'is not': '!='
  , ':=': '?='
};

/**
 * Initialize a new `Lexer` with the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @api private
 */

function Lexer(str, options) {
  options = options || {};
  this.stash = [];
  this.indentStack = [];
  this.indentRe = null;
  this.lineno = 1;
  this.column = 1;

  // HACK!
  function comment(str, val, offset, s) {
    var inComment = s.lastIndexOf('/*', offset) > s.lastIndexOf('*/', offset)
      , commentIdx = s.lastIndexOf('//', offset)
      , i = s.lastIndexOf('\n', offset)
      , double = 0
      , single = 0;

    if (~commentIdx && commentIdx > i) {
      while (i != offset) {
        if ("'" == s[i]) single ? single-- : single++;
        if ('"' == s[i]) double ? double-- : double++;

        if ('/' == s[i] && '/' == s[i + 1]) {
          inComment = !single && !double;
          break;
        }
        ++i;
      }
    }

    return inComment
      ? str
      : ((val === ',' && /^[,\t\n]+$/.test(str)) ? str.replace(/\n/, '\r') : val + '\r');
  };

  // Remove UTF-8 BOM.
  if ('\uFEFF' == str.charAt(0)) str = str.slice(1);

  this.str = str
    .replace(/\s+$/, '\n')
    .replace(/\r\n?/g, '\n')
    .replace(/\\ *\n/g, '\r')
    .replace(/([,(:](?!\/\/[^ ])) *(?:\/\/[^\n]*|\/\*.*?\*\/)?\n\s*/g, comment)
    .replace(/\s*\n[ \t]*([,)])/g, comment);
};

/**
 * Lexer prototype.
 */

Lexer.prototype = {

  /**
   * Custom inspect.
   */

  inspect: function(){
    var tok
      , tmp = this.str
      , buf = [];
    while ('eos' != (tok = this.next()).type) {
      buf.push(tok.inspect());
    }
    this.str = tmp;
    return buf.concat(tok.inspect()).join('\n');
  },

  /**
   * Lookahead `n` tokens.
   *
   * @param {Number} n
   * @return {Object}
   * @api private
   */

  lookahead: function(n){
    var fetch = n - this.stash.length;
    while (fetch-- > 0) this.stash.push(this.advance());
    return this.stash[--n];
  },

  /**
   * Consume the given `len`.
   *
   * @param {Number|Array} len
   * @api private
   */

  skip: function(len){
    var chunk = len[0];
    len = chunk ? chunk.length : len;
    this.str = this.str.substr(len);
    if (chunk) {
      this.move(chunk);
    } else {
      this.column += len;
    }
  },

  /**
   * Move current line and column position.
   *
   * @param {String} str
   * @api private
   */

  move: function(str){
    var lines = str.match(/\n/g)
      , idx = str.lastIndexOf('\n');

    if (lines) this.lineno += lines.length;
    this.column = ~idx
      ? str.length - idx
      : this.column + str.length;
  },

  /**
   * Fetch next token including those stashed by peek.
   *
   * @return {Token}
   * @api private
   */

  next: function() {
    var tok = this.stashed() || this.advance();
    this.prev = tok;
    return tok;
  },

  /**
   * Check if the current token is a part of selector.
   *
   * @return {Boolean}
   * @api private
   */

  isPartOfSelector: function() {
    var tok = this.stash[this.stash.length - 1] || this.prev;
    switch (tok && tok.type) {
      // #for
      case 'color':
        return 2 == tok.val.raw.length;
      // .or
      case '.':
      // [is]
      case '[':
        return true;
    }
    return false;
  },

  /**
   * Fetch next token.
   *
   * @return {Token}
   * @api private
   */

  advance: function() {
    var column = this.column
      , line = this.lineno
      , tok = this.eos()
      || this.null()
      || this.sep()
      || this.keyword()
      || this.urlchars()
      || this.comment()
      || this.newline()
      || this.escaped()
      || this.important()
      || this.literal()
      || this.anonFunc()
      || this.atrule()
      || this.function()
      || this.brace()
      || this.paren()
      || this.color()
      || this.string()
      || this.unit()
      || this.namedop()
      || this.boolean()
      || this.unicode()
      || this.ident()
      || this.op()
      || (function () {
        var token = this.eol();

        if (token) {
          column = token.column;
          line = token.lineno;
        }

        return token;
      }).call(this)
      || this.space()
      || this.selector();

    tok.lineno = line;
    tok.column = column;

    return tok;
  },

  /**
   * Lookahead a single token.
   *
   * @return {Token}
   * @api private
   */

  peek: function() {
    return this.lookahead(1);
  },

  /**
   * Return the next possibly stashed token.
   *
   * @return {Token}
   * @api private
   */

  stashed: function() {
    return this.stash.shift();
  },

  /**
   * EOS | trailing outdents.
   */

  eos: function() {
    if (this.str.length) return;
    if (this.indentStack.length) {
      this.indentStack.shift();
      return new _$token_144('outdent');
    } else {
      return new _$token_144('eos');
    }
  },

  /**
   * url char
   */

  urlchars: function() {
    var captures;
    if (!this.isURL) return;
    if (captures = /^[\/:@.;?&=*!,<>#%0-9]+/.exec(this.str)) {
      this.skip(captures);
      return new _$token_144('literal', new __nodes_94.Literal(captures[0]));
    }
  },

  /**
   * ';' [ \t]*
   */

  sep: function() {
    var captures;
    if (captures = /^;[ \t]*/.exec(this.str)) {
      this.skip(captures);
      return new _$token_144(';');
    }
  },

  /**
   * '\r'
   */

  eol: function() {
    if ('\r' == this.str[0]) {
      ++this.lineno;
      this.skip(1);

      this.column = 1;
      while(this.space());

      return this.advance();
    }
  },

  /**
   * ' '+
   */

  space: function() {
    var captures;
    if (captures = /^([ \t]+)/.exec(this.str)) {
      this.skip(captures);
      return new _$token_144('space');
    }
  },

  /**
   * '\\' . ' '*
   */

  escaped: function() {
    var captures;
    if (captures = /^\\(.)[ \t]*/.exec(this.str)) {
      var c = captures[1];
      this.skip(captures);
      return new _$token_144('ident', new __nodes_94.Literal(c));
    }
  },

  /**
   * '@css' ' '* '{' .* '}' ' '*
   */

  literal: function() {
    // HACK attack !!!
    var captures;
    if (captures = /^@css[ \t]*\{/.exec(this.str)) {
      this.skip(captures);
      var c
        , braces = 1
        , css = ''
        , node;
      while (c = this.str[0]) {
        this.str = this.str.substr(1);
        switch (c) {
          case '{': ++braces; break;
          case '}': --braces; break;
          case '\n':
          case '\r':
            ++this.lineno;
            break;
        }
        css += c;
        if (!braces) break;
      }
      css = css.replace(/\s*}$/, '');
      node = new __nodes_94.Literal(css);
      node.css = true;
      return new _$token_144('literal', node);
    }
  },

  /**
   * '!important' ' '*
   */

  important: function() {
    var captures;
    if (captures = /^!important[ \t]*/.exec(this.str)) {
      this.skip(captures);
      return new _$token_144('ident', new __nodes_94.Literal('!important'));
    }
  },

  /**
   * '{' | '}'
   */

  brace: function() {
    var captures;
    if (captures = /^([{}])/.exec(this.str)) {
      this.skip(1);
      var brace = captures[1];
      return new _$token_144(brace, brace);
    }
  },

  /**
   * '(' | ')' ' '*
   */

  paren: function() {
    var captures;
    if (captures = /^([()])([ \t]*)/.exec(this.str)) {
      var paren = captures[1];
      this.skip(captures);
      if (')' == paren) this.isURL = false;
      var tok = new _$token_144(paren, paren);
      tok.space = captures[2];
      return tok;
    }
  },

  /**
   * 'null'
   */

  null: function() {
    var captures
      , tok;
    if (captures = /^(null)\b[ \t]*/.exec(this.str)) {
      this.skip(captures);
      if (this.isPartOfSelector()) {
        tok = new _$token_144('ident', new __nodes_94.Ident(captures[0]));
      } else {
        tok = new _$token_144('null', __nodes_94.null);
      }
      return tok;
    }
  },

  /**
   *   'if'
   * | 'else'
   * | 'unless'
   * | 'return'
   * | 'for'
   * | 'in'
   */

  keyword: function() {
    var captures
      , tok;
    if (captures = /^(return|if|else|unless|for|in)\b(?!-)[ \t]*/.exec(this.str)) {
      var keyword = captures[1];
      this.skip(captures);
      if (this.isPartOfSelector()) {
        tok = new _$token_144('ident', new __nodes_94.Ident(captures[0]));
      } else {
        tok = new _$token_144(keyword, keyword);
      }
      return tok;
    }
  },

  /**
   *   'not'
   * | 'and'
   * | 'or'
   * | 'is'
   * | 'is not'
   * | 'isnt'
   * | 'is a'
   * | 'is defined'
   */

  namedop: function() {
    var captures
      , tok;
    if (captures = /^(not|and|or|is a|is defined|isnt|is not|is)(?!-)\b([ \t]*)/.exec(this.str)) {
      var op = captures[1];
      this.skip(captures);
      if (this.isPartOfSelector()) {
        tok = new _$token_144('ident', new __nodes_94.Ident(captures[0]));
      } else {
        op = alias[op] || op;
        tok = new _$token_144(op, op);
      }
      tok.space = captures[2];
      return tok;
    }
  },

  /**
   *   ','
   * | '+'
   * | '+='
   * | '-'
   * | '-='
   * | '*'
   * | '*='
   * | '/'
   * | '/='
   * | '%'
   * | '%='
   * | '**'
   * | '!'
   * | '&'
   * | '&&'
   * | '||'
   * | '>'
   * | '>='
   * | '<'
   * | '<='
   * | '='
   * | '=='
   * | '!='
   * | '!'
   * | '~'
   * | '?='
   * | ':='
   * | '?'
   * | ':'
   * | '['
   * | ']'
   * | '.'
   * | '..'
   * | '...'
   */

  op: function() {
    var captures;
    if (captures = /^([.]{1,3}|&&|\|\||[!<>=?:]=|\*\*|[-+*\/%]=?|[,=?:!~<>&\[\]])([ \t]*)/.exec(this.str)) {
      var op = captures[1];
      this.skip(captures);
      op = alias[op] || op;
      var tok = new _$token_144(op, op);
      tok.space = captures[2];
      this.isURL = false;
      return tok;
    }
  },

  /**
   * '@('
   */

  anonFunc: function() {
    var tok;
    if ('@' == this.str[0] && '(' == this.str[1]) {
      this.skip(2);
      tok = new _$token_144('function', new __nodes_94.Ident('anonymous'));
      tok.anonymous = true;
      return tok;
    }
  },

  /**
   * '@' (-(\w+)-)?[a-zA-Z0-9-_]+
   */

  atrule: function() {
    var captures;
    if (captures = /^@(?!apply)(?:-(\w+)-)?([a-zA-Z0-9-_]+)[ \t]*/.exec(this.str)) {
      this.skip(captures);
      var vendor = captures[1]
        , type = captures[2]
        , tok;
      switch (type) {
        case 'require':
        case 'import':
        case 'charset':
        case 'namespace':
        case 'media':
        case 'scope':
        case 'supports':
          return new _$token_144(type);
        case 'document':
          return new _$token_144('-moz-document');
        case 'block':
          return new _$token_144('atblock');
        case 'extend':
        case 'extends':
          return new _$token_144('extend');
        case 'keyframes':
          return new _$token_144(type, vendor);
        default:
          return new _$token_144('atrule', (vendor ? '-' + vendor + '-' + type : type));
      }
    }
  },

  /**
   * '//' *
   */

  comment: function() {
    // Single line
    if ('/' == this.str[0] && '/' == this.str[1]) {
      var end = this.str.indexOf('\n');
      if (-1 == end) end = this.str.length;
      this.skip(end);
      return this.advance();
    }

    // Multi-line
    if ('/' == this.str[0] && '*' == this.str[1]) {
      var end = this.str.indexOf('*/');
      if (-1 == end) end = this.str.length;
      var str = this.str.substr(0, end + 2)
        , lines = str.split(/\n|\r/).length - 1
        , suppress = true
        , inline = false;
      this.lineno += lines;
      this.skip(end + 2);
      // output
      if ('!' == str[2]) {
        str = str.replace('*!', '*');
        suppress = false;
      }
      if (this.prev && ';' == this.prev.type) inline = true;
      return new _$token_144('comment', new __nodes_94.Comment(str, suppress, inline));
    }
  },

  /**
   * 'true' | 'false'
   */

  boolean: function() {
    var captures;
    if (captures = /^(true|false)\b([ \t]*)/.exec(this.str)) {
      var val = __nodes_94.Boolean('true' == captures[1]);
      this.skip(captures);
      var tok = new _$token_144('boolean', val);
      tok.space = captures[2];
      return tok;
    }
  },

  /**
   * 'U+' [0-9A-Fa-f?]{1,6}(?:-[0-9A-Fa-f]{1,6})?
   */

  unicode: function() {
    var captures;
    if (captures = /^u\+[0-9a-f?]{1,6}(?:-[0-9a-f]{1,6})?/i.exec(this.str)) {
      this.skip(captures);
      return new _$token_144('literal', new __nodes_94.Literal(captures[0]));
    }
  },

  /**
   * -*[_a-zA-Z$] [-\w\d$]* '('
   */

  function: function() {
    var captures;
    if (captures = /^(-*[_a-zA-Z$][-\w\d$]*)\(([ \t]*)/.exec(this.str)) {
      var name = captures[1];
      this.skip(captures);
      this.isURL = 'url' == name;
      var tok = new _$token_144('function', new __nodes_94.Ident(name));
      tok.space = captures[2];
      return tok;
    }
  },

  /**
   * -*[_a-zA-Z$] [-\w\d$]*
   */

  ident: function() {
    var captures;
    if (captures = /^-*([_a-zA-Z$]|@apply)[-\w\d$]*/.exec(this.str)) {
      this.skip(captures);
      return new _$token_144('ident', new __nodes_94.Ident(captures[0]));
    }
  },

  /**
   * '\n' ' '+
   */

  newline: function() {
    var captures, re;

    // we have established the indentation regexp
    if (this.indentRe){
      captures = this.indentRe.exec(this.str);
    // figure out if we are using tabs or spaces
    } else {
      // try tabs
      re = /^\n([\t]*)[ \t]*/;
      captures = re.exec(this.str);

      // nope, try spaces
      if (captures && !captures[1].length) {
        re = /^\n([ \t]*)/;
        captures = re.exec(this.str);
      }

      // established
      if (captures && captures[1].length) this.indentRe = re;
    }


    if (captures) {
      var tok
        , indents = captures[1].length;

      this.skip(captures);
      if (this.str[0] === ' ' || this.str[0] === '\t') {
        throw new _$errors_23.SyntaxError('Invalid indentation. You can use tabs or spaces to indent, but not both.');
      }

      // Blank line
      if ('\n' == this.str[0]) return this.advance();

      // Outdent
      if (this.indentStack.length && indents < this.indentStack[0]) {
        while (this.indentStack.length && this.indentStack[0] > indents) {
          this.stash.push(new _$token_144('outdent'));
          this.indentStack.shift();
        }
        tok = this.stash.pop();
      // Indent
      } else if (indents && indents != this.indentStack[0]) {
        this.indentStack.unshift(indents);
        tok = new _$token_144('indent');
      // Newline
      } else {
        tok = new _$token_144('newline');
      }

      return tok;
    }
  },

  /**
   * '-'? (digit+ | digit* '.' digit+) unit
   */

  unit: function() {
    var captures;
    if (captures = /^(-)?(\d+\.\d+|\d+|\.\d+)(%|[a-zA-Z]+)?[ \t]*/.exec(this.str)) {
      this.skip(captures);
      var n = parseFloat(captures[2]);
      if ('-' == captures[1]) n = -n;
      var node = new __nodes_94.Unit(n, captures[3]);
      node.raw = captures[0];
      return new _$token_144('unit', node);
    }
  },

  /**
   * '"' [^"]+ '"' | "'"" [^']+ "'"
   */

  string: function() {
    var captures;
    if (captures = /^("[^"]*"|'[^']*')[ \t]*/.exec(this.str)) {
      var str = captures[1]
        , quote = captures[0][0];
      this.skip(captures);
      str = str.slice(1,-1).replace(/\\n/g, '\n');
      return new _$token_144('string', new __nodes_94.String(str, quote));
    }
  },

  /**
   * #rrggbbaa | #rrggbb | #rgba | #rgb | #nn | #n
   */

  color: function() {
    return this.rrggbbaa()
      || this.rrggbb()
      || this.rgba()
      || this.rgb()
      || this.nn()
      || this.n()
  },

  /**
   * #n
   */

  n: function() {
    var captures;
    if (captures = /^#([a-fA-F0-9]{1})[ \t]*/.exec(this.str)) {
      this.skip(captures);
      var n = parseInt(captures[1] + captures[1], 16)
        , color = new __nodes_94.RGBA(n, n, n, 1);
      color.raw = captures[0];
      return new _$token_144('color', color);
    }
  },

  /**
   * #nn
   */

  nn: function() {
    var captures;
    if (captures = /^#([a-fA-F0-9]{2})[ \t]*/.exec(this.str)) {
      this.skip(captures);
      var n = parseInt(captures[1], 16)
        , color = new __nodes_94.RGBA(n, n, n, 1);
      color.raw = captures[0];
      return new _$token_144('color', color);
    }
  },

  /**
   * #rgb
   */

  rgb: function() {
    var captures;
    if (captures = /^#([a-fA-F0-9]{3})[ \t]*/.exec(this.str)) {
      this.skip(captures);
      var rgb = captures[1]
        , r = parseInt(rgb[0] + rgb[0], 16)
        , g = parseInt(rgb[1] + rgb[1], 16)
        , b = parseInt(rgb[2] + rgb[2], 16)
        , color = new __nodes_94.RGBA(r, g, b, 1);
      color.raw = captures[0];
      return new _$token_144('color', color);
    }
  },

  /**
   * #rgba
   */

  rgba: function() {
    var captures;
    if (captures = /^#([a-fA-F0-9]{4})[ \t]*/.exec(this.str)) {
      this.skip(captures);
      var rgb = captures[1]
        , r = parseInt(rgb[0] + rgb[0], 16)
        , g = parseInt(rgb[1] + rgb[1], 16)
        , b = parseInt(rgb[2] + rgb[2], 16)
        , a = parseInt(rgb[3] + rgb[3], 16)
        , color = new __nodes_94.RGBA(r, g, b, a/255);
      color.raw = captures[0];
      return new _$token_144('color', color);
    }
  },

  /**
   * #rrggbb
   */

  rrggbb: function() {
    var captures;
    if (captures = /^#([a-fA-F0-9]{6})[ \t]*/.exec(this.str)) {
      this.skip(captures);
      var rgb = captures[1]
        , r = parseInt(rgb.substr(0, 2), 16)
        , g = parseInt(rgb.substr(2, 2), 16)
        , b = parseInt(rgb.substr(4, 2), 16)
        , color = new __nodes_94.RGBA(r, g, b, 1);
      color.raw = captures[0];
      return new _$token_144('color', color);
    }
  },

  /**
   * #rrggbbaa
   */

  rrggbbaa: function() {
    var captures;
    if (captures = /^#([a-fA-F0-9]{8})[ \t]*/.exec(this.str)) {
      this.skip(captures);
      var rgb = captures[1]
        , r = parseInt(rgb.substr(0, 2), 16)
        , g = parseInt(rgb.substr(2, 2), 16)
        , b = parseInt(rgb.substr(4, 2), 16)
        , a = parseInt(rgb.substr(6, 2), 16)
        , color = new __nodes_94.RGBA(r, g, b, a/255);
      color.raw = captures[0];
      return new _$token_144('color', color);
    }
  },

  /**
   * ^|[^\n,;]+
   */

  selector: function() {
    var captures;
    if (captures = /^\^|.*?(?=\/\/(?![^\[]*\])|[,\n{])/.exec(this.str)) {
      var selector = captures[0];
      this.skip(captures);
      return new _$token_144('selector', selector);
    }
  }
};

var _$tinySha1_154 = { exports: {} };
(function (global, factory) {
  typeof _$tinySha1_154.exports === 'object' && "object" !== 'undefined' ? _$tinySha1_154.exports = factory() :
  typeof define === 'function' && define.amd ? define('tiny-sha1', factory) :
  (global.sha1 = factory());
}(this, function () { 'use strict';

  var systemLittleEndian = new Uint16Array(new Uint8Array([0x7F, 0xFF]).buffer)[0] === 0xFF7F;

  function swap4(num) {
    return num >> 24 & 0xff | num >> 8 & 0xff00 | num << 8 & 0xff0000 | num << 24 & 0xff000000;
  }

  function align(address, alignment) {
    var tmp = alignment - 1;
    return address + tmp & ~tmp;
  }

  /** Convert a uint32 to an 8-character big-endian hex string. */
  function hexify(n) {
    var s = '';
    var i = 8;
    while (i--) {
      s += (n >>> (i << 2) & 0xf).toString(16);
    }
    return s;
  }

  function choice(x, y, z) {
    return x & y ^ ~x & z;
  }

  function parity(x, y, z) {
    return x ^ y ^ z;
  }

  function majority(x, y, z) {
    return x & y ^ x & z ^ y & z;
  }

  function rotateLeft(value, bits) {
    return value << bits | value >>> 32 - bits;
  }

  var w = new Uint32Array(80);

  function sha1(bytes) {
    if (!(bytes instanceof Uint8Array)) {
      throw new TypeError('Input data must be a Uint8Array.');
    }

    // Allocate a buffer to fit the message data,
    // the padding byte and the 64-bit message bit length
    var buffer = new ArrayBuffer(align(bytes.byteLength + 9, 64));
    var data = new Uint32Array(buffer);

    // Copy the message data and set the padding byte
    var dataU8 = new Uint8Array(buffer);
    dataU8.set(bytes);
    dataU8[bytes.byteLength] = 0x80;

    // Swap bytes if neeeded
    if (systemLittleEndian) {
      for (var _i = 0, len = data.length; _i < len; ++_i) {
        data[_i] = swap4(data[_i]);
      }
    }

    var bitLength = 8 * bytes.byteLength;

    // Store the message bit length as a 64-bit value
    data[data.length - 2] = bitLength / Math.pow(2, 32);
    data[data.length - 1] = bitLength;

    // Set the initial hash state
    var h0 = 0x67452301;
    var h1 = 0xefcdab89;
    var h2 = 0x98badcfe;
    var h3 = 0x10325476;
    var h4 = 0xc3d2e1f0;

    /* eslint-disable one-var, one-var-declaration-per-line */
    var i = void 0,
        a = void 0,
        b = void 0,
        c = void 0,
        d = void 0,
        e = void 0,
        tmp = void 0;

    for (var offset = 0, _len = data.length; offset < _len; offset += 16) {
      for (i = 0; i < 16; ++i) {
        w[i] = data[offset + i];
      }

      for (i = 16; i < 80; ++i) {
        w[i] = rotateLeft(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
      }

      a = h0;
      b = h1;
      c = h2;
      d = h3;
      e = h4;

      for (i = 0; i < 20; ++i) {
        tmp = rotateLeft(a, 5) + choice(b, c, d) + e + 0x5a827999 + w[i] | 0;
        e = d;
        d = c;
        c = rotateLeft(b, 30);
        b = a;
        a = tmp;
      }

      for (i = 20; i < 40; ++i) {
        tmp = rotateLeft(a, 5) + parity(b, c, d) + e + 0x6ed9eba1 + w[i] | 0;
        e = d;
        d = c;
        c = rotateLeft(b, 30);
        b = a;
        a = tmp;
      }

      for (i = 40; i < 60; ++i) {
        tmp = rotateLeft(a, 5) + majority(b, c, d) + e + 0x8f1bbcdc + w[i] | 0;
        e = d;
        d = c;
        c = rotateLeft(b, 30);
        b = a;
        a = tmp;
      }

      for (i = 60; i < 80; ++i) {
        tmp = rotateLeft(a, 5) + parity(b, c, d) + e + 0xca62c1d6 + w[i] | 0;
        e = d;
        d = c;
        c = rotateLeft(b, 30);
        b = a;
        a = tmp;
      }

      h0 = h0 + a | 0;
      h1 = h1 + b | 0;
      h2 = h2 + c | 0;
      h3 = h3 + d | 0;
      h4 = h4 + e | 0;
    }

    return '' + hexify(h0) + hexify(h1) + hexify(h2) + hexify(h3) + hexify(h4);
  }

  return sha1;

}));
//# sourceMappingURL=tiny-sha1.js.map

_$tinySha1_154 = _$tinySha1_154.exports
/* removed: const _$tinySha1_154 = require("tiny-sha1/dist/tiny-sha1.js"); */;

function createHash() {
  let data = "";
  return {update, digest};
  
  function update(_data) {
    data += _data;
  }
  
  function digest() {
    return _$tinySha1_154((new TextEncoder).encode(data));
  }
}

var _$crypto_158 = {createHash};

var _$cache_18 = {};
/**
 * Get cache object by `name`.
 *
 * @param {String|Function} name
 * @param {Object} options
 * @return {Object}
 * @api private
 */

var getCache = _$cache_18 = function(name, options){
  if ('function' == typeof name) return new name(options);

  var cache;
  switch (name){
    // case 'fs':
    //   cache = require('./fs')
    //   break;
    case 'memory':
      cache = _$memory_19({});
      break;
    default:
      cache = _$null_20({});
  }
  return new cache(options);
};

var _$eventLite_11 = { exports: {} };
/**
 * event-lite.js - Light-weight EventEmitter (less than 1KB when gzipped)
 *
 * @copyright Yusuke Kawasaki
 * @license MIT
 * @constructor
 * @see https://github.com/kawanet/event-lite
 * @see http://kawanet.github.io/event-lite/EventLite.html
 * @example
 * var EventLite = require("event-lite");
 *
 * function MyClass() {...}             // your class
 *
 * EventLite.mixin(MyClass.prototype);  // import event methods
 *
 * var obj = new MyClass();
 * obj.on("foo", function() {...});     // add event listener
 * obj.once("bar", function() {...});   // add one-time event listener
 * obj.emit("foo");                     // dispatch event
 * obj.emit("bar");                     // dispatch another event
 * obj.off("foo");                      // remove event listener
 */

function EventLite() {
  if (!(this instanceof EventLite)) return new EventLite();
}

(function(EventLite) {
  // export the class for node.js
  if ("undefined" !== "object") _$eventLite_11.exports = EventLite;

  // property name to hold listeners
  var LISTENERS = "listeners";

  // methods to export
  var methods = {
    on: on,
    once: once,
    off: off,
    emit: emit
  };

  // mixin to self
  mixin(EventLite.prototype);

  // export mixin function
  EventLite.mixin = mixin;

  /**
   * Import on(), once(), off() and emit() methods into target object.
   *
   * @function EventLite.mixin
   * @param target {Prototype}
   */

  function mixin(target) {
    for (var key in methods) {
      target[key] = methods[key];
    }
    return target;
  }

  /**
   * Add an event listener.
   *
   * @function EventLite.prototype.on
   * @param type {string}
   * @param func {Function}
   * @returns {EventLite} Self for method chaining
   */

  function on(type, func) {
    getListeners(this, type).push(func);
    return this;
  }

  /**
   * Add one-time event listener.
   *
   * @function EventLite.prototype.once
   * @param type {string}
   * @param func {Function}
   * @returns {EventLite} Self for method chaining
   */

  function once(type, func) {
    var that = this;
    wrap.originalListener = func;
    getListeners(that, type).push(wrap);
    return that;

    function wrap() {
      off.call(that, type, wrap);
      func.apply(this, arguments);
    }
  }

  /**
   * Remove an event listener.
   *
   * @function EventLite.prototype.off
   * @param [type] {string}
   * @param [func] {Function}
   * @returns {EventLite} Self for method chaining
   */

  function off(type, func) {
    var that = this;
    var listners;
    if (!arguments.length) {
      delete that[LISTENERS];
    } else if (!func) {
      listners = that[LISTENERS];
      if (listners) {
        delete listners[type];
        if (!Object.keys(listners).length) return off.call(that);
      }
    } else {
      listners = getListeners(that, type, true);
      if (listners) {
        listners = listners.filter(ne);
        if (!listners.length) return off.call(that, type);
        that[LISTENERS][type] = listners;
      }
    }
    return that;

    function ne(test) {
      return test !== func && test.originalListener !== func;
    }
  }

  /**
   * Dispatch (trigger) an event.
   *
   * @function EventLite.prototype.emit
   * @param type {string}
   * @param [value] {*}
   * @returns {boolean} True when a listener received the event
   */

  function emit(type, value) {
    var that = this;
    var listeners = getListeners(that, type, true);
    if (!listeners) return false;
    var arglen = arguments.length;
    if (arglen === 1) {
      listeners.forEach(zeroarg);
    } else if (arglen === 2) {
      listeners.forEach(onearg);
    } else {
      var args = Array.prototype.slice.call(arguments, 1);
      listeners.forEach(moreargs);
    }
    return !!listeners.length;

    function zeroarg(func) {
      func.call(that);
    }

    function onearg(func) {
      func.call(that, value);
    }

    function moreargs(func) {
      func.apply(that, args);
    }
  }

  /**
   * @ignore
   */

  function getListeners(that, type, readonly) {
    if (readonly && !that[LISTENERS]) return;
    var listeners = that[LISTENERS] || (that[LISTENERS] = {});
    return listeners[type] || (listeners[type] = []);
  }

})(EventLite);

_$eventLite_11 = _$eventLite_11.exports
/* removed: const _$eventLite_11 = require("event-lite"); */;
var _$events_160 = {
  EventEmitter: class  {
    constructor() {
      this.events = new _$eventLite_11;
    }
    on(...args) {
      return this.events.on(...args);
    }
    off(...args) {
      return this.events.off(...args);
    }
    once(...args) {
      return this.events.once(...args);
    }
    emit(...args) {
      return this.events.emit(...args);
    }
    listeners(name) {
      return this.events.listeners && this.events.listeners[name] || [];
    }
  }
};

var _$sourceMap_163 = {SourceMapGenerator: function(){}}

var _$package_153={
  "name": "stylus",
  "description": "Robust, expressive, and feature-rich CSS superset",
  "version": "0.57.0",
  "author": "TJ Holowaychuk <tj@vision-media.ca>",
  "keywords": [
    "css",
    "parser",
    "style",
    "stylesheets",
    "jade",
    "language"
  ],
  "repository": {
    "type": "git",
    "url": "git://github.com/stylus/stylus"
  },
  "main": "./index.js",
  "browserify": "./lib/browserify.js",
  "engines": {
    "node": "*"
  },
  "bin": {
    "stylus": "./bin/stylus"
  },
  "scripts": {
    "prepublish": "npm prune",
    "test": "mocha test/ test/middleware/ --require chai --bail --check-leaks --reporter dot",
    "test-cov": "mocha test/ test/middleware/ --require chai --bail --reporter html-cov > coverage.html"
  },
  "dependencies": {
    "css": "^3.0.0",
    "debug": "^4.3.2",
    "glob": "^7.1.6",
    "safer-buffer": "^2.1.2",
    "sax": "~1.2.4",
    "source-map": "^0.7.3"
  },
  "devDependencies": {
    "chai": "^4.3.6",
    "mocha": "^9.2.0"
  },
  "bugs": {
    "url": "https://github.com/stylus/stylus/issues"
  },
  "homepage": "https://github.com/stylus/stylus",
  "directories": {
    "doc": "docs",
    "example": "examples",
    "test": "test"
  },
  "license": "MIT"
}

// http://www.w3.org/TR/CSS21/grammar.html
// https://github.com/visionmedia/css-parse/pull/49#issuecomment-30088027
var commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g

var _$parse_5 = function(css, options){
  options = options || {};

  /**
   * Positional.
   */

  var lineno = 1;
  var column = 1;

  /**
   * Update lineno and column based on `str`.
   */

  function updatePosition(str) {
    var lines = str.match(/\n/g);
    if (lines) lineno += lines.length;
    var i = str.lastIndexOf('\n');
    column = ~i ? str.length - i : column + str.length;
  }

  /**
   * Mark position and patch `node.position`.
   */

  function position() {
    var start = { line: lineno, column: column };
    return function(node){
      node.position = new Position(start);
      whitespace();
      return node;
    };
  }

  /**
   * Store position information for a node
   */

  function Position(start) {
    this.start = start;
    this.end = { line: lineno, column: column };
    this.source = options.source;
  }

  /**
   * Non-enumerable source string
   */

  Position.prototype.content = css;

  /**
   * Error `msg`.
   */

  var errorsList = [];

  function error(msg) {
    var err = new Error(options.source + ':' + lineno + ':' + column + ': ' + msg);
    err.reason = msg;
    err.filename = options.source;
    err.line = lineno;
    err.column = column;
    err.source = css;

    if (options.silent) {
      errorsList.push(err);
    } else {
      throw err;
    }
  }

  /**
   * Parse stylesheet.
   */

  function stylesheet() {
    var rulesList = rules();

    return {
      type: 'stylesheet',
      stylesheet: {
        source: options.source,
        rules: rulesList,
        parsingErrors: errorsList
      }
    };
  }

  /**
   * Opening brace.
   */

  function open() {
    return match(/^{\s*/);
  }

  /**
   * Closing brace.
   */

  function close() {
    return match(/^}/);
  }

  /**
   * Parse ruleset.
   */

  function rules() {
    var node;
    var rules = [];
    whitespace();
    comments(rules);
    while (css.length && css.charAt(0) != '}' && (node = atrule() || rule())) {
      if (node !== false) {
        rules.push(node);
        comments(rules);
      }
    }
    return rules;
  }

  /**
   * Match `re` and return captures.
   */

  function match(re) {
    var m = re.exec(css);
    if (!m) return;
    var str = m[0];
    updatePosition(str);
    css = css.slice(str.length);
    return m;
  }

  /**
   * Parse whitespace.
   */

  function whitespace() {
    match(/^\s*/);
  }

  /**
   * Parse comments;
   */

  function comments(rules) {
    var c;
    rules = rules || [];
    while (c = comment()) {
      if (c !== false) {
        rules.push(c);
      }
    }
    return rules;
  }

  /**
   * Parse comment.
   */

  function comment() {
    var pos = position();
    if ('/' != css.charAt(0) || '*' != css.charAt(1)) return;

    var i = 2;
    while ("" != css.charAt(i) && ('*' != css.charAt(i) || '/' != css.charAt(i + 1))) ++i;
    i += 2;

    if ("" === css.charAt(i-1)) {
      return error('End of comment missing');
    }

    var str = css.slice(2, i - 2);
    column += 2;
    updatePosition(str);
    css = css.slice(i);
    column += 2;

    return pos({
      type: 'comment',
      comment: str
    });
  }

  /**
   * Parse selector.
   */

  function selector() {
    var m = match(/^([^{]+)/);
    if (!m) return;
    /* @fix Remove all comments from selectors
     * http://ostermiller.org/findcomment.html */
    return trim(m[0])
      .replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, '')
      .replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, function(m) {
        return m.replace(/,/g, '\u200C');
      })
      .split(/\s*(?![^(]*\)),\s*/)
      .map(function(s) {
        return s.replace(/\u200C/g, ',');
      });
  }

  /**
   * Parse declaration.
   */

  function declaration() {
    var pos = position();

    // prop
    var prop = match(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
    if (!prop) return;
    prop = trim(prop[0]);

    // :
    if (!match(/^:\s*/)) return error("property missing ':'");

    // val
    var val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);

    var ret = pos({
      type: 'declaration',
      property: prop.replace(commentre, ''),
      value: val ? trim(val[0]).replace(commentre, '') : ''
    });

    // ;
    match(/^[;\s]*/);

    return ret;
  }

  /**
   * Parse declarations.
   */

  function declarations() {
    var decls = [];

    if (!open()) return error("missing '{'");
    comments(decls);

    // declarations
    var decl;
    while (decl = declaration()) {
      if (decl !== false) {
        decls.push(decl);
        comments(decls);
      }
    }

    if (!close()) return error("missing '}'");
    return decls;
  }

  /**
   * Parse keyframe.
   */

  function keyframe() {
    var m;
    var vals = [];
    var pos = position();

    while (m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/)) {
      vals.push(m[1]);
      match(/^,\s*/);
    }

    if (!vals.length) return;

    return pos({
      type: 'keyframe',
      values: vals,
      declarations: declarations()
    });
  }

  /**
   * Parse keyframes.
   */

  function atkeyframes() {
    var pos = position();
    var m = match(/^@([-\w]+)?keyframes\s*/);

    if (!m) return;
    var vendor = m[1];

    // identifier
    var m = match(/^([-\w]+)\s*/);
    if (!m) return error("@keyframes missing name");
    var name = m[1];

    if (!open()) return error("@keyframes missing '{'");

    var frame;
    var frames = comments();
    while (frame = keyframe()) {
      frames.push(frame);
      frames = frames.concat(comments());
    }

    if (!close()) return error("@keyframes missing '}'");

    return pos({
      type: 'keyframes',
      name: name,
      vendor: vendor,
      keyframes: frames
    });
  }

  /**
   * Parse supports.
   */

  function atsupports() {
    var pos = position();
    var m = match(/^@supports *([^{]+)/);

    if (!m) return;
    var supports = trim(m[1]);

    if (!open()) return error("@supports missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@supports missing '}'");

    return pos({
      type: 'supports',
      supports: supports,
      rules: style
    });
  }

  /**
   * Parse host.
   */

  function athost() {
    var pos = position();
    var m = match(/^@host\s*/);

    if (!m) return;

    if (!open()) return error("@host missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@host missing '}'");

    return pos({
      type: 'host',
      rules: style
    });
  }

  /**
   * Parse media.
   */

  function atmedia() {
    var pos = position();
    var m = match(/^@media *([^{]+)/);

    if (!m) return;
    var media = trim(m[1]);

    if (!open()) return error("@media missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@media missing '}'");

    return pos({
      type: 'media',
      media: media,
      rules: style
    });
  }


  /**
   * Parse custom-media.
   */

  function atcustommedia() {
    var pos = position();
    var m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
    if (!m) return;

    return pos({
      type: 'custom-media',
      name: trim(m[1]),
      media: trim(m[2])
    });
  }

  /**
   * Parse paged media.
   */

  function atpage() {
    var pos = position();
    var m = match(/^@page */);
    if (!m) return;

    var sel = selector() || [];

    if (!open()) return error("@page missing '{'");
    var decls = comments();

    // declarations
    var decl;
    while (decl = declaration()) {
      decls.push(decl);
      decls = decls.concat(comments());
    }

    if (!close()) return error("@page missing '}'");

    return pos({
      type: 'page',
      selectors: sel,
      declarations: decls
    });
  }

  /**
   * Parse document.
   */

  function atdocument() {
    var pos = position();
    var m = match(/^@([-\w]+)?document *([^{]+)/);
    if (!m) return;

    var vendor = trim(m[1]);
    var doc = trim(m[2]);

    if (!open()) return error("@document missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@document missing '}'");

    return pos({
      type: 'document',
      document: doc,
      vendor: vendor,
      rules: style
    });
  }

  /**
   * Parse font-face.
   */

  function atfontface() {
    var pos = position();
    var m = match(/^@font-face\s*/);
    if (!m) return;

    if (!open()) return error("@font-face missing '{'");
    var decls = comments();

    // declarations
    var decl;
    while (decl = declaration()) {
      decls.push(decl);
      decls = decls.concat(comments());
    }

    if (!close()) return error("@font-face missing '}'");

    return pos({
      type: 'font-face',
      declarations: decls
    });
  }

  /**
   * Parse import
   */

  var atimport = _compileAtrule('import');

  /**
   * Parse charset
   */

  var atcharset = _compileAtrule('charset');

  /**
   * Parse namespace
   */

  var atnamespace = _compileAtrule('namespace');

  /**
   * Parse non-block at-rules
   */


  function _compileAtrule(name) {
    var re = new RegExp('^@' + name + '\\s*([^;]+);');
    return function() {
      var pos = position();
      var m = match(re);
      if (!m) return;
      var ret = { type: name };
      ret[name] = m[1].trim();
      return pos(ret);
    }
  }

  /**
   * Parse at rule.
   */

  function atrule() {
    if (css[0] != '@') return;

    return atkeyframes()
      || atmedia()
      || atcustommedia()
      || atsupports()
      || atimport()
      || atcharset()
      || atnamespace()
      || atdocument()
      || atpage()
      || athost()
      || atfontface();
  }

  /**
   * Parse rule.
   */

  function rule() {
    var pos = position();
    var sel = selector();

    if (!sel) return error('selector missing');
    comments();

    return pos({
      type: 'rule',
      selectors: sel,
      declarations: declarations()
    });
  }

  return addParent(stylesheet());
};

/**
 * Trim `str`.
 */

function trim(str) {
  return str ? str.replace(/^\s+|\s+$/g, '') : '';
}

/**
 * Adds non-enumerable parent node reference to each node.
 */

function addParent(obj, parent) {
  var isNode = obj && typeof obj.type === 'string';
  var childParent = isNode ? obj : parent;

  for (var k in obj) {
    var value = obj[k];
    if (Array.isArray(value)) {
      value.forEach(function(v) { addParent(v, childParent); });
    } else if (value && typeof value === 'object') {
      addParent(value, childParent);
    }
  }

  if (isNode) {
    Object.defineProperty(obj, 'parent', {
      configurable: true,
      writable: true,
      enumerable: false,
      value: parent || null
    });
  }

  return obj;
}


/**
 * Expose `Compiler`.
 */

var _$Compiler_6 = __Compiler_6;

/**
 * Initialize a compiler.
 *
 * @param {Type} name
 * @return {Type}
 * @api public
 */

function __Compiler_6(opts) {
  this.options = opts || {};
}

/**
 * Emit `str`
 */

__Compiler_6.prototype.emit = function(str) {
  return str;
};

/**
 * Visit `node`.
 */

__Compiler_6.prototype.visit = function(node){
  return this[node.type](node);
};

/**
 * Map visit over array of `nodes`, optionally using a `delim`
 */

__Compiler_6.prototype.mapVisit = function(nodes, delim){
  var buf = '';
  delim = delim || '';

  for (var i = 0, length = nodes.length; i < length; i++) {
    buf += this.visit(nodes[i]);
    if (delim && i < length - 1) buf += this.emit(delim);
  }

  return buf;
};

var _$inherits_browser_13 = {};
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  _$inherits_browser_13 = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  _$inherits_browser_13 = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}


/**
 * Module dependencies.
 */

/* removed: var _$Compiler_6 = require('./compiler'); */;
/* removed: var _$inherits_browser_13 = require('inherits'); */;

/**
 * Expose compiler.
 */

var _$Compiler_7 = __Compiler_7;

/**
 * Initialize a new `Compiler`.
 */

function __Compiler_7(options) {
  _$Compiler_6.call(this, options);
}

/**
 * Inherit from `Base.prototype`.
 */

_$inherits_browser_13(__Compiler_7, _$Compiler_6);

/**
 * Compile `node`.
 */

__Compiler_7.prototype.compile = function(node){
  return node.stylesheet
    .rules.map(this.visit, this)
    .join('');
};

/**
 * Visit comment node.
 */

__Compiler_7.prototype.comment = function(node){
  return this.emit('', node.position);
};

/**
 * Visit import node.
 */

__Compiler_7.prototype.import = function(node){
  return this.emit('@import ' + node.import + ';', node.position);
};

/**
 * Visit media node.
 */

__Compiler_7.prototype.media = function(node){
  return this.emit('@media ' + node.media, node.position)
    + this.emit('{')
    + this.mapVisit(node.rules)
    + this.emit('}');
};

/**
 * Visit document node.
 */

__Compiler_7.prototype.document = function(node){
  var doc = '@' + (node.vendor || '') + 'document ' + node.document;

  return this.emit(doc, node.position)
    + this.emit('{')
    + this.mapVisit(node.rules)
    + this.emit('}');
};

/**
 * Visit charset node.
 */

__Compiler_7.prototype.charset = function(node){
  return this.emit('@charset ' + node.charset + ';', node.position);
};

/**
 * Visit namespace node.
 */

__Compiler_7.prototype.namespace = function(node){
  return this.emit('@namespace ' + node.namespace + ';', node.position);
};

/**
 * Visit supports node.
 */

__Compiler_7.prototype.supports = function(node){
  return this.emit('@supports ' + node.supports, node.position)
    + this.emit('{')
    + this.mapVisit(node.rules)
    + this.emit('}');
};

/**
 * Visit keyframes node.
 */

__Compiler_7.prototype.keyframes = function(node){
  return this.emit('@'
    + (node.vendor || '')
    + 'keyframes '
    + node.name, node.position)
    + this.emit('{')
    + this.mapVisit(node.keyframes)
    + this.emit('}');
};

/**
 * Visit keyframe node.
 */

__Compiler_7.prototype.keyframe = function(node){
  var decls = node.declarations;

  return this.emit(node.values.join(','), node.position)
    + this.emit('{')
    + this.mapVisit(decls)
    + this.emit('}');
};

/**
 * Visit page node.
 */

__Compiler_7.prototype.page = function(node){
  var sel = node.selectors.length
    ? node.selectors.join(', ')
    : '';

  return this.emit('@page ' + sel, node.position)
    + this.emit('{')
    + this.mapVisit(node.declarations)
    + this.emit('}');
};

/**
 * Visit font-face node.
 */

__Compiler_7.prototype['font-face'] = function(node){
  return this.emit('@font-face', node.position)
    + this.emit('{')
    + this.mapVisit(node.declarations)
    + this.emit('}');
};

/**
 * Visit host node.
 */

__Compiler_7.prototype.host = function(node){
  return this.emit('@host', node.position)
    + this.emit('{')
    + this.mapVisit(node.rules)
    + this.emit('}');
};

/**
 * Visit custom-media node.
 */

__Compiler_7.prototype['custom-media'] = function(node){
  return this.emit('@custom-media ' + node.name + ' ' + node.media + ';', node.position);
};

/**
 * Visit rule node.
 */

__Compiler_7.prototype.rule = function(node){
  var decls = node.declarations;
  if (!decls.length) return '';

  return this.emit(node.selectors.join(','), node.position)
    + this.emit('{')
    + this.mapVisit(decls)
    + this.emit('}');
};

/**
 * Visit declaration node.
 */

__Compiler_7.prototype.declaration = function(node){
  return this.emit(node.property + ':' + node.value, node.position) + this.emit(';');
};



/**
 * Module dependencies.
 */

/* removed: var _$Compiler_6 = require('./compiler'); */;
/* removed: var _$inherits_browser_13 = require('inherits'); */;

/**
 * Expose compiler.
 */

var _$Compiler_8 = __Compiler_8;

/**
 * Initialize a new `Compiler`.
 */

function __Compiler_8(options) {
  options = options || {};
  _$Compiler_6.call(this, options);
  this.indentation = options.indent;
}

/**
 * Inherit from `Base.prototype`.
 */

_$inherits_browser_13(__Compiler_8, _$Compiler_6);

/**
 * Compile `node`.
 */

__Compiler_8.prototype.compile = function(node){
  return this.stylesheet(node);
};

/**
 * Visit stylesheet node.
 */

__Compiler_8.prototype.stylesheet = function(node){
  return this.mapVisit(node.stylesheet.rules, '\n\n');
};

/**
 * Visit comment node.
 */

__Compiler_8.prototype.comment = function(node){
  return this.emit(this.indent() + '/*' + node.comment + '*/', node.position);
};

/**
 * Visit import node.
 */

__Compiler_8.prototype.import = function(node){
  return this.emit('@import ' + node.import + ';', node.position);
};

/**
 * Visit media node.
 */

__Compiler_8.prototype.media = function(node){
  return this.emit('@media ' + node.media, node.position)
    + this.emit(
        ' {\n'
        + this.indent(1))
    + this.mapVisit(node.rules, '\n\n')
    + this.emit(
        this.indent(-1)
        + '\n}');
};

/**
 * Visit document node.
 */

__Compiler_8.prototype.document = function(node){
  var doc = '@' + (node.vendor || '') + 'document ' + node.document;

  return this.emit(doc, node.position)
    + this.emit(
        ' '
      + ' {\n'
      + this.indent(1))
    + this.mapVisit(node.rules, '\n\n')
    + this.emit(
        this.indent(-1)
        + '\n}');
};

/**
 * Visit charset node.
 */

__Compiler_8.prototype.charset = function(node){
  return this.emit('@charset ' + node.charset + ';', node.position);
};

/**
 * Visit namespace node.
 */

__Compiler_8.prototype.namespace = function(node){
  return this.emit('@namespace ' + node.namespace + ';', node.position);
};

/**
 * Visit supports node.
 */

__Compiler_8.prototype.supports = function(node){
  return this.emit('@supports ' + node.supports, node.position)
    + this.emit(
      ' {\n'
      + this.indent(1))
    + this.mapVisit(node.rules, '\n\n')
    + this.emit(
        this.indent(-1)
        + '\n}');
};

/**
 * Visit keyframes node.
 */

__Compiler_8.prototype.keyframes = function(node){
  return this.emit('@' + (node.vendor || '') + 'keyframes ' + node.name, node.position)
    + this.emit(
      ' {\n'
      + this.indent(1))
    + this.mapVisit(node.keyframes, '\n')
    + this.emit(
        this.indent(-1)
        + '}');
};

/**
 * Visit keyframe node.
 */

__Compiler_8.prototype.keyframe = function(node){
  var decls = node.declarations;

  return this.emit(this.indent())
    + this.emit(node.values.join(', '), node.position)
    + this.emit(
      ' {\n'
      + this.indent(1))
    + this.mapVisit(decls, '\n')
    + this.emit(
      this.indent(-1)
      + '\n'
      + this.indent() + '}\n');
};

/**
 * Visit page node.
 */

__Compiler_8.prototype.page = function(node){
  var sel = node.selectors.length
    ? node.selectors.join(', ') + ' '
    : '';

  return this.emit('@page ' + sel, node.position)
    + this.emit('{\n')
    + this.emit(this.indent(1))
    + this.mapVisit(node.declarations, '\n')
    + this.emit(this.indent(-1))
    + this.emit('\n}');
};

/**
 * Visit font-face node.
 */

__Compiler_8.prototype['font-face'] = function(node){
  return this.emit('@font-face ', node.position)
    + this.emit('{\n')
    + this.emit(this.indent(1))
    + this.mapVisit(node.declarations, '\n')
    + this.emit(this.indent(-1))
    + this.emit('\n}');
};

/**
 * Visit host node.
 */

__Compiler_8.prototype.host = function(node){
  return this.emit('@host', node.position)
    + this.emit(
        ' {\n'
        + this.indent(1))
    + this.mapVisit(node.rules, '\n\n')
    + this.emit(
        this.indent(-1)
        + '\n}');
};

/**
 * Visit custom-media node.
 */

__Compiler_8.prototype['custom-media'] = function(node){
  return this.emit('@custom-media ' + node.name + ' ' + node.media + ';', node.position);
};

/**
 * Visit rule node.
 */

__Compiler_8.prototype.rule = function(node){
  var indent = this.indent();
  var decls = node.declarations;
  if (!decls.length) return '';

  return this.emit(node.selectors.map(function(s){ return indent + s }).join(',\n'), node.position)
    + this.emit(' {\n')
    + this.emit(this.indent(1))
    + this.mapVisit(decls, '\n')
    + this.emit(this.indent(-1))
    + this.emit('\n' + this.indent() + '}');
};

/**
 * Visit declaration node.
 */

__Compiler_8.prototype.declaration = function(node){
  return this.emit(this.indent())
    + this.emit(node.property + ': ' + node.value, node.position)
    + this.emit(';');
};

/**
 * Increase, decrease or return current indentation.
 */

__Compiler_8.prototype.indent = function(level) {
  this.level = this.level || 1;

  if (null != level) {
    this.level += level;
    return '';
  }

  return Array(this.level).join(this.indentation || '  ');
};


/**
 * Module dependencies.
 */

/* removed: var _$Compiler_7 = require('./compress'); */;
/* removed: var _$Compiler_8 = require('./identity'); */;

/**
 * Stringfy the given AST `node`.
 *
 * Options:
 *
 *  - `compress` space-optimized output
 *  - `sourcemap` return an object with `.code` and `.map`
 *
 * @param {Object} node
 * @param {Object} [options]
 * @return {String}
 * @api public
 */

var _$stringify_9 = function(node, options){
  options = options || {};

  var compiler = options.compress
    ? new _$Compiler_7(options)
    : new _$Compiler_8(options);

  // source maps
  if (options.sourcemap) {
    var sourcemaps = _$sourceMapSupport_10({});
    sourcemaps(compiler);

    var code = compiler.compile(node);
    compiler.applySourceMaps();

    var map = options.sourcemap === 'generator'
      ? compiler.map
      : compiler.map.toJSON();

    return { code: code, map: map };
  }

  var code = compiler.compile(node);
  return code;
};

/*!
 * Stylus - CSS to Stylus conversion
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Convert the given `css` to Stylus source.
 *
 * @param {String} css
 * @return {String}
 * @api public
 */

var _$css_22 = function(css){
  return new Converter(css).stylus();
};

/**
 * Initialize a new `Converter` with the given `css`.
 *
 * @param {String} css
 * @api private
 */

function Converter(css) {
  var { parse } = _$css_4({});
  this.css = css;
  this.root = parse(css, { position: false });
  this.indents = 0;
}

/**
 * Convert to Stylus.
 *
 * @return {String}
 * @api private
 */

Converter.prototype.stylus = function(){
  return this.visitRules(this.root.stylesheet.rules);
};

/**
 * Return indent string.
 *
 * @return {String}
 * @api private
 */

Converter.prototype.__defineGetter__('indent', function(){
  return Array(this.indents + 1).join('  ');
});

/**
 * Visit `node`.
 *
 * @param {*} node
 * @return {String}
 * @api private
 */

Converter.prototype.visit = function(node){
  switch (node.type) {
    case 'rule':
    case 'comment':
    case 'charset':
    case 'namespace':
    case 'media':
    case 'import':
    case 'document':
    case 'keyframes':
    case 'page':
    case 'host':
    case 'supports':
      var name = node.type[0].toUpperCase() + node.type.slice(1);
      return this['visit' + name](node);
    case 'font-face':
      return this.visitFontFace(node);
  }
};

/**
 * Visit the rules on `node`.
 *
 * @param {Array} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitRules = function(node){
  var buf = '';
  for (var i = 0, len = node.length; i < len; ++i) {
    buf += this.visit(node[i]);
  }
  return buf;
};

/**
 * Visit FontFace `node`.
 *
 * @param {FontFace} node
 * @return {String}
 * @api private
 */

 Converter.prototype.visitFontFace = function(node){
   var buf = this.indent + '@font-face';
   buf += '\n';
   ++this.indents;
   for (var i = 0, len = node.declarations.length; i < len; ++i) {
     buf += this.visitDeclaration(node.declarations[i]);
   }
   --this.indents;
   return buf;
 };

/**
 * Visit Media `node`.
 *
 * @param {Media} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitMedia = function(node){
  var buf = this.indent + '@media ' + node.media;
  buf += '\n';
  ++this.indents;
  buf += this.visitRules(node.rules);
  --this.indents;
  return buf;
};

/**
 * Visit Declaration `node`.
 *
 * @param {Declaration} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitDeclaration = function(node){
  if ('comment' == node.type) {
    return this.visitComment(node);
  } else {
    var buf = this.indent + node.property + ': ' + node.value + '\n';
    return buf;
  }
};

/**
 * Visit Rule `node`.`
 *
 * @param {Rule} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitRule = function(node){
  var buf = this.indent + node.selectors.join(',\n' + this.indent) + '\n';
  ++this.indents;
  for (var i = 0, len = node.declarations.length; i < len; ++i) {
    buf += this.visitDeclaration(node.declarations[i]);
  }
  --this.indents;
  return buf + '\n';
};

/**
 * Visit Comment `node`.`
 *
 * @param {Comment} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitComment = function(node){
  var buf = this.indent + '/*' + node.comment + '*/';
  return buf + '\n';
};

/**
 * Visit Charset `node`.`
 *
 * @param {Charset} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitCharset = function(node){
  var buf = this.indent + '@charset ' + node.charset;
  return buf + '\n';
};

/**
 * Visit Namespace `node`.`
 *
 * @param {Namespace} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitNamespace = function(node){
  var buf = this.indent + '@namespace ' + node.namespace;
  return buf + '\n';
};

/**
 * Visit Import `node`.`
 *
 * @param {Import} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitImport = function(node){
  var buf = this.indent + '@import ' + node.import;
  return buf + '\n';
};

/**
 * Visit Document `node`.`
 *
 * @param {Document} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitDocument = function(node){
  var buf = this.indent + '@' + node.vendor + 'document ' + node.document;
  buf += '\n';
  ++this.indents;
  buf += this.visitRules(node.rules);
  --this.indents;
  return buf;
};

/**
 * Visit Keyframes `node`.`
 *
 * @param {Keyframes} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitKeyframes = function(node){
  var buf = this.indent + '@keyframes ' + node.name;
  buf += '\n';
  ++this.indents;
  for (var i = 0, len = node.keyframes.length; i < len; ++i) {
    buf += this.visitKeyframe(node.keyframes[i]);
  }
  --this.indents;
  return buf;
};

/**
 * Visit Keyframe `node`.`
 *
 * @param {Keyframe} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitKeyframe = function(node){
  var buf = this.indent + node.values.join(', ');
  buf += '\n';
  ++this.indents;
  for (var i = 0, len = node.declarations.length; i < len; ++i) {
    buf += this.visitDeclaration(node.declarations[i]);
  }
  --this.indents;
  return buf;
};

/**
 * Visit Page `node`.`
 *
 * @param {Page} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitPage = function(node){
  var buf = this.indent + '@page' + (node.selectors.length ? ' ' + node.selectors.join(', ') : '');
  buf += '\n';
  ++this.indents;
  for (var i = 0, len = node.declarations.length; i < len; ++i) {
    buf += this.visitDeclaration(node.declarations[i]);
  }
  --this.indents;
  return buf;
};

/**
 * Visit Supports `node`.`
 *
 * @param {Supports} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitSupports = function(node){
  var buf = this.indent + '@supports ' + node.supports;
  buf += '\n';
  ++this.indents;
  buf += this.visitRules(node.rules);
  --this.indents;
  return buf;
};

/**
 * Visit Host `node`.`
 *
 * @param {Host} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitHost = function(node){
  var buf = this.indent + '@host';
  buf += '\n';
  ++this.indents;
  buf += this.visitRules(node.rules);
  --this.indents;
  return buf;
};

/**
 * Module dependencies.
 */

var __Compiler_72 = _$compiler_147({})
  , __nodes_72 = _$nodes_115({})
  , __parse_72 = _$url_164.parse
  , __relative_72 = _$pathBrowserify_14.relative
  , __join_72 = _$pathBrowserify_14.join
  , __dirname_72 = _$pathBrowserify_14.dirname
  , __extname_72 = _$pathBrowserify_14.extname
  , __sep_72 = _$pathBrowserify_14.sep;

/**
 * Return a url() function which resolves urls.
 *
 * Options:
 *
 *    - `paths` resolution path(s), merged with general lookup paths
 *    - `nocheck` don't check file existence
 *
 * Examples:
 *
 *    stylus(str)
 *      .set('filename', __dirname + '/css/test.styl')
 *      .define('url', stylus.resolver({ nocheck: true }))
 *      .render(function(err, css){ ... })
 *
 * @param {Object} [options]
 * @return {Function}
 * @api public
 */

var _$resolver_72 = function(options) {
  options = options || {};

  function resolver(url) {
    // Compile the url
    var compiler = new __Compiler_72(url)
      , filename = url.filename;
    compiler.isURL = true;
    url = __parse_72(url.nodes.map(function(node){
      return compiler.visit(node);
    }).join(''));

    // Parse literal 
    var literal = new __nodes_72.Literal('url("' + url.href + '")')
      , path = url.pathname
      , dest = this.options.dest
      , tail = ''
      , res;

    // Absolute or hash
    if (url.protocol || !path || '/' == path[0]) return literal;

    // Check that file exists
    if (!options.nocheck) {
      var _paths = options.paths || [];
      path = _$utils_146({}).lookup(path, _paths.concat(this.paths));
      if (!path) return literal;
    }

    if (this.includeCSS && __extname_72(path) == '.css')
      return new __nodes_72.Literal(url.href);

    if (url.search) tail += url.search;
    if (url.hash) tail += url.hash;

    if (dest && __extname_72(dest) == '.css')
      dest = __dirname_72(dest);

    res = __relative_72(dest || __dirname_72(this.filename), options.nocheck
      ? __join_72(__dirname_72(filename), path)
      : path) + tail;

    if ('\\' == __sep_72) res = res.replace(/\\/g, '/');

    return new __nodes_72.Literal('url("' + res + '")');
  };

  // Expose options to Evaluator
  resolver.options = options;
  resolver.raw = true;
  return resolver;
};


var _$browserify_17 = _$stylus_143({});

var _$Tmp_1 = window.stylus = _$browserify_17;
(function(it){
  return it();
})(function(){
  (function(p, c){
    var i$, ref$, len$, n, results$ = [];
    c == null && (c = "");
    for (i$ = 0, len$ = (ref$ = p.split('/')).length; i$ < len$; ++i$) {
      n = ref$[i$];
      if (!fs.existsSync(c = c + ("/" + n))) {
        results$.push(fs.mkdirSync(c));
      }
    }
    return results$;
  })('/node_modules/stylus/lib/functions');
  return fs.writeFileSync('/node_modules/stylus/lib/functions/index.styl', "called-from = ()\n\nvendors = moz webkit o ms official\n\n// stringify the given arg\n\n-string(arg)\n  type(arg) + ' ' + arg\n\n// require a color\n\nrequire-color(color)\n  unless color is a 'color'\n    error('RGB or HSL value expected, got a ' + -string(color))\n\n// require a unit\n\nrequire-unit(n)\n  unless n is a 'unit'\n    error('unit expected, got a ' + -string(n))\n\n// require a string\n\nrequire-string(str)\n  unless str is a 'string' or str is a 'ident'\n    error('string expected, got a ' + -string(str))\n\n// Math functions\n\nabs(n) { math(n, 'abs') }\nmin(a, b) { a < b ? a : b }\nmax(a, b) { a > b ? a : b }\n\n// Trigonometrics\nPI = -math-prop('PI')\n\nradians-to-degrees(angle)\n  angle * (180 / PI)\n\ndegrees-to-radians(angle)\n  angle * (PI / 180)\n\nsin(n)\n  n = unit(n) == 'deg' ? degrees-to-radians(unit(n, '')) : unit(n, '')\n  round(math(n, 'sin'), 9)\n\ncos(n)\n  n = unit(n) == 'deg' ? degrees-to-radians(unit(n, '')) : unit(n, '')\n  round(math(n, 'cos'), 9)\n\n// Rounding Math functions\n\nceil(n, precision = 0)\n  multiplier = 10 ** precision\n  math(n * multiplier, 'ceil') / multiplier\n\nfloor(n, precision = 0)\n  multiplier = 10 ** precision\n  math(n * multiplier, 'floor') / multiplier\n\nround(n, precision = 0)\n  multiplier = 10 ** precision\n  math(n * multiplier, 'round') / multiplier\n\n// return the sum of the given numbers\n\nsum(nums)\n  sum = 0\n  sum += n for n in nums\n\n// return the average of the given numbers\n\navg(nums)\n  sum(nums) / length(nums)\n\n// return a unitless number, or pass through\n\nremove-unit(n)\n  if typeof(n) is \"unit\"\n    unit(n, \"\")\n  else\n    n\n\n// convert a percent to a decimal, or pass through\n\npercent-to-decimal(n)\n  if unit(n) is \"%\"\n    remove-unit(n) / 100\n  else\n    n\n\n// check if n is an odd number\n\nodd(n)\n  1 == n % 2\n\n// check if n is an even number\n\neven(n)\n  0 == n % 2\n\n// check if color is light\n\nlight(color)\n  lightness(color) >= 50%\n\n// check if color is dark\n\ndark(color)\n  lightness(color) < 50%\n\n// desaturate color by amount\n\ndesaturate(color, amount)\n  adjust(color, 'saturation', - amount)\n\n// saturate color by amount\n\nsaturate(color = '', amount = 100%)\n  if color is a 'color'\n    adjust(color, 'saturation', amount)\n  else\n    unquote( \"saturate(\" + color + \")\" )\n\n// darken by the given amount\n\ndarken(color, amount)\n  adjust(color, 'lightness', - amount)\n\n// lighten by the given amount\n\nlighten(color, amount)\n  adjust(color, 'lightness', amount)\n\n// decrease opacity by amount\n\nfade-out(color, amount)\n  color - rgba(black, percent-to-decimal(amount))\n\n// increase opacity by amount\n\nfade-in(color, amount)\n  color + rgba(black, percent-to-decimal(amount))\n\n// spin hue by a given amount\n\nspin(color, amount)\n  color + unit(amount, deg)\n\n// mix two colors by a given amount\n\nmix(color1, color2, weight = 50%)\n  unless weight in 0..100\n    error(\"Weight must be between 0% and 100%\")\n\n  if length(color1) == 2\n    weight = color1[0]\n    color1 = color1[1]\n\n  else if length(color2) == 2\n    weight = 100 - color2[0]\n    color2 = color2[1]\n\n  require-color(color1)\n  require-color(color2)\n\n  p = unit(weight / 100, '')\n  w = p * 2 - 1\n\n  a = alpha(color1) - alpha(color2)\n\n  w1 = (((w * a == -1) ? w : (w + a) / (1 + w * a)) + 1) / 2\n  w2 = 1 - w1\n\n  channels = (red(color1) red(color2)) (green(color1) green(color2)) (blue(color1) blue(color2))\n  rgb = ()\n\n  for pair in channels\n    push(rgb, floor(pair[0] * w1 + pair[1] * w2))\n\n  a1 = alpha(color1) * p\n  a2 = alpha(color2) * (1 - p)\n  alpha = a1 + a2\n\n  rgba(rgb[0], rgb[1], rgb[2], alpha)\n\n// invert colors, leave alpha intact\n\ninvert(color = '')\n  if color is a 'color'\n    rgba(#fff - color, alpha(color))\n  else\n    unquote( \"invert(\" + color + \")\" )\n\n// give complement of the given color\n\ncomplement( color )\n  spin( color, 180 )\n\n// give grayscale of the given color\n\ngrayscale( color = '' )\n  if color is a 'color'\n    desaturate( color, 100% )\n  else\n    unquote( \"grayscale(\" + color + \")\" )\n\n// mix the given color with white\n\ntint( color, percent )\n  mix( white, color, percent )\n\n// mix the given color with black\n\nshade( color, percent )\n  mix( black, color, percent )\n\n// return the last value in the given expr\n\nlast(expr)\n  expr[length(expr) - 1]\n\n// return keys in the given pairs or object\n\nkeys(pairs)\n  ret = ()\n  if type(pairs) == 'object'\n    for key in pairs\n      push(ret, key)\n  else\n    for pair in pairs\n      push(ret, pair[0]);\n  ret\n\n// return values in the given pairs or object\n\nvalues(pairs)\n  ret = ()\n  if type(pairs) == 'object'\n    for key, val in pairs\n      push(ret, val)\n  else\n    for pair in pairs\n      push(ret, pair[1]);\n  ret\n\n// join values with the given delimiter\n\njoin(delim, vals...)\n  buf = ''\n  vals = vals[0] if length(vals) == 1\n  for val, i in vals\n    buf += i ? delim + val : val\n\n// add a CSS rule to the containing block\n\n// - This definition allows add-property to be used as a mixin\n// - It has the same effect as interpolation but allows users\n//   to opt for a functional style\n\nadd-property-function = add-property\nadd-property(name, expr)\n  if mixin\n    {name} expr\n  else\n    add-property-function(name, expr)\n\nprefix-classes(prefix)\n  -prefix-classes(prefix, block)\n\n// Caching mixin, use inside your functions to enable caching by extending.\n\n$stylus_mixin_cache = {}\ncache()\n  $key = (current-media() or 'no-media') + '__' + called-from[0] + '__' + arguments\n  if $key in $stylus_mixin_cache\n    @extend {\"$cache_placeholder_for_\" + $stylus_mixin_cache[$key]}\n  else if 'cache' in called-from\n    {block}\n  else\n    $id = length($stylus_mixin_cache)\n\n    &,\n    /$cache_placeholder_for_{$id}\n      $stylus_mixin_cache[$key] = $id\n      {block}\n\n// Percentage function to convert a number, e.g. \".45\", into a percentage, e.g. \"45%\"\n\npercentage(num)\n  return unit(num * 100, '%')\n\n// Returns the position of a `value` within a `list`\n\nindex(list, value)\n  for val, i in list\n    return i if val == value\n");
});
}());