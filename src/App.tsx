import { useEffect, useRef } from "react";
import "./App.css";

function App() {
    // 👇 Add explicit types to each ref
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const outputRef = useRef<HTMLOutputElement>(null);
    const detectedRef = useRef<HTMLSpanElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const languageRef = useRef<HTMLSelectElement>(null);
    const notSupportedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const run = async () => {
            if (!("LanguageDetector" in self)) {
                if (notSupportedRef.current)
                    notSupportedRef.current.hidden = false;
                return;
            }

            if (!formRef.current) return;
            formRef.current.style.visibility = "visible";
            const detector = await (self as any).LanguageDetector.create();

            const languageTagToHumanReadable = (
                languageTag: string,
                targetLanguage: string
            ) => {
                const displayNames = new Intl.DisplayNames([targetLanguage], {
                    type: "language",
                });
                return displayNames.of(languageTag);
            };

            if (!inputRef.current || !detectedRef.current) return;

            inputRef.current.addEventListener("input", async () => {
                const value = inputRef.current?.value.trim();
                if (!value) {
                    detectedRef.current!.textContent =
                        "not sure what language this is";
                    return;
                }

                const [{ detectedLanguage, confidence }] =
                    await detector.detect(value);
                detectedRef.current!.textContent = `${(
                    confidence * 100
                ).toFixed(1)}% sure that this is ${languageTagToHumanReadable(
                    detectedLanguage,
                    "en"
                )}`;
            });

            inputRef.current.dispatchEvent(new Event("input"));

            if ("Translator" in self) {
                formRef.current.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    try {
                        const sourceLanguage = (
                            await detector.detect(
                                inputRef.current!.value.trim()
                            )
                        )[0].detectedLanguage;
                        const targetLanguage = languageRef.current!.value;

                        const availability = await (
                            self as any
                        ).Translator.availability({
                            sourceLanguage,
                            targetLanguage,
                        });

                        if (availability === "unavailable") {
                            outputRef.current!.textContent = `${languageTagToHumanReadable(
                                sourceLanguage,
                                "en"
                            )} - ${languageTagToHumanReadable(
                                targetLanguage,
                                "en"
                            )} pair is not supported.`;
                            return;
                        }

                        const translator = await (
                            self as any
                        ).Translator.create({
                            sourceLanguage,
                            targetLanguage,
                            monitor(m: any) {
                                m.addEventListener(
                                    // copied from example, might need to change ltr
                                    "downloadprogress",
                                    (e: any) => {
                                        console.log(
                                            `Downloaded ${e.loaded * 100}%`
                                        );
                                    }
                                );
                            },
                        });
                        outputRef.current!.textContent =
                            await translator.translate(
                                inputRef.current!.value.trim()
                            );
                    } catch (err: any) {
                        outputRef.current!.textContent =
                            "An error occurred. Please try again.";
                        console.error(err.name, err.message);
                    }
                });
            }
        };

        run();
    }, []);

    return (
        <>
            <h1>💬 Translator and Language Detector API Playground</h1>
            <div ref={notSupportedRef} className="not-supported-message" hidden>
                Your browser doesn't support the Translator or Language Detector
                APIs.
            </div>
            <form ref={formRef}>
                <label htmlFor="input">Input:</label>
                <textarea
                    id="input"
                    ref={inputRef}
                    defaultValue={"Hello, world!"}
                ></textarea>
                <p>
                    I'm{" "}
                    <span ref={detectedRef}>
                        not sure what language this is
                    </span>
                    .
                </p>

                <label htmlFor="translate">
                    Translate to
                    <select id="translate" ref={languageRef} defaultValue="es">
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="ja">Japanese</option>
                        <option value="pt">Portuguese</option>
                        <option value="es">Spanish</option>
                        <option value="zh">Chinese</option>
                    </select>
                </label>
                <button type="submit" className="button-style">
                    Translate
                </button>
            </form>
            <label htmlFor="output">Translation:</label>
            <output id="output" ref={outputRef}></output>
        </>
    );
}

export default App;
