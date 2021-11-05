# sanity-plugin-structure-schema

Create Sanity Desk Structure with a similar syntax to Schema.

🚨 This plugin is a proof of concept and should not be treated like a reliable, production-ready or supported project. Tread lightly.

Feedback welcome.

## Installation

```
sanity install structure-schema
```

First you'll need to have [Desk Tool Structure setup](https://www.sanity.io/docs/set-up-structure-builder-to-override-the-default-list-view) in your project, so that you have a file (like `deskStructure.js`) to create your structure in.

Now build out schema items as an array of objects.

```js
// deskStructure.js
import {structureSchema} from 'sanity-plugin-structure-schema'

const structureSchemaItems = [{schemaType: `article`}]

export default () => {
  return S.list().title('Content').items(structureSchema(structureSchemaItems))
}
```

Each object has one of two required values:

- `{ schemaType: "typeName" }` for creating document list items
- `{ divider: true }` for creating dividers

The full set of options for a document list object are:

```ts
schemaType: string
singleton?: boolean
id?: string
title?: string
icon?: any
filter?: string
params?: any
apiVersion?: string
children?: StructureSchema[]
```

You can even `S.things()` in your array as well and they'll just get passed through.

### Example

The below example will create a document list with:

- All `page` type Documents
- A single `page` type Document with the `_id` `home`
- A Divider
- All `project` type Documents using the built-in structure builder
- A top level menu item for `post` type Documents with children
  -- `post` type documents with a future `publishedAt` date
  -- `post` type documents with a past `publishedAt` date

```js
const structureSchemaItems = [
  {schemaType: `page`},
  {schemaType: `page`, id: `home`, singleton: true},
  {divider: true},
  S.documentTypeListItem(`project`).title(`Legacy Projects`),
  {schemaType: `post`, title: `Posts`, children: [
    {schemaType: `post`, title: `Future Posts`, filter: `dateTime(now()) < dateTime(publishedAt)`}
    {schemaType: `post`, title: `Past Posts`, filter: `dateTime(now()) > dateTime(publishedAt)`}
  ]},
]
```

### What this won't do (currently)

- Initial value templates
- Menu items
- Orderings
- Views (use `getDefaultDocumentNode()` instead)

## License

MIT © Simeon Griggs
See LICENSE
