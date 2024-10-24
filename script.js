const apiKey = 'de732d1a96c4b59535a1648f709b443d';

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('modal').style.display = 'block'; // Mostrar el modal al cargar
    const logo = document.getElementById('logo');
    const recommendationTitle = document.getElementById('recommendationTitle');
    const exitButton = document.getElementById('exitButton');
    const recommendationsGrid = document.getElementById('recommendationsGrid');

    logo.style.top = '20px';
    document.getElementById('userForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const name = document.getElementById('name').value;
        const dob = new Date(document.getElementById('dob').value);
        const age = calculateAge(dob);
        

        const selectedGenres = Array.from(document.getElementById('genres').selectedOptions).map(option => option.value);
        const selectedYear = document.getElementById('years').value; 
    
        const languageChecked = document.querySelector('input[name="language"]:checked');
        const selectedLanguage = languageChecked ? languageChecked.value : null;
    
        const userId = `${name}_${age}`;
        localStorage.setItem('currentUserId', userId);
        localStorage.setItem(`selectedGenres_${userId}`, JSON.stringify(selectedGenres));

        await loadRecommendations(selectedGenres, selectedYear, selectedLanguage);
        document.getElementById('modal').style.display = 'none'; 
        logo.style.top = '10px';
        recommendationTitle.classList.add('visible'); 
        exitButton.style.display = 'block'; 

        
    });

    exitButton.onclick = function() {
        recommendationTitle.classList.remove('visible'); 
        exitButton.style.display = 'none'; 
        recommendationsGrid.innerHTML = ''; 
        document.getElementById('modal').style.display = 'block'; 
        document.getElementById('userForm').reset();
    }

    document.getElementById('dob').addEventListener('change', function() {
        const dob = new Date(this.value);
        const age = calculateAge(dob);
        
        
        const genres = document.getElementById('genres');
        const options = genres.options;
        
        for (let i = 0; i < options.length; i++) {
            options[i].disabled = false;
        }

        if (age < 18) {
            options[options.length - 1].disabled = true; // Terror
            options[options.length - 2].disabled = true; // Suspenso
            options[options.length - 3].disabled = true; // Erótico

            document.getElementById('ageWarningModal').style.display = 'block';
        } 
        
        if (age < 13) {
            for (let i = 0; i < options.length; i++) {
                if (options[i].value !== "16" && options[i].value !== "12") {
                    options[i].disabled = true;
                }
            }
        }
    });

    
});
document.getElementById('closeWarning').onclick = function() {
    document.getElementById('ageWarningModal').style.display = 'none';
};
function calculateAge(dob) {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}

async function loadRecommendations(selectedGenres, selectedYear, selectedLanguage) {
    const recommendations = [];
    try {
        for (const genre of selectedGenres) {
            const genreMovies = await fetchMovies(genre, selectedYear, selectedLanguage);
            recommendations.push(...genreMovies);
        }
        displayRecommendations(recommendations.slice(0, 6));
    } catch (error) {
        console.error('Error al cargar recomendaciones:', error);
        alert('Hubo un problema al cargar las recomendaciones. Intenta de nuevo.');
    }
}

async function fetchMovies(genre, year, language) {
    let yearFilter = '';
    if (year !== 'Todo') {
        const years = year.split('-');
        yearFilter = `&primary_release_date.gte=${years[0]}-01-01&primary_release_date.lte=${years[1]}-12-31`;
    }

    const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genre}${yearFilter}&language=${language}&sort_by=popularity.desc`);
    console.log(`Fetching movies with URL: https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genre}${yearFilter}&language=${language}&sort_by=popularity.desc`);

    const data = await response.json();
    return data.results.filter(movie => !movie.adult);
}

function displayRecommendations(recommendations) {
    const recommendationsGrid = document.getElementById('recommendationsGrid');
    recommendationsGrid.innerHTML = '';

    recommendations.forEach(movie => {
        const movieDiv = document.createElement('div');
        movieDiv.classList.add('movie-card');
        movieDiv.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <div class="info-container">
                <p class="year">${new Date(movie.release_date).getFullYear()}</p>
                <div class="rating">
                    ${renderStars(movie.vote_average)}
                </div>
            </div>
            <p>${movie.overview}</p>
        `;
        recommendationsGrid.appendChild(movieDiv);
    });
}

function renderStars(vote) {
    const stars = Math.round(vote / 2);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}
