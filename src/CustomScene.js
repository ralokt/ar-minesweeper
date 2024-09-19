export default class CustomScene {
  constructor({ artifact, mergeConfig, preload }) {
    /*
     * mergeConfig allows us to merge the default config of this scene
     * with the custom config defined in each individual artifact.
     */
    this.config = mergeConfig(artifact, {
      rotationSpeed: 1,
    });
    this.THREE = preload.THREE;

    this.defineBoard();
    this.defineMusic();
    this.resetGameState();
  }

  resetGameState() {
    this.blasted = false;
    this.won = false;
    this.squaresOpened = 0;
    this.musicLevel = 0;
    this.thresholdsLeft = [...this.MUSIC_THRESHOLDS];
    this.nextThreshold = this.thresholdsLeft.pop();
  }

  defineMusic() {
    // layers of music to successively add
    this.MUSIC_BLOCKS = [
`
  sound(\`<
    rim*2 rim*3 rim*2 rim*3
    rim*2 rim*2 rim*3 rim*2
    rim*2 rim*3 rim*2 rim*3
    rim*2 rim*2 rim*3 rim*2
  >*8\`).gain(0.4),
  sound(\`<
    ~ bd ~ ~
    ~ ~ ~ ~
    ~ bd ~ ~
    ~ ~ ~ ~
  >*8\`).gain(5.0)
`,
`
  note(\`<
    d1
    c#1
    a0
    c#1    
  >\`).sound("gm_electric_bass_pick").gain(1.5)
`,
`
  sound(\`<
    ~ ~ ~ ~
    ~ ~ cp [bd cp]
    ~ ~ ~ ~
    ~ ~ [cp bd] cp
  >*8\`)
`,
`
  note(\`<
    [[d2 ~]*2 [d2 ~]*2 [c#2 ~]*2 [a1 ~ d2 ~]]
    ~
    ~
    ~
  >\`).sound("gm_distortion_guitar").gain(1.5),
  note(\`<
    ~
    c#2
    a1
    c#2
  >\`).sound("gm_distortion_guitar").gain(1)
`,
`
  note(\`<
    d6
    c#6
    a5
    c#6
  >\`).sound("gm_distortion_guitar").gain(1.5)
`,
`
  note(\`<
    f#6
    e6
    g#5
    e6
  >\`).sound("gm_distortion_guitar").gain(1.5)
`,
`
  note(\`<
    b6
    a6
    g#5
    a6
  >\`).sound("gm_distortion_guitar").gain(3)
`,
`
  note(\`<
    [[c#5 [g#5 f#5]] d#5]
    [[c#5*2 [g#5 f#5]] d#5]
    [[c#5*2 [f#5 g#5]] d#5]
    [[d#5*2 [f#5 f#5]] c#5]
  >\`).sound("gm_distortion_guitar").gain(5)
`
    ];
    this.VICTORY_MUSIC = `
  sound(\`<
    rim*2 rim rim*2 rim
    rim*2 rim rim rim
    rim*2 rim rim*2 rim
    rim*2 rim rim rim
  >*8\`).gain(0.4),
  sound(\`<
    ~ bd ~ cp
    ~ bd bd [cp*2]
    ~ bd ~ cp
    ~ bd [bd bd] cp
  >*8\`).gain(3.0),
  note(\`<
    [d1 e1] f1 [e1 f1] g1
    [f1 g1] a1*3
    [d1 e1] f1 [e1 f1] g1
    [f1 g1] a1*3
  >*8\`).sound("gm_electric_bass_pick").gain(1.5),
  note(\`<
    [[e2 ~]*2 [d2 ~]*2 [e2 ~]*2 [d2 ~ e2 ~]]
    ~
    [[e2 ~]*2 [d2 ~]*2 [e2 ~]*2 [d2 ~ e2 ~]]
    ~
  >\`).sound("gm_distortion_guitar").gain(1.5),
  note(\`<
    ~
    e2
    ~
    e2
  >\`).sound("gm_distortion_guitar").gain(1),
  note(\`<
    [[c#5*2 [f#5 g#5]] g#5]
    [[c#5*2 [f#5 g#5]] g#5]
    [[f#5*2 [g#5 g#5]] g#5]
    [[b5*2 [f#5 f#5]] g#5]
  >\`).sound("gm_trumpet").gain(5)`;
  }

  defineBoard() {
    // at how many open squares to advance to the next music level
    this.MUSIC_THRESHOLDS = [23, 27, 30, 38, 40, 42, 45].reverse();

    this.victory_coords = [7, 3];
    this.BOARD = `
**********
****556***
***4*2****
**442447**
23*3*3****
0225*66***
12*4****6*
1*23*44*31
1111111110
0000000000
`.trim();
    this.BOARD_W = 10;
    this.BOARD_H = 10;
  }

  async beforeLoadModel({ engine }) {
    this.engine = engine;
    await import("https://unpkg.com/@strudel/repl@1.1.0");
    this.repl = document.createElement('strudel-editor');
    // TODO: change to something completely unused where it can be hidden
    const someDiv = document.getElementById("arm-pointer-lock-activate");
    someDiv.append(this.repl);
    this.updateMusic();
  }

  getMusicCode() {
    let inner;
    if (this.won) {
      inner = this.VICTORY_MUSIC;
    } else {
      const slice = this.MUSIC_BLOCKS.slice(0, this.musicLevel+1);
      inner = slice.join(",\n");
    }
    const code = "stack(\n"+inner+"\n)";
    return code;
  }

  updateMusic() {
    this.repl.editor.setCode(this.getMusicCode());
    this.repl.editor.evaluate();
  }

  afterLoadModel({ engine }) {
    this.model = engine.model;
    [this.pos_x, this.pos_y] = this.curPos();
    this.initObjects();
    this.initBoard();
    this.initAudio();
    for (let xx=0; xx<this.BOARD_W; xx+=1) {
      for (let yy=0; yy<this.BOARD_H; yy+=1) {
        this.putAt(xx, yy, "closed");
      }
    }
    this.openSquare(0,9);
  }

  initAudio() {
    this.clickElem = document.getElementById("three-audio-0");
    this.boomElem = document.getElementById("three-audio-1");
  }

  initObjects() {
    let objs = [];
    let names = [
      "mine",
      "flag",
      "closed",
      "blow",
    ];
    for (let ii=0; ii<9; ii+=1) {
      names.push(""+ii);
    }

    for (let name of names) {
      objs.push(this.model.getObjectByName(name));
    }
    for (let obj of objs.values()) {
      obj.position.set(-4000, -4000, -4000);
    }
  }

  delBoard() {
    for (col of this.board) {
      for (square of col) {
        square[0].removeFromParent();
      }
    }
  }

  initBoard(delOld=true) {
    this.board = [];
    let board_lines = this.BOARD.split("\n");
    for (let xx=0; xx<this.BOARD_W; xx+=1) {
      let col = [];
      for (let yy=0; yy<this.BOARD_H; yy+=1) {
        let sq_def = board_lines[yy][xx];
        if (sq_def == "*") {
          sq_def = "mine";
        }
        col.push([null, sq_def, false]);
      }
      this.board.push(col);
    }
  }

  tick() {
    let [pos_x, pos_y] = this.curPos();
    if (this.pos_x != pos_x || this.pos_y != pos_y) {
      this.posChange(pos_x, pos_y);
    }
    this.pos_x = pos_x;
    this.pos_y = pos_y;
  }

  curPos() {
    return this.posToCoords(this.engine.camera.position);
  }

  posToCoords(pos) {
    let xx = Math.floor(pos.x);
    let yy = Math.floor(pos.z);
    yy += 10;
    xx += 5;
    return [xx, yy];
  }

  coordsInBounds(xx, yy) {
    return 0 <= xx && xx < this.BOARD_W && 0 <= yy && yy < this.BOARD_H;
  }

  posChange(new_x, new_y) {
    if (!this.coordsInBounds(new_x, new_y)) return;
    this.openSquare(new_x, new_y);
  }

  openSquare(x, y) {
    if (this.blasted) return;
    if (this.won) return;
    if (!this.board[x][y][2]) {
      this.putAt(x, y, this.board[x][y][1]);
      this.board[x][y][2] = true;
      this.squaresOpened += 1;
      if (this.board[x][y][1] == "mine") {
        this.boom(x, y);
        return;
      }
      if (x == this.victory_coords[0] && y == this.victory_coords[1]) {
        this.victory();
        return;
      }
      if (this.squaresOpened >= this.nextThreshold) {
        this.musicLevel += 1;
        this.updateMusic();
        this.nextThreshold = this.thresholdsLeft.pop();
      }
      if (this.board[x][y][1] == "0") {
        for (let xx of [x-1, x, x+1].values()) {
          for (let yy of [y-1, y, y+1].values()) {
            if (!this.coordsInBounds(xx, yy)) continue;
            this.openSquare(xx, yy);
          }
        }
      }
    }
  }

  putAt(x, y, name) {
    let obj = this.model.getObjectByName(name).clone();
    obj.position.set(x+0.5-5, 0, y+0.5-10);
    obj.name = name + "-" + x + "-" + y
    this.model.add(obj);
    if (this.board[x][y][0]) {
      let old = this.board[x][y][0];
      this.model.remove(old);
      // old.removeFromParent();
      // console.debug(old);
    }
    this.board[x][y][0] = obj;
  }

  victory() {
    this.won = true;
    this.updateMusic();
  }

  boom(x, y) {
    this.blasted = true;
    this.musicLevel = -1;
    this.updateMusic();
    this.clickElem.play();
    this.clickElem.loop = false;
    setTimeout(() => {
      this.boomElem.play();
      this.boomElem.loop = false;
      this.putAt(x, y, "blow");
    }, 300);
  }

  onPoint(intersects) {
    intersects.forEach(touched => {
      // console.debug(touched.node.material.color);
      // let material = touched.node.material.clone();
      // touched.node.material = material;
      // touched.node.material.color.g = 0.2;
      // touched.node.material.color.b = 0.2;
    });
  }

  onTouch(intersects) {
    // console.debug(intersects);
    intersects.forEach(touched => {
      // console.debug("----------");
      // console.debug(touched);
      // console.debug(touched.node.name);
      // console.debug(touched.node.position);
      let [xx, yy] = this.posToCoords(touched.node.position);
      let cur_state = touched.node.material.name;
      // console.debug("cs", cur_state);
      this.TRANSITIONS = {
        closed: "flag",
        flag: "closed",
      };
      let new_state = this.TRANSITIONS[cur_state];
      // console.debug("ns", new_state);
      // console.debug(xx, yy);
      this.putAt(xx, yy, new_state);
    });
  }
}
