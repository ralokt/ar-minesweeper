export default {
  name: 'Artifact',
  slug: 'artifact',

  fpsControls: true,
  pointerLockControls: {
    speed: 5,
  },
  version: 1,

  /*
   * type
   *
   * which scene type to load.
   * -1 loads src/CustomScene.js
   */
  type: -1,

  /*
   * sky
   *
   * will load src/skybox.jpg as skybox image.
   * the leading slash is important
   */
  sky: '/skybox',

  /*
   * will load src/artifact.glb
   */
  file: [
    "/glb/0.glb",
    "/glb/1.glb",
    "/glb/2.glb",
    "/glb/3.glb",
    "/glb/4.glb",
    "/glb/5.glb",
    "/glb/6.glb",
    "/glb/7.glb",
    "/glb/8.glb",
    "/glb/mine.glb",
    "/glb/blow.glb",
    "/glb/flag.glb",
    "/glb/closed.glb",
    "https://cdn.glitch.global/680d9e3c-bcad-4b00-b719-7d699c1a70fe/plane.glb?v=1726765084363",
  ],

  clickables: [
    "*closed*",
    "*flag*"
  ],

  clickablesArePointable: true,

  audioElements: [{
    "audio": "/snd/click.mp3",
    "autoplay": false
  },{
    "audio": "/snd/boom.mp3",
    "autoplay": false
  }],

  video: 'https://cdn.glitch.global/680d9e3c-bcad-4b00-b719-7d699c1a70fe/blood2.mp4?v=1726765048856',
  videoTargets: ['plane'],
  loopVideo: false,
  triggerVideo: false,

  chromaKey: {
    v2: true,
    keyColor: 0x00fd3d,
    width: 512,
    height: 1024,
    similarity: 0.2,
    smoothness: 0.2,
    spill: 0.5,
  },
}
