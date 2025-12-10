
import { IncidentReport } from '../../types';

// Abstract Class defining the Template Method
abstract class BaseReportGenerator {
  public generate(report: IncidentReport): string {
    let output = this.generateHeader(report);
    output += this.generateMetadata(report);
    output += this.generateBody(report);
    output += this.generateFooter(report);
    return output;
  }

  protected generateHeader(report: IncidentReport): string {
    return `REPORT: ${report.title}\n====================\n`;
  }

  // Hook method - subclasses can override
  protected generateMetadata(report: IncidentReport): string {
    return `Date: ${report.date}\nAuthor: ${report.author}\n\n`;
  }

  // Abstract method - subclasses must implement
  protected abstract generateBody(report: IncidentReport): string;

  protected generateFooter(report: IncidentReport): string {
    return `\n====================\nCLASSIFICATION: ${report.type.toUpperCase()}`;
  }
}

export class TextReportGenerator extends BaseReportGenerator {
  protected generateBody(report: IncidentReport): string {
    return `CONTENT:\n${report.content}`;
  }
}

export class HtmlReportGenerator extends BaseReportGenerator {
  // Override header
  protected generateHeader(report: IncidentReport): string {
    return `<h1>${report.title}</h1><hr/>`;
  }
  
  protected generateMetadata(report: IncidentReport): string {
    return `<div class="meta">Date: ${report.date} | Author: ${report.author}</div><br/>`;
  }

  protected generateBody(report: IncidentReport): string {
    return `<div class="content">${report.content}</div>`;
  }
  
  protected generateFooter(report: IncidentReport): string {
      return `<hr/><footer><strong>${report.type.toUpperCase()}</strong></footer>`;
  }
}
