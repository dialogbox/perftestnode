var express = require('express')
var http = require('http')
var morgan = require('morgan')

var app = express()

var port = process.argv[2] || 3000
var host = process.argv[3] || '127.0.0.1'

function getMedian(args) {
  if (!args.length) {return 0};
  var numbers = args.slice(0).sort((a,b) => a - b);
  var middle = Math.floor(numbers.length / 2);
  var isEven = numbers.length % 2 === 0;
  return isEven ? (numbers[middle] + numbers[middle - 1]) / 2 : numbers[middle];
}

function last(args) {
  return args[args.length-1]
}

function makeData(sample_size) {
  l = new Array(sample_size)

  for (i = 0; i < sample_size; i++) {
    l[i] = Math.random()
  }

  return l
}

app.use(morgan('combined'))

app.get('/gen/:sample_size', function (req, res) {
  var l = makeData(req.params.sample_size)
  res.send({Data: l})
})

app.get('/get/:sample_size?', function (req, res) {
  var sample_size = req.params.sample_size || 100
  var l = makeData(sample_size, false)

  var server = http.get({
    host: host,
    port: port,
    path: '/gen/' + sample_size
  }, function(response) {
    let rawData = ''
    response.on('data', (d) => rawData += d)
    response.on('end', () => {
      let body = JSON.parse(rawData)
      // var m = getMedian(body.Data)
      var m = last(body.Data)
      res.send({SampleSize: sample_size, Median: m})
    })
  })
})

app.listen(port, host, function () {
  console.log('Example app listening on http://%s:%d!', host, port)
})
