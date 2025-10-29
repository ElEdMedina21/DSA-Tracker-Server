import express from "express"
import morgan from "morgan"
import fs from "fs"
import cors from "cors"

const app = express()
const DB_PATH = "./problemDB.json"
const port = 3000

app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(morgan("dev"))
app.use(cors({
    origin: "http://localhost:5173"
}))

function readDB(){
    const data = fs.readFileSync(DB_PATH, "utf-8")
    return JSON.parse(data)
}

function writeDB(data){
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

app.post("/newProblem", async(req,res)=>{
    const db = readDB()
    console.log(req.body)
})

app.listen(process.env.PORT || port, ()=>{
    console.log(`Server running on port: ${port}`)
})