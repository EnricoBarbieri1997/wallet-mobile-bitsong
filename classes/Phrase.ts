import { makeAutoObservable, runInAction } from "mobx";
import { Buffer } from "buffer";
import { bip39, getRandomValues, InputHandler } from "utils";

export default class Phrase {
  words: string[] = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isValid() {
    return true; // TODO: calc me
  }

  async create() {
    const words = await Phrase.generate();
    runInAction(() => {
      this.words = words;
    });
  }

  addWord(word: string) {
    this.words?.push(word.toLowerCase());
  }

  setWords(words: string[]) {
    this.words = words;
  }

  // -------------

  private input = new InputHandler();

  get inputValue() {
    return this.input.value;
  }

  get hint() {
    const value = this.input.value.toLowerCase();

    if (!value) return null;

    return Phrase.wordlist.find((word: string) =>
      word.toLowerCase().startsWith(value)
    );
  }

  inputSubmit() {
    if (this.hint) {
      this.addWord(this.hint);
      this.input.clear();
    }
  }

  inputSet(value?: string) {
    this.input.set(value?.toLowerCase());
  }

  // -----------------

  static mock = new Array<string>(24).fill("test");

  static wordlist: string[] = bip39.wordlists.EN;

  static async generate(strength: number = 256) {
    if (strength % 32 !== 0) {
      throw new TypeError("invalid entropy");
    }

    const buffer = Buffer.from(getRandomValues(new Uint8Array(strength / 8)));
    return bip39.entropyToMnemonic(buffer.toString("hex")).split(" ");
  }
}
