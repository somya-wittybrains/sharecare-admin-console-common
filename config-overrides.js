
var path = require('path');
const fs = require('fs');
const {
  override,
  addBabelPlugins,
  fixBabelImports,
  addDecoratorsLegacy,
  addLessLoader,
  adjustStyleLoaders
} = require('customize-cra');
const RewriteImportPlugin = require('less-plugin-rewrite-import');
const HtmlWebpackPlugin = require('html-webpack-plugin'); 

module.exports = function (config, env) {
  let modifiedConfig = Object.assign(
    config,
    override(addDecoratorsLegacy())(config, env)
  );

  modifiedConfig = Object.assign(
    modifiedConfig,
    override(
      fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true // change importing css to less
      })
    )(modifiedConfig, env)
  );
  /*modifiedConfig.plugins.push(
    new HtmlWebpackPlugin({
      template: path.resolve('./public/index.html')
    })
  );*/
  modifiedConfig = Object.assign(
    modifiedConfig,
    override(
      addLessLoader({
        lessOptions: {
          math: 'always',
          javascriptEnabled: true,
          // @see https://neekey.net/2016/12/09/integrate-react-webpack-with-semantic-ui-and-theming/
          paths: [__dirname, __dirname + '/node_modules'],
          plugins: [
            new RewriteImportPlugin({
              paths: {
                '../../theme.config': __dirname + '/theme-config.less'
              }
            })
          ]
        }
      })
    )(modifiedConfig, env)
  );
  modifiedConfig = Object.assign(
    modifiedConfig,
    override(
      adjustStyleLoaders(({use: [, , postcss]}) => {
        const postcssOptions = postcss.options;
        postcss.options = { postcssOptions }
      })
    )(modifiedConfig, env)
  );

  modifiedConfig.output.publicPath = '/';
  //modifiedConfig.output.filename = 'bundle.js';
  modifiedConfig = Object.assign(
    modifiedConfig,
    override(
      addBabelPlugins(
        [
          'module-resolver',
          {
            root: [path.resolve('./src')],
            alias: {}
          }
        ],
        ['@babel/plugin-proposal-export-default-from']
      )
      //,
      //addBundleVisualizer()
    )(modifiedConfig, env)
  );
  return modifiedConfig;
};

