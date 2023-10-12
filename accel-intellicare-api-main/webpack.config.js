module.exports = (options, webpack) => {
    const lazyImports = [
        '@nestjs/microservices/microservices-module',
        '@nestjs/websockets/socket-module',
        '@nestjs/platform-express',
        'swagger-ui-express',
        'class-transformer/storage'
    ];

    const TerserPlugin = require('terser-webpack-plugin');

    return {
        ...options,
        externals: [],
        optimization: {
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        keep_classnames: true,
                    },
                }),
            ],
        },
        output: {
            ...options.output,
            libraryTarget: 'commonjs2',
        },
        plugins: [
            ...options.plugins,
            new webpack.IgnorePlugin({
                checkResource(resource) {
                    if (lazyImports.includes(resource)) {
                        try {
                            require.resolve(resource);
                        } catch (err) {
                            return true;
                        }
                    }
                    return false;
                },
            }),
        ],
    };
};