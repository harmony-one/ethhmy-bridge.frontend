const paths = require('../paths');

module.exports = () => [
   {
      test: /\.(styl)$/,
      use: [
         'style-loader',
         'css-loader?modules',
         // 'css-loader',
         {
            loader: "stylus-loader", // compiles Stylus to CSS
            options: {
               preferPathResolver: 'webpack',
            }
         }
      ],
   },
   {
      test: /\.(css)$/,
      use: [
         'style-loader',
         'css-loader'
      ],
   },
   {
      test: /\.(scss)$/,
      use: [
         'style-loader',
         'css-loader',
         'sass-loader'
      ],
   }
];
