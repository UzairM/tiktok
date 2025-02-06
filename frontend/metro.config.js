const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const { fileURLToPath } = require('url');

module.exports = (() => {
  const config = getDefaultConfig(path.dirname(fileURLToPath(import.meta.url)));
  return config;
})(); 