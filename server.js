const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// app.use(cors({

// }));
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'https://gpa-front.vercel.app/');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.use(express.json());

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`سرور روی آدرس http://localhost:${PORT} اجرا شد.`);
});