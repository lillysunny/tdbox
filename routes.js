const path = require('path');
const Dropbox = require('dropbox');
const express = require('express');
const WebTorrent = require('webtorrent');

var client = new WebTorrent();
var dbx = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN
});
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// this provides download link for downloaded files
router.get('/download', function(req, res) {
  var file = path.join(__dirname, 'public', req.query.file);
  var fileName = path.basename(file);
  console.log(`Dowloading ${fileName} ...`);
  res.download(file, fileName); // Set disposition and send it.
});

// to add torrent enter 'your_heroku_name.herokuapp.com/torAdd?magnet=magnet_link
router.get('/torAdd', function(req, res) {
  console.log('started');
  client.add(req.query.magnet, {
    path: 'public'
  }, (torrent) => {
    torrent.on('done', () => {
      console.log('torrent download finished');
      torrent.files.forEach(function(file) {
        console.log(`${file.length} ${file.path} \n`);
        // TODO: Remove URL hardcoding
        var url = encodeURI(`https://warm-reef-79245.herokuapp.com/download?file=${file.path}`);
        dbx.filesSaveUrl({
            path: `/Saves/${file.path}`,
            url: url
          })
          .then((response) => {
            // Async upload started
            if (response['.tag'] === 'async_job_id') {
              job_tag = response['async_job_id'];
              // app.io.emit('job_id', job_tag);
              console.log(`Started async upload: ${response['async_job_id']}`);
            } else if (response['.tag'] === complete) {
              console.log(response['complete']);
            }
            console.log(response);
          })
          .catch((error) => {
            console.log(error);
          });
      });
    });
  });
  res.send('downloading');
});

router.get('/status/:async_job_id', function(req, res) {
  dbx.filesSaveUrlCheckJobStatus({
      async_job_id: req.params.async_job_id
    })
    .then((response) => {
      res.send(response);
    })
    .catch((error) => {
      res.send(error);
    });
});

module.exports = router;