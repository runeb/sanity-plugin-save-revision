import type {CurrentUser} from "@sanity/types"
export type MetadataDocument = {
  revisions: {
    name: string
    user: CurrentUser
    revision: string
    timestamp: number
    comment?: string
  }[]
}
