import { NORMALIZATION } from "../constants/normalization.constants";
import { NormalizationResult } from "../types/normalization.types";

export class NormalizationService {
  normalize(rawText: string): NormalizationResult {
    let text = rawText;

    const originalLength = text.length;

    text = this.normalizeLineEndings(text);

    const whitespaceResult =
      this.normalizeWhitespace(text);

    text = whitespaceResult.text;

    const blankLineResult =
      this.collapseBlankLines(text);

    text = blankLineResult.text;

    text = this.trim(text);

    return {
      text,

      removedCharacters:
        originalLength - text.length,

      normalizedSpaces:
        whitespaceResult.normalizedSpaces,

      removedBlankLines:
        blankLineResult.removedBlankLines,
    };
  }

  private normalizeLineEndings(
    text: string
  ) {
    return text.replace(/\r\n?/g, "\n");
  }

  private normalizeWhitespace(
    text: string
  ) {
    const matches =
      text.match(/[ \t]{2,}/g);

    return {
      text: text.replace(
        /[ \t]+/g,
        " "
      ),

      normalizedSpaces:
        matches?.length ?? 0,
    };
  }

  private collapseBlankLines(
    text: string
  ) {
    const matches =
      text.match(/\n{3,}/g);

    return {
      text: text.replace(
        /\n{3,}/g,
        "\n".repeat(
          NORMALIZATION.MAX_CONSECUTIVE_NEWLINES
        )
      ),

      removedBlankLines:
        matches?.length ?? 0,
    };
  }

  public trim(text: string) {
    return text.trim();
  }
}