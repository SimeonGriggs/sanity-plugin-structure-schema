import S from '@sanity/desk-tool/structure-builder'
import schema from 'part:@sanity/base/schema'
import sanityClient from 'part:@sanity/base/client'
// Studio uses speakingurl to generate slugs
import speakingurl from 'speakingurl'

interface Divider {
  divider: boolean
}

interface StructureSchema {
  schemaType: string
  singleton?: boolean
  id?: string
  title?: string
  icon?: any
  filter?: string
  params?: any
  apiVersion?: string
  children?: StructureSchema[]
}

interface LegacyStructureItem {
  serialize?: any
  type?: string
}

// It Would Be Nice™ if checking for legacy structure items was cleaner
function isLegacyStructureItem(config: LegacyStructureItem) {
  return typeof config?.serialize === 'function' || config?.type === 'divider'
}

function isDivider(config: Divider) {
  return config.hasOwnProperty('divider')
}

function createDivider(config) {
  return config?.divider === true ? S.divider() : null
}

function createStructureItem(config: StructureSchema) {
  const {schemaType, children} = config as StructureSchema

  if (!schemaType) {
    throw new Error('Structure item missing required `schemaType` property`')
  }

  // Set fallback defaults so they always exist,
  // and can invoke the method on every object
  const singleton = config?.singleton ?? false
  const title = config?.title ?? schema.get(schemaType)?.title
  const id = config?.id ?? speakingurl(title)
  const icon = config?.icon ?? null
  const filter = config?.filter ?? ``
  const params = config?.params ?? {}
  const apiVersion = config?.apiVersion ?? sanityClient?.config()?.apiVersion

  if (singleton) {
    return S.documentListItem().schemaType(schemaType).icon(icon).id(id).title(title).serialize()
  }

  if (children?.length) {
    return S.listItem()
      .id(id)
      .title(title)
      .icon(icon)
      .child(
        S.list()
          .title(title)
          .id(`${id}-list`)
          .items(children.map((child) => createStructureItem(child)))
      )
      .serialize()
  }

  if (filter) {
    return S.listItem()
      .id(id)
      .title(title)
      .icon(icon)
      .child(
        S.documentList()
          .schemaType(schemaType)
          .title(title)
          .apiVersion(apiVersion)
          // Extend the supplied query to filter down to a single _type
          .filter(`_type == "${schemaType}" && ${filter}`)
          .params(params)
      )
      .serialize()
  }

  return S.documentTypeListItem(schemaType).title(title).icon(icon).serialize()
}

export function structureSchema(schema: Array<StructureSchema | LegacyStructureItem | Divider>) {
  return schema.filter(Boolean).map((item) => {
    // Dividers in schema
    if (isDivider(item as Divider)) {
      return createDivider(item)
    }

    // Legacy structure items
    if (isLegacyStructureItem(item as LegacyStructureItem)) {
      return item
    }

    // Singletons, lists and nested lists
    return createStructureItem(item as StructureSchema)
  })
}
