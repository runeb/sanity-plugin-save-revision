export type RevisionInfo = {
  name: string
  user: {
    id: string
    name: string
  }
  revision: string
  timestamp: number
  comment?: string
}
