import Vue from 'vue'
import staticFilesServer from '../static.files.server'
import { createApiSandbox } from '../sandbox/CobrsPhonMatchConf-api-stubs'
import { cleanState } from '../../features/specs/support/clean.state'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import { sleep } from '@/utils/sleep'

describe('CobrsPhoneticMatches spec', () => {
  let data = {}
  const Constructor = Vue.extend(App)

  beforeEach(done => {
    data.apiSandbox = createApiSandbox()
    //createApiSandbox module exported from 'test/unit/sandbox/CobrsPhonMatchConf-api-stubs.js' is a custom instance
    //of sinon.sandbox with custom stubs that allow this particular set of unit tests to run.  The API response data is
    //fully defined in that file as well as stubs of the other calls needed to initialize the app.  Refer to
    //that file for details.
    jest.setTimeout(100000)
    staticFilesServer.start(done)
  })

  afterEach(done => {
    data.apiSandbox.restore()
    staticFilesServer.stop(done)
  })

  describe('list', () => {
    beforeEach(async () => {
      store.replaceState(cleanState())
      data.instance = new Constructor({ store, router })
      data.vm = data.instance.$mount(document.getElementById('app'))
      await sleep(2000)

      data.vm.$store.state.userId = 'Joe'
      sessionStorage.setItem('AUTHORIZED', true)
      data.vm.$router.push('/nameExamination')
      await sleep(2000)
    })

    afterEach(() => {
      data.vm.$router.push('/')
    })

    // FUTURE: fix
    xit('displays cobrs-phonetic-match conflicts', () => {
      expect(
        data.vm.$el.querySelector('#conflicts-container .conflict-container-spinner').classList.contains('hidden'))
    })

    // FUTURE: fix
    xit('displays cobrs-phonetics conflicts after synonym bucket list', () => {
      var content = data.vm.$el.querySelector('#conflicts-container').textContent
      expect(content.indexOf('Character Swap Match')).not.toEqual(-1)
      expect(content.indexOf('INCREDIBLE NAME INC')).not.toEqual(-1)
      expect(content.indexOf('INCREDIBLE NAME INC') < content.indexOf('Character Swap Match')).toEqual(true)
    })

    // FUTURE: fix
    xit('populates additional attributes as expected', () => {
      expect(data.instance.$store.state.cobrsPhoneticConflicts).toEqual([ {
        "class": "conflict-result",
        "highlightedText": "INCREDYBLE STEPS RECORDS, INC.",
        "id": "3-cobrs",
        "jurisdiction": "BC",
        "meta": undefined,
        "nrNumber": "0793638",
        "source": "CORP",
        "startDate": "1986-10-26",
        "text": "INCREDYBLE STEPS RECORDS, INC."
      } ])
    })

    // FUTURE: fix
    xit('changes conflicts tab to red', () => {
      expect(document.getElementById('conflicts1').className).toMatch('c-priority')
    })
  })
})
