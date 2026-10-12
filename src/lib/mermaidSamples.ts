export const MERMAID_SAMPLES: { label: string; code: string }[] = [
  {
    label: 'Flowchart',
    code: `flowchart TD
  A[Start] --> B{Is it working?}
  B -- Yes --> C[Ship it]
  B -- No --> D[Debug]
  D --> B`,
  },
  {
    label: 'Sequence diagram',
    code: `sequenceDiagram
  participant U as User
  participant A as API
  participant D as Database
  U->>A: POST /orders
  A->>D: INSERT order
  D-->>A: id
  alt success
    A-->>U: 201 Created
  else failure
    A-->>U: 500 Error
  end`,
  },
  {
    label: 'Class diagram',
    code: `classDiagram
  class Animal {
    +String name
    +eat()
  }
  class Dog {
    +bark()
  }
  Animal <|-- Dog`,
  },
  {
    label: 'State diagram',
    code: `stateDiagram-v2
  [*] --> Idle
  Idle --> Running: start
  Running --> Idle: stop
  Running --> [*]: crash`,
  },
  {
    label: 'ER diagram',
    code: `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
  PRODUCT ||--o{ LINE_ITEM : "ordered in"`,
  },
  {
    label: 'Gantt chart',
    code: `gantt
  title Release plan
  dateFormat YYYY-MM-DD
  section Build
  Design   :a1, 2025-01-01, 7d
  Develop  :a2, after a1, 14d
  section Ship
  Test     :after a2, 5d`,
  },
  {
    label: 'Pie chart',
    code: `pie title Languages
  "TypeScript" : 55
  "CSS" : 20
  "HTML" : 15
  "Other" : 10`,
  },
];
