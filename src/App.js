import "./App.css";

function App() {
  return (
    <div className="App">
      <body>
        <h1>💬 Translato and Language Detector API Playground</h1>
        <div class="not-supported-message" hidden>
          Your browser doesn't support the Translator or Language Detector APIs.
        </div>
        <form>
          <label for="input">Input:</label>
          <textarea id="input">Hello, world!</textarea>
          <p>
            I'm <span>not sure what language this is</span>.
          </p>

          <label for="translate">
            Translate to
            <select id="translate">
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="ja">Japanese</option>
              <option value="pt">Portuguese</option>
              <option selected value="es">
                Spanish
              </option>
            </select>
          </label>
          <button type="submit" class="button-style">
            Translate
          </button>
        </form>
        <label for="output">Translation:</label>
        <output id="output"></output>
      </body>
    </div>
  );
}

export default App;
