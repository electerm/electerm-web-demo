export class FitAddon { activate () {} dispose () {} }
export class AttachAddon { activate () {} dispose () {} }
export class WebLinksAddon { activate () {} dispose () {} }
export class CanvasAddon { activate () {} dispose () {} }
export class WebglAddon { activate () {} dispose () {} }
export class SearchAddon { activate () {} dispose () {} }
export class LigaturesAddon { activate () {} dispose () {} }
export class Unicode11Addon {
  activate (t) {
    t.unicode.register({
      version: '11',
      wcwidth: () => 1,
      charProperties: () => 1
    })
  }

  dispose () {}
}
export class ImageAddon { activate () {} dispose () {} }
