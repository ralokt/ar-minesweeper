export default {
  name: 'Artifact',
  slug: 'artifact',

  fpsControls: true,
  pointerLockControls: {
    speed: 1,
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
  ],

  clickables: [
    "*closed*",
    "*flag*"
  ],

  clickablesArePointable: true,

  audioElements: [{
    "audio": "http://localhost:8000/snd/click.mp3",
    "autoplay": false
  },{
    "audio": "http://localhost:8000/snd/boom.mp3",
    "autoplay": false
  }]
}
