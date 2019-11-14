export class StringUtility {
  /**
   * Method that check if provided string can be
   * converted to an ObjectId.
   * @param id hex string od ObjectId.
   */
  public static isIdValid(id: string): boolean {
    if (id.length !== 24) {
      return false;
    }
    const ALLOWED_CHARS = [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
    ];
    let good = false;
    for (let i = 0; i < id.length; i++) {
      good = false;
      for (let j in ALLOWED_CHARS) {
        if (id.charAt(i) === ALLOWED_CHARS[j]) {
          good = true;
          break;
        }
      }
      if (good === false) {
        return false;
      }
    }
    return true;
  }

  /**
   * Method that will encode a string to be
   * URL friendly. Input string can contain
   * only letters and numbers.
   *
   * Examples:
   *
   * ```
   * Some String -> some-string
   * sOme_StrIns -> some-string
   * some $tring -> undefined
   * some%string -> undefined
   * ```
   *
   * @param e string to be encoded.
   */
  public static nameEncoder(e: string | undefined): string | undefined {
    if (!e) {
      return undefined;
    }
    const n: string = encodeURIComponent(
      (e + '')
        .replace(new RegExp(' ', 'g'), '87gifut2i')
        .replace(new RegExp('-', 'g'), '87gifut2i')
        .replace(new RegExp('-', 'g'), '87gifut2i')
        .toLowerCase(),
    );
    if (new RegExp('^[a-z0-9]+$').test(n) === false) {
      return undefined;
    }
    return n.replace(new RegExp('87gifut2i', 'g'), '-');
  }

  public static createSlug(e: string) {
    if (!e) {
      throw new Error(`'e' is undefined`);
    }
    return e
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/_/g, '-')
      .replace(/[^a-z0-9 - ---]/g, '');
  }

  public static isPasswordValid(password: string): boolean {
    if (password.length < 8 || password.length > 64) {
      return false;
    }
    return true;
  }

  /**
   * Get Base64 URL Encoded string.
   * @param data String that will be encoded.
   */
  public static base64url(data: string): string {
    return this.trimBase64url(Buffer.from(data).toString('base64'));
  }

  /**
   * Convert Base64 string to Base64 URL Encoded string.
   * @param data Base64 string.
   */
  public static trimBase64url(data: string): string {
    return data
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
}
