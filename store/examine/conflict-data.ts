import {
  ConflictSource,
  type ConflictData,
  type ConflictListItem,
  type Corporation,
  type NameRequest,
  type CorporationError,
} from '~/types'
import { getCorporation, getNameRequest } from '~/util/namex-api'

export const useConflictData = defineStore('conflict-data', () => {
  async function getCorpConflict(
    corpNum: string
  ): Promise<Corporation | CorporationError> {
    const response = await getCorporation(corpNum)
    return response.json()
  }

  async function getNamesConflict(nrNumber: string): Promise<NameRequest> {
    const response = await getNameRequest(nrNumber)
    return response.json()
  }

  async function getConflictData(
    item: ConflictListItem
  ): Promise<ConflictData> {
    try {
      if (item.source === ConflictSource.Corp) {
        const data = await getCorpConflict(item.nrNumber)
        if ('message' in data) {
          throw new Error(data.message)
        }
        return data
      } else {
        return getNamesConflict(item.nrNumber)
      }
    } catch {
      throw new Error(`Failed to retrieve conflict data for ${item.text}`)
    }
  }

  return { getConflictData }
})
