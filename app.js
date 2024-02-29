const express = require('express');
const bodyParser = require('body-parser');

const routes = require('./routes');
const HttpError = require('./models/http-error');

require('dotenv').config();

const app = express();

app.use(bodyParser.raw({type: 'application/octet-stream'}));

app.use(routes);

app.use((req, res, next) => {
  throw new HttpError('Could not find this route.', 404);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({message: error.message || 'An unknown error occurred!'});
});

const server = app.listen(process.env.PORT || 5000, () => {
  const port = server.address().port;
  console.log(`Express is working on port ${port}`);
});
