import serverless from 'serverless-http';
import app from '../../server.js';

const handler = serverless(app, {
  request(req, event, context) {
    // Fix the URL path for the Express app to find its routes correctly
    if (req.url && req.url.startsWith('/.netlify/functions/api')) {
      req.url = req.url.replace('/.netlify/functions/api', '');
    }
  }
});

export { handler };



