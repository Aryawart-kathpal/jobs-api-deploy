require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();

// Swagger
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument =YAML.load('./swagger.yaml')

// security Packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit'); // used to limit the time and number of requests made

//connectDB
const connectDB = require('./db/connect');

const authenticateUser = require('./middleware/authentication');

// routers
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

const notFoundMiddleware= require('./middleware/not-found');
const errorHandlerMiddleware=require('./middleware/error-handler');

app.use(rateLimiter({
    windowMs:15*60*1000,// in ms
    max:100 // limit each IP to 100 requests per windowMs
}))

app.use(express.json());
// extra packages
app.use(helmet());
app.use(cors());
app.use(xss());

app.get('/',(req,res)=>{
    res.send('<h1>Jobs API</h1><a href="/api-docs">Documentation</a> ')
})

app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDocument));

//routes
app.use('/api/v1/auth',authRouter);
app.use('/api/v1/jobs',authenticateUser,jobsRouter); // as authenctication has to be firstly made for every job route

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start =async(req,res)=>{
    try {
        await connectDB(process.env.MONGO_URI);
        console.log("Successfully connected to database");
        app.listen(port,()=>console.log(`Server is listening at port ${port}...`));
    } catch (error) {
        console.log(error);
    }
}

start();