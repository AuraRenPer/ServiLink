module.exports = {
  resolve: {
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "vm": require.resolve("vm-browserify")
    },
    alias: {
      global: require.resolve("global")
    }
  }
};
