
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
    let translation = '';

    for (let i = 0; i < words.length; i++) {
        let translatedPhrase = '';
        let phrase = words[i];

        // Check for phrases with multiple words
        for (let j = i + 1; j < words.length; j++) {
            phrase += ' ' + words[j];
            if (translatePhrase(phrase, data, fromLang, toLang)) {
                translatedPhrase = translatePhrase(phrase, data, fromLang, toLang);
                i = j;
                break;
            }
        }

        if (translatedPhrase) {
            translation += translatedPhrase + ' ';
        } else {
            let translatedWord = translateWord(words[i], data, fromLang, toLang);
            translation += translatedWord ? translatedWord + ' ' : words[i] + ' ';
        }
    }

    return translation.trim();
}

function translatePhrase(phrase, data, fromLang, toLang) {
    const phraseRegex = new RegExp(`^${phrase}$`, 'i');

    for (let category in data) {
        if (fromLang === 'id') {
            for (let key in data[category]) {
                if (phraseRegex.test(key)) {
                    return data[category][key];
                }
            }
        } else {
            for (let key in data[category]) {
                if (phraseRegex.test(data[category][key])) {
                    return key;
                }
            }
        }
    }
    return null;
}

function translateWord(word, data, fromLang, toLang) {
    const wordRegex = new RegExp(`^${word}$`, 'i');

    for (let category in data) {
        if (fromLang === 'id') {
            for (let key in data[category]) {
                if (wordRegex.test(key)) {
                    return data[category][key];
                }
            }
        } else {
            for (let key in data[category]) {
                if (wordRegex.test(data[category][key])) {
                    return key;
                }
            }
        }
    }
    return null;
}
