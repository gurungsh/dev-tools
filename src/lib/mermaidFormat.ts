/**
 * Best-effort Mermaid formatter. Mermaid has no official formatter, so this
 * normalises indentation based on block keywords and trims whitespace. It never
 * reorders or rewrites statements.
 */
const OPENERS = /^(subgraph|loop|alt|opt|par|critical|break|rect|box|namespace)\b/i;
const MIDDLES = /^(else|and|option)\b/i;
const CLOSER = /^end\b/i;
const DIAGRAM_HEADER = /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram(-v2)?|erDiagram|gantt|pie|journey|gitGraph|mindmap|timeline|quadrantChart|requirementDiagram|C4\w*|xychart-beta|sankey-beta|block-beta|architecture-beta|packet-beta|kanban)\b/i;

export function formatMermaid(input: string, indent = 2): string {
  const unit = ' '.repeat(indent);
  const out: string[] = [];
  let depth = 0;
  let sawHeader = false;
  let inFrontMatter = false;
  let blankRun = 0;

  const lines = input.replace(/\r\n?/g, '\n').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    // Preserve YAML front matter (--- ... ---) and %%{init}%% directives verbatim.
    if (!sawHeader && line === '---') {
      inFrontMatter = !inFrontMatter;
      out.push(line);
      continue;
    }
    if (inFrontMatter) {
      out.push(raw.replace(/\s+$/, ''));
      continue;
    }

    if (line === '') {
      if (out.length && blankRun === 0) out.push('');
      blankRun++;
      continue;
    }
    blankRun = 0;

    if (line.startsWith('%%')) {
      out.push(unit.repeat(sawHeader ? depth : 0) + line);
      continue;
    }

    if (!sawHeader && DIAGRAM_HEADER.test(line)) {
      sawHeader = true;
      out.push(line);
      depth = 1;
      continue;
    }

    // Lines that close braces (e.g. `}` for class/state blocks).
    const closesBrace = line.startsWith('}');
    if (CLOSER.test(line) || closesBrace) depth = Math.max(1, depth - 1);
    const isMiddle = MIDDLES.test(line);
    const printDepth = isMiddle ? Math.max(1, depth - 1) : depth;
    out.push(unit.repeat(printDepth) + line);

    if (OPENERS.test(line) && !CLOSER.test(line)) depth++;
    else if (line.endsWith('{') && !line.startsWith('%%')) depth++;
  }

  while (out.length && out[out.length - 1] === '') out.pop();
  return out.join('\n') + '\n';
}
