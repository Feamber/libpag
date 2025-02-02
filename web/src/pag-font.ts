import { PAG } from './types';
import { readFile } from './utils/common';
import { ErrorCode } from './utils/error-map';
import { Log } from './utils/log';
import { defaultFontNames } from './utils/font-family';
import { wasmAwaitRewind, wasmAsyncMethod } from './utils/decorators';

@wasmAwaitRewind
export class PAGFont {
  public static module: PAG;

  public wasmIns: any;
  /**
   * Register custom font family in the browser.
   */
  @wasmAsyncMethod
  public static async registerFont(family: string, data: File) {
    const buffer = (await readFile(data)) as ArrayBuffer;
    if (!buffer || !(buffer.byteLength > 0)) Log.errorByCode(ErrorCode.PagFontDataEmpty);
    const dataUint8Array = new Uint8Array(buffer);
    const fontFace = new FontFace(family, dataUint8Array);
    document.fonts.add(fontFace);
    await fontFace.load();
  }
  /**
   * Register fallback font names from pag.
   */
  public static registerFallbackFontNames(fontNames: String[] = []) {
    /**
     * Cannot determine whether a certain word exists in the font on the web environment.
     * Because the canvas has font fallback when drawing.
     * The fonts registered here are mainly used to put words in a list in order, and the list can put up to UINT16_MAX words.
     * The emoji font family also has emoji words.
     */
    const vectorNames = new this.module.VectorString();
    const names = fontNames.concat(defaultFontNames);
    for (const name of names) {
      vectorNames.push_back(name);
    }
    this.module._PAGFont._SetFallbackFontNames(vectorNames);
    vectorNames.delete();
  }

  public static create(fontFamily: string, fontStyle: string) {
    return new PAGFont(this.module._PAGFont._create(fontFamily, fontStyle));
  }

  public readonly fontFamily: string;
  public readonly fontStyle: string;

  constructor(wasmIns: any) {
    this.wasmIns = wasmIns;
    this.fontFamily = this.wasmIns.fontFamily;
    this.fontStyle = this.wasmIns.fontStyle;
  }
}
