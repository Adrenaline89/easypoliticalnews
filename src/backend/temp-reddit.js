const snoowrap = require('snoowrap');
const open = require('open');

// DO NOT COMMIT THIS FILE WITH YOUR CREDENTIALS
// This is a temporary file to get the access token
const CLIENT_ID = "";
const CLIENT_SECRET = "";

const REDIRECT_URI = 'http://localhost:8080'; // Must match the one in Reddit's app settings
const SCOPES = 'read submit identity'; // Adjust as needed

const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${CLIENT_ID}&response_type=code&state=random_string&redirect_uri=${REDIRECT_URI}&duration=permanent&scope=${SCOPES}`;

console.log('Open this URL in your browser and authorize the app:', authUrl);
open(authUrl);
