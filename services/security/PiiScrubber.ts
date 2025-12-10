
export class PiiScrubber {
  // Regex patterns
  private static SSN = /\d{3}-\d{2}-\d{4}/g;
  private static CREDIT_CARD = /\d{4}-\d{4}-\d{4}-\d{4}/g;
  private static EMAIL = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g;

  static scrub(text: string): string {
    if (!text) return text;
    return text
      .replace(this.SSN, '[REDACTED-SSN]')
      .replace(this.CREDIT_CARD, '[REDACTED-CC]')
      .replace(this.EMAIL, (email) => {
         // Preserve domain for context, redact user
         const [user, domain] = email.split('@');
         return `${user.substring(0, 2)}***@${domain}`;
      });
  }

  static scrubObject<T>(obj: T): T {
    const str = JSON.stringify(obj);
    const scrubbed = this.scrub(str);
    return JSON.parse(scrubbed);
  }
}
