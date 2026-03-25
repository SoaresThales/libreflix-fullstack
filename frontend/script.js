// ==============================
// Data Base (DB)
// ==============================

let movies = []; //nasce vazio e espera o back-end

async function loadMoviesFromAPI() {
    try {
        let response = await fetch('/api/movies');  // O Front-end faz o pedido para a URL através do proxy Nginx
        movies = await response.json(); // Traduz o JSON de volta
        console.log("✅ Sucesso! O Front-end puxou os filmes do Node.js!", movies);
        loadFeaturedMovie();
        loadCatalog();
    } catch (error) {        
        console.error("❌ Erro ao conectar no servidor:", error); // Se o servidor estiver desligado, ele avisa aqui
    } finally {
        const preloader = document.getElementById('preloader');
        if (preloader) preloader.classList.add('fade-out');
    }
}

loadMoviesFromAPI(); // Dá a partida assim que o script é carregado!

// ==============================
// LIBREFLIX ENGINE
// ==============================

function loadFeaturedMovie() {
    let featuredMovie = movies.find(function(movie) {
        return movie.featured === true;
    });

    if (featuredMovie === undefined) {
        console.log("Erro: Nenhum filme marcado como destaque no banco de dados.");
        return; // Para a execução aqui
    }

    let heroSection = document.getElementById('featured-movie');
    let titleElement = document.getElementById('featured-title');
    let plotElement = document.getElementById('featured-plot');

    titleElement.textContent = featuredMovie.title;
    plotElement.textContent = featuredMovie.plot;

    heroSection.style.backgroundImage = "url('" + featuredMovie.backdrop + "')";

    let infoBtn = document.getElementById('more-info-btn');    
    infoBtn.onclick = function() {
        openModal(featuredMovie._id);
    };

    let heroPlayBtn = document.getElementById('hero-play-btn');
    
    heroPlayBtn.onclick = function() {
        openModal(featuredMovie._id, true); // Passa 'true' para tocar direto
    };
}

// ==============================
// CAROUSEL
// ==============================

function loadCatalog() {
    // 1. declaração dos sliders
    const allMoviesSlider = document.getElementById('all-movies-slider');
    const animationSlider = document.getElementById('animation-slider');
    const scifiSlider = document.getElementById('scifi-slider');
    const horrorSlider = document.getElementById('horror-slider');

    // 2. evitar duplicatas
    allMoviesSlider.innerHTML = "";
    animationSlider.innerHTML = "";
    scifiSlider.innerHTML = "";
    if (horrorSlider) horrorSlider.innerHTML = ""; // Só limpa se o elemento existir no HTML

    // 3. A função buildPosters
    function buildPosters(movieList, targetSlider) {
        if (!targetSlider) return; // Segurança: se a prateleira não existir no HTML, não faz nada
        
        for (let i = 0; i < movieList.length; i++) {
            const movie = movieList[i];
            let posterHtml = `
                <img src="${movie.poster}" 
                     alt="${movie.title}" 
                     class="movie-poster" 
                     onclick="openModal('${movie._id}')">`;
            targetSlider.innerHTML += posterHtml;
        }
    }

    // 4. filtragem e distribuição
    
    // Prateleira 1: Todos
    buildPosters(movies, allMoviesSlider);

    // Prateleira 2: Animation
    let animations = movies.filter(movie => movie.genre === "Animation" && !movie.featured);
    buildPosters(animations, animationSlider);

    // Prateleira 3: Sci-Fi
    let scifiMovies = movies.filter(movie => movie.genre === "Sci-Fi" && !movie.featured);
    buildPosters(scifiMovies, scifiSlider);

    // Prateleira 4: Horror
    let horrorMovies = movies.filter(movie => movie.genre === "Horror");
    buildPosters(horrorMovies, horrorSlider);
}

// ==============================
// MODAL (JANELA FLUTUANTE)
// ==============================

function openModal(idDoFilmeClicado, autoPlayVideo = false) {
    let movieDetails = movies.find(function(movie) {
        return movie._id === idDoFilmeClicado; 
    });

    let modal = document.getElementById('movie-modal');
    let modalTitle = document.getElementById('modal-title');
    let modalPlot = document.getElementById('modal-plot');
    let modalBackdrop = document.getElementById('modal-backdrop');
    let modalVideo = document.getElementById('modal-video');
    let playBtn = document.getElementById('modal-play-btn');
    let modalInfoBox = document.getElementById('modal-info-box');

    // 1. Limpeza e Formatação Robusta da URL
    let videoUrl = movieDetails.trailer || "";
    
    // Converte links normais do YT e links curtos (youtu.be) para EMBED
    if (videoUrl.includes("watch?v=")) {
        videoUrl = videoUrl.replace("watch?v=", "embed/");
    } else if (videoUrl.includes("youtu.be/")) {
        let videoId = videoUrl.split("youtu.be/")[1].split("?")[0];
        videoUrl = "https://www.youtube.com/embed/" + videoId;
    }

    modalTitle.textContent = movieDetails.title;
    modalPlot.textContent = movieDetails.plot;
    modalBackdrop.src = movieDetails.backdrop || movieDetails.poster;

    // Se não houver vídeo, desabilita visualmente o botão de play do modal
    if (!videoUrl) {
        playBtn.style.display = "none";
    } else {
        playBtn.style.display = "block";
    }

    const startVideo = function() {
        if (!videoUrl) return; // Segurança extra
        modalBackdrop.classList.add('hidden'); 
        modalInfoBox.classList.add('hidden'); 
        modalVideo.classList.remove('hidden'); 
        
        // Correção Inception: Só atribui o SRC se for uma URL válida para evitar carregar a raiz do site
        if (videoUrl.startsWith('http')) {
            modalVideo.src = videoUrl + (videoUrl.includes("?") ? "&" : "?") + "autoplay=1&mute=1"; 
        }
    };

    playBtn.onclick = startVideo;
    modal.classList.remove('hidden');

    if (autoPlayVideo) {
        startVideo();
    }
}

function closeModal() {
    let modal = document.getElementById('movie-modal');
    let modalBackdrop = document.getElementById('modal-backdrop');
    let modalVideo = document.getElementById('modal-video');
    let modalInfoBox = document.getElementById('modal-info-box');

    modal.classList.add('hidden');

    modalVideo.src = ""; 
    modalVideo.classList.add('hidden'); 
    modalBackdrop.classList.remove('hidden'); 
    modalInfoBox.classList.remove('hidden'); 
}

// ==============================
// ACESSIBILIDADE (TECLADO)
// ==============================

document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        closeModal(); 
    }
});

// ==============================
// REAL TIME SEARCH
// ==============================

let searchBox = document.getElementById('search-box');
searchBox.addEventListener('input', function() {
    let typedText = searchBox.value.toLowerCase();
    let searchSection = document.getElementById('search-section');
    let searchSlider = document.getElementById('search-slider');
    searchSlider.innerHTML = "";

    if (typedText === "") {
        searchSection.classList.add('hidden');
    } else {
        searchSection.classList.remove('hidden');
        let results = movies.filter(function(movie) {
            return movie.title.toLowerCase().includes(typedText);
        });
        
        for (let i = 0; i < results.length; i++) {
            const movie = results[i];
            let posterHtml = `
                <img src="${movie.poster}" 
                     alt="${movie.title}" 
                     class="movie-poster" 
                     onclick="openModal('${movie._id}')">`;
            searchSlider.innerHTML += posterHtml;
        }
    }
});