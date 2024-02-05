import type { ConflictList, ConflictListItem } from '~/types'
import type {
  ConflictBucket,
  ConflictBucketItem,
  ExactMatches,
} from '~/types/conflict-match'
import { sanitizeQuery } from '~/util'
import {
  getCobrsPhoneticMatches,
  getExactMatches,
  getPhoneticMatches,
  getSynonymMatches,
} from '~/util/namex-api'

export const useConflicts = defineStore('conflicts', () => {
  const exactMatches = ref<Array<ConflictListItem>>([])
  const synonymMatches = ref<Array<ConflictList>>([])
  const cobrsPhoneticMatches = ref<Array<ConflictList>>([])
  const phoneticMatches = ref<Array<ConflictList>>([])

  async function retrieveExactMatches(
    query: string
  ): Promise<Array<ConflictListItem>> {
    query = sanitizeQuery(query, true)
    query = query.charAt(0) === '+' ? query.substring(1) : query

    const response = await getExactMatches(query)
    if (response.status !== 200)
      throw new Error('Unable to retrieve exact matches')

    return parseExactMatches(await response.json())
  }

  function parseExactMatches(bucket: ExactMatches): Array<ConflictListItem> {
    return bucket.names.map((entry) => {
      return {
        text: entry.name,
        highlightedText: entry.name,
        nrNumber: entry.id,
        startDate: entry.start_date,
        jurisdiction: entry.jurisdiction,
        source: entry.source,
      }
    })
  }

  async function retrieveSynonymMatches(query: string, exactPhrase: string) {
    query = query || '*'
    query = sanitizeQuery(query)
    exactPhrase = exactPhrase || '*'

    const response = await getSynonymMatches(query, exactPhrase)
    if (response.status !== 200)
      throw new Error('Unable to retrieve synonym matches')

    return parseSynonymMatches(await response.json())
  }

  function parseSynonymMatches(bucket: ConflictBucket): Array<ConflictList> {
    let synonym_stems: any = null
    const output: Array<ConflictList> = []

    for (const name of bucket.names) {
      // remove any empty string stem values - they are not valid
      name.stems = name.stems.filter((n) => n)
      const entry = name.name_info
      const entryMeta = entry.name
        .substring(entry.name.lastIndexOf('-') + 1)
        .trim()
      const wildcardStack = entry.name.lastIndexOf('*') > 0

      if (name.name_info.source) {
        //stack conflict
        synonym_stems = name.stems
      } else {
        // stack title

        entry.name = entry.name.replace('----', '').toUpperCase()
        const syn_index = entry.name.indexOf('SYNONYMS:')
        if (syn_index !== -1) {
          const last_bracket_indx = entry.name.lastIndexOf(')')
          const synonym_clause = entry.name.substring(
            syn_index + 10,
            last_bracket_indx
          )
          const synonym_list = synonym_clause.split(',')

          for (const synonym of synonym_list) {
            for (const stem of name.stems) {
              if (synonym.toUpperCase().includes(stem.toUpperCase())) {
                name.stems.filter((s) => s !== stem)
              }
            }
            entry.name = entry.name.replace(
              synonym.toUpperCase(),
              '<span class="synonym-stem-highlight">' +
                synonym.toUpperCase() +
                '</span>'
            )
          }
          entry.name = entry.name.replace('SYNONYMS:', '')
        }
        entry.name = entry.name.substring(0, entry.name.lastIndexOf('-')).trim()
      }
      entry.name = ' ' + entry.name

      for (const name_stem of name.stems) {
        if (!wildcardStack) {
          entry.name = entry.name.replace(
            ' ' + name_stem.toUpperCase(),
            '<span class="stem-highlight">' +
              ' ' +
              name_stem.toUpperCase() +
              '</span>'
          )
        }
        if (synonym_stems) {
          if (synonym_stems.indexOf(name_stem.toUpperCase()) != -1) {
            synonym_stems.splice(
              synonym_stems.indexOf(name_stem.toUpperCase()),
              1
            )
          }

          for (const synonym_stem of synonym_stems) {
            entry.name = entry.name.replace(
              ' ' + synonym_stem.toUpperCase(),
              '<span class="synonym-stem-highlight">' +
                ' ' +
                synonym_stem.toUpperCase() +
                '</span>'
            )
          }
        }
      }

      const htmlRegex =
        /<SPAN CLASS="SYNONYM\-STEM\-HIGHLIGHT">|<SPAN CLASS="STEM\-HIGHLIGHT">|<\/SPAN>/gi
      if (entry.source) {
        const match = {
          text: entry.name.replace(htmlRegex, '').trim(),
          highlightedText: entry.name.trim(),
          jurisdiction: entry.jurisdiction!,
          nrNumber: entry.id!,
          startDate: entry.start_date!,
          source: entry.source,
        }
        output.at(-1)?.children.push(match)
      } else {
        const match = {
          text: entry.name.replace(htmlRegex, '').trim(),
          highlightedText: entry.name.trim(),
          meta: entryMeta,
          children: [],
        }
        output.push(match)
      }
    }
    return output
  }

  async function retrieveCobrsPhoneticMatches(
    query: string
  ): Promise<Array<ConflictList>> {
    query = query || '*'
    query = sanitizeQuery(query)
    const response = await getCobrsPhoneticMatches(query)
    if (response.status !== 200)
      throw new Error('Unable to retrieve cobrs phonetic matches')

    return parsePhoneticMatches(await response.json())
  }

  async function retrievePhoneticMatches(
    query: string
  ): Promise<Array<ConflictList>> {
    query = query || '*'
    query = sanitizeQuery(query)
    const response = await getPhoneticMatches(query)
    if (response.status !== 200)
      throw new Error('Unable to retrieve phonetic matches')

    return parsePhoneticMatches(await response.json())
  }

  function parsePhoneticMatches(bucket: ConflictBucket): Array<ConflictList> {
    const output: Array<ConflictList> = []
    bucket.names.forEach(({ name_info }) => {
      if (name_info.source) {
        const conflict = {
          text: name_info.name,
          highlightedText: name_info.name,
          jurisdiction: name_info.jurisdiction!,
          nrNumber: name_info.id!,
          startDate: name_info.start_date!,
          source: name_info.source,
        }
        output.at(-1)?.children.push(conflict)
      } else {
        name_info.name = name_info.name
          .replace('----', '')
          .replace('synonyms:', '')
        const conflictGroup = {
          text: name_info.name,
          highlightedText: name_info.name,
          meta: undefined,
          children: <Array<ConflictListItem>>[],
        }
        output.push(conflictGroup)
      }
    })
    return output
  }

  async function initialize(searchQuery: string, exactPhrase: string) {
    exactMatches.value = await retrieveExactMatches(searchQuery)
    synonymMatches.value = await retrieveSynonymMatches(
      searchQuery,
      exactPhrase
    )
    cobrsPhoneticMatches.value = await retrieveCobrsPhoneticMatches(searchQuery)
    phoneticMatches.value = await retrievePhoneticMatches(searchQuery)
  }

  return {
    initialize,
    exactMatches,
    synonymMatches,
    cobrsPhoneticMatches,
    phoneticMatches,
  }
})
