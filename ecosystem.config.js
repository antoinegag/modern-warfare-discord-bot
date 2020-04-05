module.exports = {
  apps: [
    {
      name: "MW Bot",
      script: "./src/index.js",
      max_restarts: 50,
      watch: true
    }
  ]
};
