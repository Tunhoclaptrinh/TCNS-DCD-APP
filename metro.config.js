const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Ensure packages with "exports" resolve the correct (non-node) entry.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
