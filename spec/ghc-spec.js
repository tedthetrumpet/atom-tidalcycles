const child_process = require('child_process')
const fs = require('fs')
const Ghc = require('../lib/ghc')

describe('ghc', () => {

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activate('tidalcycles'))
  })

  describe('command path', () => {
    it(`should choose ghcup path by default`, () => {
      spyOn(fs, 'existsSync').andReturn(true)

      let ghc = new Ghc()

      expect(ghc.interactivePath).toBe('~/.ghcup/bin/ghci')
      expect(ghc.pkgPath).toBe('~/.ghcup/bin/ghc-pkg')
    })

    it(`should be itself if ghcup path does not exists`, () => {
      spyOn(fs, 'existsSync').andReturn(false)

      let ghc = new Ghc()

      expect(ghc.interactivePath).toBe('ghci')
      expect(ghc.pkgPath).toBe('ghc-pkg')
    })

    it(`should be consistent with ghciPath property if it exists`, () => {
      atom.config.set('tidalcycles.ghciPath', '/some/path/ghci')

      let ghc = new Ghc()

      expect(ghc.interactivePath).toBe('/some/path/ghci')
      expect(ghc.pkgPath).toBe('/some/path/ghc-pkg')
    })

    it(`should append command to ghciPath property if this indicates a folder`, () => {
      atom.config.set('tidalcycles.ghciPath', '/some/path')

      let ghc = new Ghc()

      expect(ghc.interactivePath).toBe('/some/path/ghci')
      expect(ghc.pkgPath).toBe('/some/path/ghc-pkg')
    })

    it(`should handle ghciPath property terminating with path separator`, () => {
      atom.config.set('tidalcycles.ghciPath', '/some/path/')

      let ghc = new Ghc()

      expect(ghc.interactivePath).toBe('/some/path/ghci')
      expect(ghc.pkgPath).toBe('/some/path/ghc-pkg')
    })

    it(`should handle stack exec path style`, () => {
      atom.config.set('tidalcycles.ghciPath', 'stack exec --package tidal – ghci')

      let ghc = new Ghc()

      expect(ghc.interactivePath).toBe('stack exec --package tidal – ghci')
      expect(ghc.pkgPath).toBe('stack exec --package tidal – ghc-pkg')
    })
  })

  describe('tidal data dir', () => {
    it('should take data-dir path from ghc-pkg output', () => {
      spyOn(child_process, 'execSync').andReturn('data-dir: /some/path/tidal\n')

      let ghc = new Ghc()

      expect(ghc.tidalDataDir()).toBe('/some/path/tidal')
    })

    it('should handle spaces in path', () => {
      spyOn(child_process, 'execSync').andReturn('data-dir: /some/pa th/tidal\n')

      let ghc = new Ghc()

      expect(ghc.tidalDataDir()).toBe('/some/pa th/tidal')
    })

    it(`should return what it gets when there's no path in ghc-pkg path`, () => {
      spyOn(child_process, 'execSync').andReturn('no-path-in-this-output\n')

      let ghc = new Ghc()

      expect(ghc.tidalDataDir()).toBe('no-path-in-this-output')
    })

    it(`should return empty string if an error occurr`, () => {
      spyOn(child_process, 'execSync').andCallFake(() => {
        throw Error("error")
      })

      let ghc = new Ghc()

      expect(ghc.tidalDataDir()).toBe('')
    })
  })

})
