import type {CurrentUser} from "@sanity/types"

export type RevisionInfo = {
    name: string
    user: CurrentUser
    revision: string
    timestamp: number
    comment?: string
}

export type MetadataDocument = {
  revisions: RevisionInfo[]
}
