module.exports = {
  parser: function() {
    return {
      write: function() {
        return { close: function() {} };
      }
    }
  }
};
