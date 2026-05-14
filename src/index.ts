import express from "express";

const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.json());

app.get('/', (req, res)=> {
    res.send('Hello welcome to the classroom api backend!');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
