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

app.get("/recommendations", async(req,res)=>{
    const problems = readDB()

    const now = new Date();

    const recommendations = problems.filter(problem => {
    const lastSolved = new Date(problem.lastSolved);
    const daysSinceSolved = (now - lastSolved) / (1000 * 60 * 60 * 24);

    if (problem.difficulty === "easy") return daysSinceSolved >= 4;
    if (problem.difficulty === "medium") return daysSinceSolved >= 3;
    if (problem.difficulty === "hard") return daysSinceSolved >= 7;
  });

  console.log(recommendations)

  return res.json(recommendations)

})

app.get("/problems", async(req,res)=>{
    const problems = readDB()
    return res.json(problems)
})

app.post("/newProblem", async(req,res)=>{
    const {problemName, difficulty, topics, link} = req.body

    if(!problemName || !difficulty || !topics || !link){
        return res.json({code:400, message:"There are missing fields"})
    }

    const problems = readDB()
    const now = new Date().toISOString();
    const existing = problems.find(p => p.problemName === problemName)

    if(existing){
        existing.lastSolved = now
    }
    else{
        const newProblem = {
            id: problems.length ? problems.at(-1).id + 1 : 1,
            problemName,
            difficulty,
            lastSolved: now
        }
        problems.push(newProblem)
    }

    writeDB(problems)
    return res.json({code:201, message: "Problem added successfully."})
})

app.listen(process.env.PORT || port, ()=>{
    console.log(`Server running on port: ${port}`)
})