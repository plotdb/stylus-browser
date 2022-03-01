module.exports = window.stylus = require("stylus")
<-(->it!) _
((p, c = "") ->
  for n in p.split(\/)
    if !fs.existsSync(c = c + "/#n") => fs.mkdir-sync c
) \/node_modules/stylus/lib/functions
fs.writeFileSync \/node_modules/stylus/lib/functions/index.styl, "!{baselib}"
