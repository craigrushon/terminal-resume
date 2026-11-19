import { Document, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { Resume } from '../lib/resume/schema';
import { buildResumeView } from '../lib/resume/view';

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: 'Helvetica', fontSize: 9.5, lineHeight: 1.3, color: '#000000', backgroundColor: '#ffffff' },
  name: { fontSize: 20, fontFamily: 'Helvetica-Bold' },
  label: { fontSize: 11, marginTop: 1 },
  meta: { fontSize: 9, color: '#333333' },
  contact: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 3, fontSize: 9 },
  link: { color: '#000000', textDecoration: 'underline', marginRight: 10 },
  summary: { marginTop: 5 },
  heading: { marginTop: 10, marginBottom: 4, paddingBottom: 1, fontSize: 11, fontFamily: 'Helvetica-Bold', borderBottomWidth: 0.75, borderBottomColor: '#000000' },
  entry: { marginBottom: 5 },
  entryTitle: { fontFamily: 'Helvetica-Bold' },
  bullet: { flexDirection: 'row', marginTop: 1 },
  bulletMark: { width: 10 },
  bulletText: { flex: 1 },
  skill: { marginTop: 1 },
});

function Bullets({ items }: { items: string[] }): React.JSX.Element {
  return (
    <>
      {items.map((item) => (
        <View key={item} style={styles.bullet} wrap={false}>
          <Text style={styles.bulletMark}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </>
  );
}

/** react-pdf <Document>: single column, black on white, Helvetica, concise detail. */
export function ResumeDocument({ resume }: { resume: Resume }): React.JSX.Element {
  const view = buildResumeView(resume);
  return (
    <Document title={`${view.name}: Resume`} author={view.name} subject={view.label}>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.name}>{view.name}</Text>
        <Text style={styles.label}>{view.label}</Text>
        <Text style={styles.meta}>{view.location}</Text>
        <View style={styles.contact}>
          {view.contact.map((item) => (
            <Link key={item.href} src={item.href} style={styles.link}>
              {item.href.replace(/^mailto:|^https:\/\//, '')}
            </Link>
          ))}
        </View>
        <Text style={styles.summary}>{view.summary}</Text>

        <Text style={styles.heading}>Experience</Text>
        {view.work.map((job) => (
          <View key={`${job.company}-${job.dates}`} style={styles.entry} wrap={false}>
            <Text style={styles.entryTitle}>
              {job.position}, {job.company}
            </Text>
            <Text style={styles.meta}>{job.dates}</Text>
            <Text>{job.summary}</Text>
            <Bullets items={job.highlights} />
            {job.stack.length > 0 && <Text style={styles.meta}>Stack: {job.stack.join(', ')}</Text>}
          </View>
        ))}

        <Text style={styles.heading}>Projects</Text>
        {view.projects.map((project) => (
          <View key={project.name} style={styles.entry} wrap={false}>
            <Text style={styles.entryTitle}>{project.name}</Text>
            <Text>{project.description}</Text>
            <Bullets items={project.highlights} />
            {project.stack.length > 0 && <Text style={styles.meta}>Stack: {project.stack.join(', ')}</Text>}
            {project.link && (
              <Link src={project.link.href} style={{ ...styles.link, ...styles.meta }}>
                {project.link.href.replace(/^https:\/\//, '')}
              </Link>
            )}
          </View>
        ))}

        <Text style={styles.heading}>Skills</Text>
        {view.skills.map((skill) => (
          <Text key={skill.name} style={styles.skill}>
            <Text style={styles.entryTitle}>{skill.name}: </Text>
            {skill.keywords.join(', ')}
          </Text>
        ))}

        <Text style={styles.heading}>Education</Text>
        {view.education.map((entry) => (
          <View key={entry.title} style={styles.entry} wrap={false}>
            <Text style={styles.entryTitle}>{entry.title}</Text>
            <Text>
              {entry.institution}
              {entry.dates ? ` (${entry.dates})` : ''}
            </Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
