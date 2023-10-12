'use strict';
const aws = require('aws-sdk');
const https = require('https');

const { API_URL, PARAMS_ENV } = process.env;

module.exports.handler = async (event, context, callback) => {
  
  var key = event.Records[0].s3.object.key;
  var type = key.split('.');
  var endPoint = '';

  console.log('DATA_RESPONSE: ', JSON.stringify(event));
  console.log('KEY_DATA: ', key);
  console.log('TYPE: ', type[1]);
  console.log('CONTEXT: ', context);
  console.log('CALLBACK: ', callback);
  console.log('Test Log');

  if(type[1] === 'mp3' || type[1].indexOf('m4a') !== -1 || type[1].indexOf('wav') !== -1){
    endPoint = API_URL+'media/v1/api/start-transcription-media/'+key.replace('media/', '');
  }else if(type[1] === 'json'){
    endPoint = API_URL+'media/v1/api/store-transcription-media/'+key.replace('transcriptions/medical/', '');
  }else if(type[1] === 'mkv'){
    endPoint = API_URL+'media/v1/api/composition/'+key;
  }else if(type[1] === 'mp4'){
    endPoint = API_URL+'media/v1/api/convert-media-file/'+key.replace('compositions/', '');
  }else{
    return;
  }
  console.log('PARAMS_ENV: ', PARAMS_ENV);
  console.log('API_URL: ', API_URL);
  console.log('ENDPOINT: ', endPoint);

  return new Promise((resolve, reject) => {
    const req = https.get(endPoint, res => {
      let rawData = '';

      res.on('data', chunk => {
        rawData += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(rawData));
        } catch (err) {
          reject(new Error(err));
        }
      });
    });

    req.on('error', err => {
      reject(new Error(err));
    });
  });
};
