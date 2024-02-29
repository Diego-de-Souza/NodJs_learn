//import http from 'http';
import "dotenv/config";
import app from "./src/app.js";

const PORT = 3000;

/*
const server = http.createServer((req,res) => {
    res.writeHead(200, {"content-type": "text/plain"});
    res.end(rotas[req.url]);
})
*/
app.listen(PORT, ()=>{
  console.log("servidor escutando!");
});

//mongodb+srv://admin:<password>@cluster0.6ek5eif.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
