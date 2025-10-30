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

  return res.json(recommendations)

})

app.get("/problems", (req,res)=>{
    const problems = readDB()
    return res.json(problems)
})

app.post("/newProblem", (req,res)=>{
    const {problemName, difficulty, topics, link} = req.body

    if(!problemName || !difficulty || !topics || !link){
        console.log("test")
        return res.json({code:400, message:"There are missing fields"})
    }

    try{
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
                link,
                topics,
                lastSolved: now
            }
            problems.push(newProblem)
        }

        writeDB(problems)
        return res.json({code:201, message: "Problem added successfully."}) 
    }
    catch(error){
        console.error(error)
    }
})

app.patch("/solveProblem", (req,res)=>{
    const {problemId} = req.body
    const problems = readDB()
    const now = new Date().toISOString()
    const updatedProblem = problems.find(problem => problem.id === problemId)
    updatedProblem.lastSolved = now
    writeDB(problems)
    return res.json({code:200, message:"Problem updated successfully"})
})

app.listen(process.env.PORT || port, ()=>{
    console.log(`Server running on port: ${port}`)
})