let path = require("path")
// HTML 模板插件
let HtmlWebpackPlugin = require("html-webpack-plugin")
// 抽离css样式
let MiniCssExtractPlugin = require("mini-css-extract-plugin")
// css压缩
let OptimizeCss = require("optimize-css-assets-webpack-plugin")
// js压缩
let UglifyjsPlugin = require("uglifyjs-webpack-plugin")

// css兼容
let postCss = require('autoprefixer')({
    "overrideBrowserslist": [
        'last 10 Chrome versions',
        'last 5 Firefox versions',
        'Safari >= 6',
        'ie > 8'
    ]
})
module.exports = {
    // 默认两种环境 production（生产环境：压缩代码） 和 development（开发环境：不压缩代码）
    mode: "development",
    // 入口
    entry: {
        index: "./src/index.js",
        // admin: "./src/admin.js"
    },
    // 出口
    output: {
        // 打包后的文件名
        filename: 'static/js/[name].js',
        //路径必须为一个绝对路径
        path: path.resolve('dist'),
        // build之后的公共路径
        publicPath: '/'
    },
    // 开启服务器设置
    devServer: {
        // 端口号
        port: 3030,
        // ip地址：localhost（本地），0.0.0.0可以访问网络地址
        // host: "192.168.1.138",
        host: "localhost",
        // 开启进度条
        progress: true,
        // 默认打开目录
        contentBase: './dist',
        // 自动打开浏览器
        open: true,
        // 启动gzip压缩
        compress: true,
        // 跨域
        proxy: {
            '/api': {
                // 被代理的地址（请求的地址）
                target: "http://vueshop.glbuys.com/api",
                // 是否跨域
                changeOrigin: true,
                pathRewrite: {
                    // 需要重写的地址
                    '^/api': ''
                }
            }
        }
    },
    // 配置插件
    plugins: [
        new HtmlWebpackPlugin({
            // 模板文件
            template: "./public/index.html",
            // 生成的文件名
            filename: "index.html",
            // 值引用index.js，解决index.html里面同时引入了index.js和admin.js的问题
            chunks: ['index'],
            // 压缩
            minify: {
                // 折叠换行
                collapseWhitespace: true,
            },
            // 生产环境下生成hash戳
            hash: true
        }),
        // new HtmlWebpackPlugin({
        //     template: "./public/admin.html",
        //     filename: "admin.html",
        //     chunks: ['admin'],
        //     minify: {
        //         collapseWhitespace: true
        //     },
        //     hash: true
        // }),
        // 抽离css插件
        new MiniCssExtractPlugin({
            filename: "static/css/main.css"
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader"
                    },
                    // css兼容性
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: [
                                postCss
                            ]
                        }
                    }
                ]
            },
            {
                // 图片loader
                test: /\.(png|jpg|gif|jpeg)$/,
                use: {
                    // file-loader加载图片，url-loader图片小于多少k用八色64
                    loader: "url-loader",
                    options: {
                        // 小于100k用base64
                        limit: 100 * 1024,
                        // build之后的目录分类
                        outputPath: './static/images'
                    }
                }
            },
            {
                test: /\.(js|jsx)$/,
                use: {
                    loader: "babel-loader",
                    
                    options: {
                        // 用babel-loader 需要把es6转为es5
                        presets: [
                            '@babel/preset-env',
                            // 增加@babel/preset-react
                            '@babel/preset-react'
                        ],
                        plugins: [
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-transform-runtime'
                        ]
                    }
                },
                // 需要转换的文件夹
                include: path.resolve(__dirname, 'src'),
                // 不需要转换的文件夹排除
                exclude: /node_modules/
            }
        ]
    },
    // 优化项启动后 mode模式代码压缩 不在生效，必须配置js压缩插件 （22行）
    optimization: {
        minimizer: [
            // 优化css
            new OptimizeCss(),
            // 压缩js
            new UglifyjsPlugin({
                // 是否用缓存
                cache: true,
                // 是否并发打包
                parallel: true,
                // es6映射es5需要用
                sourceMap: true
            })
        ]
    }
}