var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var authUtils = require('./authUtils.js');
const Promise = require('bluebird');
const bcrypt = require('bcryptjs')
Promise.promisifyAll(bcrypt);
Promise.promisifyAll(authUtils);


var app = express();


app.use(express.static(__dirname + '/../client/dist'));
app.use(bodyParser.json());

/// DEPRECATED


// app.get('/items', function (req, res) {
//   items.selectAll(function (err, data) {
//     if (err) {
//       res.sendStatus(500);
//     } else {
//       res.send(data);
//     }
//   });

// });

app.post('/signup', (req, res)=>{
  authUtils.isAlreadyUserAsync(req.body.userName)
  .then(()=>{
    return bcrypt.genSaltAsync(10)
  })
  .then(salt=>{
    return bcrypt.hashAsync(req.body.password, salt)
  })
  .then(hashedPassword=>{
    return authUtils.storeUserInDBAsync(req.body.userName, hashedPassword) 
  })
  .then(user=>{
    res.status(201);
    res.end()
  })
  .catch((err)=>{
    console.log('this has been an error ', err)
    res.status(404);
    res.end()
  })
})



app.get('/foods', function (req, res) {
  //the below is some code I've added in to verify the client get request works
  //*********************TestCode************************//
  //console.log('this should be the body ', req.url)

  //res.send('this is data from the server')
  //res.status(200)
  //********************TestCode*************************//
  console.log(req.query.userFood);

  var options = {
    method: 'POST',
    url: 'https://trackapi.nutritionix.com/v2/natural/nutrients',
    headers: {
      'content-type': 'application/json',
      'x-app-key': '599e301928d15020ff16d7dbeef77f6f',
      'x-app-id': '9e058c76'
    },
    sort: {
      order: '_score'
    },
    //offset: 0,
    limit: 5,

    body: {
      query: req.query.userFood,
      timezone: 'US/Eastern'
    },
    json: true
  };

  request(options, function (error, response, body) {
    if (error) {
      console.log('here in error');
      throw new Error(error);
    } else {
      res.status(200);
      console.log(body.foods);
      res.send(body.foods);
      res.end();

    }

  });
});


app.listen(3000, function () {
  console.log('listening on port 3000!');
});