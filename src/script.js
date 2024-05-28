
document.getElementById('translateBtn').addEventListener('click', async function() {
    const direction = document.getElementById('direction').value;
    let inputText = document.getElementById('inputText').value.trim();
    const resultElement = document.getElementById('result');

    if (!inputText) {
        resultElement.textContent = 'Masukkan teks untuk diterjemahkan.';
        return;
    }

    // Clean and preprocess the input text
    inputText = preprocessText(inputText);

    try {
        // Fetch data from data.json
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        let translation = '';

        if (direction === 'id-to-dk') {
            translation = translateText(inputText, data, 'id', 'dk');
        } else {
            translation = translateText(inputText, data, 'dk', 'id');
        }

        if (!translation) {
            alert("Data Tidak di Temukan, Silahkan cari manual di Halaman Kamus Kosakata");
            resultElement.textContent = '';
        } else {
            resultElement.textContent = translation;
        }
    } catch (error) {
        resultElement.textContent = 'Terjadi kesalahan saat mengambil data.';
        console.error('Fetch error: ', error);
    }
});

function preprocessText(text) {
    // Remove unnecessary spaces and normalize punctuation
    text = text.replace(/\s+/g, ' ').trim();  // Remove extra spaces
    text = text.replace(/ ,/g, ',');  // Fix spaces before commas
    text = text.replace(/ \./g, '.');  // Fix spaces before periods
    text = text.replace(/ \?/g, '?');  // Fix spaces before question marks
    text = text.replace(/ \!/g, '!');  // Fix spaces before exclamation marks
    return text;
}

function translateText(inputText, data, fromLang, toLang) {
    const words = inputText.split(' ');
    let translation = words.map(word => translateWord(word.toLowerCase(), data, fromLang, toLang)).join(' ');
    return translation.includes('[undefined]') ? '' : translation;
}

function translateWord(word, data, fromLang, toLang) {
    // Handle cases where word may or may not have punctuation
    const normalizedWord = word.replace(/'/g, '').replace(/,/g, '').replace(/"/g, '');

    for (let category in data) {
        if (fromLang === 'id') {
            if (data[category][normalizedWord]) {
                return data[category][normalizedWord];
            }
        } else {
            for (let key in data[category]) {
                if (data[category][key].toLowerCase().replace(/'/g, '').replace(/,/g, '').replace(/"/g, '') === normalizedWord) {
                    return key;
                }
            }
        }
    }
    return '[undefined]';  // return a marker if not found
}
