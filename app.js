const express = require("express");
const app=express();
const cors=require("cors")
const cookieParser=require("cookie-parser")
const morgan=require("morgan")
const userRouter=require("./router/user");
const errorMiddleware = require("./middleware/errorMiddleware");

app.use(cors({
    origin:[process.env.FRONTEND_URL],
    credentials:true
}))
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/user",userRouter);

app.use(morgan("dev"))
app.use("/ping",(req,res)=>{
    res.send("Pong")
})

// router for 3 module

app.all(/.*/,(req,res)=>{
    res.status(404).
    send("OPPS! 404 Page not found.")
})

app.use(errorMiddleware);

module.exports=app;










// const cookieParser = require("cookie-parser");
// const cors=require("cors");
 

// app.use(express.json());
// app.use(cors({
//     origin:[process.env.FRONTEND_URL],
//     credentials:true
// }))
// app.use(cookieParser());

// app.use("/ping",(req,res)=>{
//     res.send("Pong");
// })

// // router for 3 module

// app.all("*",(req,res)=>{
//     res.status(404).send("OPPS! 404 Page not found.")
// })

// module.exports=app;