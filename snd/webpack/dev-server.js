/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
var express = require('express');
var webpack = require('webpack');
var cors = require('cors');
var config = require('./dev.config');

var app = express();
var compiler = webpack(config);

app.use(cors());

app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    stats: {
        chunks: false
    },
    publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

app.listen(3000, 'localhost', function (err) {
    if (err) {
        console.log(err);
        return;
    }

    console.log('Listening at http://localhost:3000');
});
