const { prepareProxy, prepareUrls } = require('react-dev-utils/WebpackDevServerUtils');
const paths = require('./paths');

const port = 3000;
const host = process.env.HOST || 'localhost';
const apiUrl = process.env.PROXY_API_URL || 'localhost';
const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const urls = prepareUrls(protocol, host, port);
const proxySetting = require(paths.appPackageJson).proxy;
const proxyConfig = prepareProxy(proxySetting, paths.appPublic);
const proxy = proxyConfig;
const allowedHost = urls.lanUrlForConfig;

const ignoredFiles = require('react-dev-utils/ignoredFiles');

function onProxyRes(proxyResponse) {
    if (proxyResponse.headers['set-cookie']) {
        const cookies = proxyResponse.headers['set-cookie'].map(cookie =>
            cookie.replace(/; (secure|HttpOnly|SameSite=Strict)/gi, '')
        );

        proxyResponse.headers['set-cookie'] = cookies;
    }
}

function onProxyReq(proxyResponse, req) {
    if (req.headers.cookie) {
        proxyResponse.setHeader('cookie', req.headers.cookie);
    }
}

module.exports = function() {
  return {
    stats: "errors-only",
    // disableHostCheck: !proxy ||
    //   process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true',
    disableHostCheck: true,
    compress: false,
    clientLogLevel: 'none',
    contentBase: paths.appPublic,
    watchContentBase: true,
    hot: true,
    publicPath: '/',
    watchOptions: {
      ignored: ignoredFiles(paths.appSrc),
    },
    https: protocol === 'https',
    host: host,
    port: 3000,
    overlay: false,
    historyApiFallback: {
      disableDotRule: true,
    },
    public: allowedHost,
  };
};
