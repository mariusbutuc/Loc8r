/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  app_name : ['MEAN Loc8r'],
  license_key : process.env.NEW_RELIC_LICENSE_KEY,
  logging : {
    level : 'trace'
  }
};
