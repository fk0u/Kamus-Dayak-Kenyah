
document.getElementById('translateBtn').addEventListener('click', async function() {
    const direction = document.getElementById('direction').value;
    let inputText = document.getElementById('inputText').value.trim();
    const resultElement = document.getElementById('result');

    if (!inputText) {
        resultElement.textContent = 'Masukkan teks untuk diterjemahkan.';
        return;
    }

    inputText = preprocessText(inputText);

    try {
        // Fetch data from data.json
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

      let translation = "";

      if (direction === "id-to-dk") {
        translation = translateText(inputText, data, "id", "dk");
      } else {
        translation = translateText(inputText, data, "dk", "id");
      }

        if (!translation) {
            alert("Data Tidak di Temukan, Silahkan cari manual di Halaman Kamus Kosakata");
            resultElement.textContent = '';
        } else {
            resultElement.textContent = translation;
        }
    } catch (error) {
      resultElement.textContent = "Terjadi kesalahan saat mengambil data.";
      console.error("Fetch error: ", error);
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
  const words = inputText.split(" ");
  let translation = "";

  //   for (let i = 0; i < words.length; i++) {
  //     let translatedWord = translateWord(words[i], data, fromLang, toLang);
  //     if (translatedWord != null) {
  //         translation += " " + translatedWord;
  //     } else {
  //         if (translation != "") {
  //             translation += " " + words[i];
  //         }
  //     }
  //   }

  for (let i = 0; i < words.length; i++) {
    let translatedPhrase = "";
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
  const phraseRegex = new RegExp(`^${phrase}`, "i");
  const phraseRegex2 = new RegExp(`^${phrase}$`, "i");
  let result = null;

  for (let category in data) {
    if (result != null) {
      return result;
    }
    if (fromLang === "id") {
      for (let key in data[category]) {
        if (phraseRegex.test(key)) {
          result = data[category][key];
        }
      }
    } else {
      for (let key in data[category]) {
        if (phraseRegex2.test(data[category][key])) {
          result = key;
        }
      }
    }
  }
  return null;
}

function translateWord(word, data, fromLang, toLang) {
  // const wordRegex = new RegExp(`^${word}$`, 'i');
  // const closestRegex = new RegExp(`${word}`, 'i');
  const wordRegex = word.toLowerCase();
  let result = null;

  if (fromLang == "id") {
    for (let category in data) {
      if (result) {
        return result;
      }
      for (let key in data[category]) {
        if (key == wordRegex) {
          result = data[category][key];
        }
      }
    }

    if (result == null) {
      for (let category in data) {
        if (result) {
          return result;
        }
        for (let key in data[category]) {
          if (key.startsWith(wordRegex)) {
            result = data[category][key];
          }
        }
      }
    }
  } else {
    for (let category in data) {
      if (result) {
        return result;
      }
      for (let key in data[category]) {
        if (typeof data[category][key] == "object") {
          for (let item in data[category][key]) {
            if (data[category][key][item].startsWith(wordRegex)) {
              result = key;
            }
          }
        } else {
          if (data[category][key].toLowerCase() == wordRegex) {
            result = key;
          }
        }
      }
    }

    if (result == null) {
      for (let category in data) {
        if (result) {
          return result;
        }
        for (let key in data[category]) {
          if (typeof data[category][key] == "object") {
            for (let item in data[category][key]) {
              if (
                data[category][key][item].toLowerCase().startsWith(wordRegex)
              ) {
                result = key;
              }
            }
          } else {
            if (data[category][key].toLowerCase().startsWith(wordRegex)) {
              result = key;
            }
          }
        }
      }
    }
  }

  return result;
}
