var path = require('path');

module.exports = [
	{
		entry: './src/client/components/app.jsx',
		resolve: {
			root: path.join(__dirname, 'src'),
			modulesDirectories: ['node_modules'],
			extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx', '.json'],
		},
		output: {
			publicPath: '/static',
			path: path.join(__dirname, 'client/static'),
			filename: 'bundle.js',
		},
		module: {
			loaders: [
				{
					test: /\.js$/,
					loader: 'babel',
					exclude: /node_modules/,
					query: {
						'presets': ['es2015'],
					},

				},
				{
					test: /\.jsx$/,
					loader: 'babel',
					query: {
						'presets': ['react'],
					},
				},
			],
		},
	},
];
