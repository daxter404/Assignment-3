import Express from 'express';
import addTranscriptServerRoutes from './transcriptServer';

// app-specific packages
import * as db from './transcriptManager';

// create the server, call it app
const app = Express();

// the port to listen on
const inputPort = process.env.PORT || 4001;

// initializes the server
function initializeServer() {
  db.initialize(); // initialize the database
  console.log('Initial list of transcripts:');
  console.log(db.getAll());
  console.log(`Express server now listening on localhost:${inputPort}`);
}

addTranscriptServerRoutes(app);

// start the server listening on 4001
app.listen(inputPort, initializeServer);
