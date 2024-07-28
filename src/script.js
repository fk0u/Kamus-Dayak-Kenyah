document.getElementById('translateBtn').addEventListener('click', async function() {
    const direction = document.getElementById('direction').value;
    let inputText = document.getElementById('inputText').value.trim();
    const resultElement = document.getElementById('result');

    if (!inputText) {
        alert('Masukkan teks untuk diterjemahkan.');
        return;
    }

    inputText = preprocessText(inputText);

    try {
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

        resultElement.innerHTML = translation;
    } catch (error) {
        resultElement.textContent = 'Terjadi kesalahan saat mengambil data.';
        console.error('Fetch error: ', error);
    }
});

function preprocessText(text) {
    text = text.toLowerCase();
    text = text.replace(/\s+/g, ' ').trim();
    text = text.replace(/^[.,!?]\s*/g, '').replace(/\s*[.,!?]$/g, '');
    text = text.replace(/ ([,.])/g, '$1');
    return text;
}

function translateText(inputText, data, fromLang, toLang) {
    const words = inputText.split(' ');
    let translation = '';

    for (let i = 0; i < words.length; i++) {
        let translatedPhrase = '';
        let phrase = words[i];

        for (let j = i + 1; j <= Math.min(words.length, i + 5); j++) {
            phrase += ' ' + words[j];
            let tempTranslation = translatePhrase(phrase.trim(), data, fromLang, toLang);
            if (tempTranslation) {
                translatedPhrase = tempTranslation;
                i = j;
            }
        }

        if (translatedPhrase) {
            translation += translatedPhrase + ' ';
        } else {
            let translatedWord = translateWord(words[i], data, fromLang, toLang);
            translation += translatedWord ? translatedWord + ' ' : '<span class="untranslated">' + words[i] + '</span> ';
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
