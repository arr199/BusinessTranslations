export interface TableSchema {
  name: string;
  schema: string;
}

export const DATABASE_SCHEMAS: TableSchema[] = [
  {
    name: "languages",
    schema: `id:         integer [primary key, increment]
code:       varchar(5) [unique, not null]
name:       varchar(50) [not null]
is_active:  boolean [default: true]
created_at: timestamp`,
  },
  {
    name: "modules",
    schema: `id:         integer [primary key, increment]
name:       varchar(100) [unique, not null]
slug:       varchar(100) [unique, not null]
icon:       varchar(50)
description: text`,
  },
  {
    name: "translations",
    schema: `id:          integer [primary key, increment]
module_id:   integer [foreign key -> modules.id]
key_name:    varchar(255) [not null]
language_id: integer [foreign key -> languages.id]
value:       text
status:      varchar(20) [default: 'pending']`,
  },
];
