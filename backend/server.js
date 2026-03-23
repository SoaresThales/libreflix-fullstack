const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// CONEXÃO COM O MONGODB
// ==========================================
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/libreflix";
mongoose.connect(MONGO_URL)
    .then(() => console.log("Cofre do MongoDB aberto com sucesso!"))
    .catch((error) => console.error("Erro ao conectar no MongoDB:", error));

// ==========================================
// MODELO DE DADOS (Schema)
// ==========================================
const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    year: { type: Number },
    genre: { type: String, required: true },
    plot: { type: String },
    poster: { type: String, required: true }, 
    backdrop: { type: String },               
    trailer: { type: String },
    featured: { type: Boolean, default: false }
});
const Movie = mongoose.model('Movie', movieSchema);

// ==========================================
// SEGURANÇA (Middleware)
// ==========================================
// Pega a senha com segurança extrema para não dar erro de "undefined"
const rawPassword = process.env.ADMIN_PASSWORD || "WeWillAwaysHaveParis";
const ADMIN_PASSWORD = String(rawPassword).trim();

function checkAdmin(req, res, next) {
    // O req.headers só é lido aqui dentro!
    const rawHeader = req.headers['admin-password'] || "";
    const passwordReceive = String(rawHeader).trim();

    if (passwordReceive === ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized", message: "Macaco escreveu errado!" });
    }
}

// ==========================================
// ROTAS (CRUD)
// ==========================================

// 1. LER TODOS OS FILMES
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.find(); 
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: "Erro ao abrir o cofre." });
    }
});

// 2. SALVAR FILME NOVO
app.post('/api/movies', checkAdmin, async (req, res) => {
    try {
        const newMovie = await Movie.create(req.body);
        res.status(201).json({ message: "Filme salvo no cofre!", movie: newMovie });
    } catch (error) {
        res.status(400).json({ error: "Invalid request data", details: error.message });
    }
});

// 3. DELETAR UM FILME
app.delete('/api/movies/:id', checkAdmin, async (req, res) => {
    try {
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
        if (!deletedMovie) return res.status(404).json({ error: "Filme não encontrado." });
        res.json({ message: "Filme destruído com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao tentar deletar o filme." });
    }
});

// 4. ATUALIZAR UM FILME EXISTENTE
app.patch('/api/movies/:id', checkAdmin, async (req, res) => {
    try {
        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedMovie) return res.status(404).json({ error: "Filme não encontrado." });
        res.json({ message: "Filme tunado com sucesso!", movie: updatedMovie });
    } catch (error) {
        res.status(400).json({ error: "Erro na oficina! Verifique os dados.", details: error.message });
    }
});

// 5. LER OS GÊNEROS
app.get('/api/genres', async (req, res) => {
    try {
        const genres = await Movie.distinct('genre');
        res.json(genres);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar os gêneros." });
    }
});

// ==========================================
// LIGAR O MOTOR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando perfeitamente na porta: ${PORT}`);
});