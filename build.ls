require! <[fs fs-extra livescript browserify disc uglify-js template-text terser]>
require! <[aliasify unassertify envify uglifyify browser-pack-flat tinyify]>
 
aliasify-config =
  aliases:
    "crypto": "./src/shim/crypto.js"
    "events": "./src/shim/events.js"
    "glob": "./src/shim/glob.js"
    "url": "./src/shim/url.js"
    "source-map": "./src/shim/source-map.js"
    "sax": "./src/shim/sax.js"
    "debug": "./src/shim/debug.js"
  verbose: false
  global: true

proc = (opt = {}) ->
  Promise.resolve!then ->
    b = browserify "dist/.tmp.js", { fullPaths: if opt.discify => true else false }
    b
      .transform(aliasify, aliasify-config)
      .transform(unassertify, {global: true})
      .transform(envify, {global: true})
      .exclude("source-map-resolve")
      .exclude("punycode")
      .exclude("fs")
    if !opt.discify => b.plugin("browser-pack-flat/plugin")
    b


console.log "clear up dist/ ..."
fs-extra.remove-sync "dist"
fs-extra.ensure-dir-sync "dist"
console.log "bundling stylus -> dist/index.js"
code = livescript.compile(fs.read-file-sync("src/init.ls").toString!, {bare:true, header:false})
fs.write-file-sync "dist/.tmp.js", code
proc discify: false
  .then (b) ->
    (res, rej) <- new Promise _
    (e, buf) <- b.bundle _
    if e => return rej e
    try
      baselib = (fs.read-file-sync "node_modules/stylus/lib/functions/index.styl" .toString!)
        .replace /"/g, '\\"'
        .replace /\n/g, '\\n'
      src = template-text(buf.toString!, {baselib}) #+ ";\n" + template-text(code, {baselib})
      fs.write-file-sync "dist/index.js", src
      console.log "minimize bundle file -> dist/index.min.js"
      terser.minify {"dist/index.js": src}, {compress: false, mangle: false}
        .then -> fs.write-file-sync "dist/index.min.js", it.code
        .then -> res!
        .catch (e) -> rej e
    catch e
      rej it
  .then ->
    console.log "bundle size analyzing ..."
    proc discify: true
  .then (b) ->
    (res, rej) <- new Promise _
    b.bundle!
      .pipe disc!
      .pipe fs.createWriteStream "web/static/discify/index.html"
      .once \close, ->
        res!
  .then ->
    console.log "analysis report generated in web/static/discify/index.html"
    fs-extra.remove-sync "dist/.tmp.js"
    console.log "clear up and update lib folder ( web/static/assets/lib/stylus-browser/dev/ ) ..."
    fs-extra.remove-sync "web/static/assets/lib/stylus-browser/dev/"
    fs-extra.ensure-dir-sync "web/static/assets/lib/stylus-browser/dev/"
    fs-extra.copy-sync "dist/index.js", "web/static/assets/lib/stylus-browser/dev/index.js"
    fs-extra.copy-sync "dist/index.min.js", "web/static/assets/lib/stylus-browser/dev/index.min.js"
    process.exit!
