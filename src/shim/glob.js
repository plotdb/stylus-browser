module.exports = {
  sync: function(path) {
    if (path === "/node_modules/stylus/lib/functions/index.styl") { return [path]; }
    //-if (path === "functions/index.styl") { return [path]; }
    return [];
  }
};
