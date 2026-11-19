import type { Resume } from '../lib/resume/schema';

/** react-pdf <Document>: single column, black on white, Helvetica, concise detail. */
export function ResumeDocument(props: { resume: Resume }): React.JSX.Element {
  throw new Error(`not implemented: ResumeDocument(${props.resume.basics.name})`);
}
