const express = require('express');
const app = express();
const path = require('path');

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.use(express.static(__dirname + "/"));
app.listen(8888);
