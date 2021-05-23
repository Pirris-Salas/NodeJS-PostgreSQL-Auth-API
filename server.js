const express = require('express');
const app = express();
const { pool } = require('./dbConfig');

const PORT = process.env.PORT || 4000;
var auth = require('./auth/index');

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/auth', auth);

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  
  // error handler
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);

    res.json({
        message: err.message,
        error: req.app.get('env') === 'development' ? err : {}
    });

  });

  module.exports = app;