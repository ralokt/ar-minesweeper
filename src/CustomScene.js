import * as THREE from "https://stagingengine.artificialmuseum.com/three.js";

export default class CustomScene {
  constructor({ artifact, mergeConfig, preload }) {
    /*
     * mergeConfig allows us to merge the default config of this scene
     * with the custom config defined in each individual artifact.
     */
    this.config = mergeConfig(artifact, {
      rotationSpeed: 1,
    });

    this.RESTART_X = 4;
    this.RESTART_Y = 15;

    this.defineBoard();
    this.resetGameState();
  }

  async defineMusic() {
    let music_response = await fetch("/music.js");
    let music_source = await music_response.text();
    let music = eval(music_source);
    this.MUSIC_BLOCKS = music.main;
    this.LOSS_MUSIC = music.loss;
    this.VICTORY_MUSIC = music.victory;
  }

  defineBoard() {
    this.BOARD_DEFS = [{
      w: 10,
      h: 10,
      victoryCoords: [6, 6],
      tiles: `
0000000000
0112111110
01*2*11*10
0223111110
01*1112110
01112*4*20
01113*7*30
01*12***20
0111123210
0000000000
    `.trim(),
      // at how many open squares to advance to the next music level
      musicThresholds: [65, 67, 70, 72, 74, 76, 79],
    },{
      w: 10,
      h: 10,
      victoryCoords: [7, 3],
      tiles: `
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
    `.trim(),
      // at how many open squares to advance to the next music level
      musicThresholds: [23, 27, 30, 38, 40, 42, 45],
    }];
    this.curBoardDef = 0;
  }

  getBoardDef() {
    return this.BOARD_DEFS[this.curBoardDef];
  }

  exit() {
    this.repl.editor.stop();
  }

  resetGameState() {
    this.blasted = false;
    this.won = false;
    this.squaresOpened = 0;
    this.musicLevel = 0;
    this.thresholdsLeft = [...this.getBoardDef().musicThresholds].reverse();
    this.nextThreshold = this.thresholdsLeft.pop();
    this.movedSinceReset = 0;
  }

  async beforeLoadModel({ engine }) {
    this.engine = engine;
    let music_promise = this.defineMusic();
    await import("https://unpkg.com/@strudel/repl@1.1.0");
    this.repl = document.createElement('strudel-editor');
    const someDiv = document.createElement("div");
    someDiv.style.setProperty("opacity", "0")
    document.body.append(someDiv);
    someDiv.append(this.repl);
    await music_promise;
    this.updateMusic();
  }

  getMusicCode() {
    let inner;
    if (this.won) {
      inner = this.VICTORY_MUSIC;
    } else if (this.blasted) {
      inner = this.LOSS_MUSIC;
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
    this.initAudio();
    this.initBoard();
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
      "smiley_cool",
      "smiley_cry",
    ];
    for (let ii=0; ii<9; ii+=1) {
      names.push(""+ii);
    }

    for (let name of names) {
      const obj = this.model.getObjectByName(name);
      obj.position.set(-4000, -4000, -4000);
    }


    const plane = this.model.getObjectByName("plane");
    this.model.remove(plane);
    this.engine.camera.add(plane);
    plane.position.set(-4000, -4000, -4000);

    this.initPlane();
  }

  initPlane() {
    this.engine.camera.getObjectByName("plane").position.set(-4000, -4000, -4000);
  }

  delBoard() {
    for (let [xx, col] of this.board.entries()) {
      for (let [yy, square] of col.entries()) {
        this.model.remove(square[0]);
        this.board[xx][yy][0] = null;
      }
    }
  }

  initBoard() {
    this.board = [];
    let board_lines = this.getBoardDef().tiles.split("\n");
    for (let xx=0; xx<this.getBoardDef().w; xx+=1) {
      let col = [];
      for (let yy=0; yy<this.getBoardDef().h; yy+=1) {
        let sq_def = board_lines[yy][xx];
        if (sq_def == "*") {
          sq_def = "mine";
        }
        col.push([null, sq_def, false]);
      }
      this.board.push(col);
    }
    for (let xx=0; xx<this.getBoardDef().w; xx+=1) {
      for (let yy=0; yy<this.getBoardDef().h; yy+=1) {
        this.putAt(xx, yy, "closed");
      }
    }
    this.openSquare(0,9);
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
    return 0 <= xx && xx < this.getBoardDef().w && 0 <= yy && yy < this.getBoardDef().h;
  }

  posChange(new_x, new_y) {
    if (new_x == this.RESTART_X && new_y == this.RESTART_Y) {
        if (this.won || this.blasted) {
            this.doRestart();
        }
    }
    if (this.movedSinceReset == 2) {
        console.debug(new_x, new_y);
        this.message(
            "<em>Numbers</em> tell you how many squares in the <em>adjacent 8 squares</em> are mines.",
            "#fff"
        );
        setTimeout(() => {
            this.message(
                "You can <em>flag</em> squares you think are mines by <em>tapping/clicking</em> them.",
                "#fff",
            );
        }, 3500);
        setTimeout(() => {
          this.message("Find the <em>7</em> to win!", "#ff0");
        }, 7000);
    }
    this.movedSinceReset += 1;
    if (!this.coordsInBounds(new_x, new_y)) return;
    this.openSquare(new_x, new_y);
  }

  message(text, color) {
    const msgElem = document.createElement("div");
    msgElem.innerHTML = text;
    let msgStyle = msgElem.style;
    msgStyle.setProperty("position", "absolute");
    msgStyle.setProperty("top", "0px");
    msgStyle.setProperty("bottom", "0px");
    msgStyle.setProperty("left", "0px");
    msgStyle.setProperty("right", "0px");
    msgStyle.setProperty("font-size", "108px");
    msgStyle.setProperty("text-align", "center");
    msgStyle.setProperty("color", color);
    msgStyle.setProperty("background-color", "#000");
    msgStyle.setProperty("z-index", "11000");
    msgStyle.setProperty("padding-top", "50px");
    msgStyle.setProperty("margin", "200px");
    document.body.appendChild(msgElem);
    msgElem.animate([{
      opacity: 0.5,
    },{
      opacity: 0.5,
      offset: 0.7,
    },{
      opacity: 0.0,
    }],3050);
    setTimeout(() => {
      msgElem.remove();
    }, 3000);
  }

  doRestart() {
    let obj = this.model.getObjectByName("RESTART");
    this.model.remove(obj);
    this.delBoard();
    this.resetGameState();
    this.initBoard();
    this.updateMusic();
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
      const victoryCoords = this.getBoardDef().victoryCoords;
      if (x == victoryCoords[0] && y == victoryCoords[1]) {
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

  putRestartSquare(name) {
    let obj = this.model.getObjectByName(name).clone();
    obj.position.set(this.RESTART_X+0.5-5, 0, this.RESTART_Y+0.5-10);
    obj.name = "RESTART";
    this.model.add(obj);
  }

  putAt(x, y, name) {
    let obj = this.model.getObjectByName(name).clone();
    obj.position.set(x+0.5-5, 0, y+0.5-10);
    obj.name = name + "-" + x + "-" + y
    this.model.add(obj);
    const clickablesReady = typeof(this.engine.controls) !== "undefined";
    if (clickablesReady && (name == "flag" || name == "closed")) {
      this.engine.controls.clickables.push({
          target: "*"+name+"*",
          node: obj,
      });
      this.engine.controls.clickNodes.push(obj);
    }
    if (this.board[x][y][0]) {
      let old = this.board[x][y][0];
      this.model.remove(old);
      if (clickablesReady) {
        let idx = -1;
        for (let [index, clickable] of this.engine.controls.clickables.entries()) {
          if (clickable.node.name === old.name) {
            idx = index;
            break;
          }
        }
        this.engine.controls.clickables.splice(idx, 1);
        idx = -1;
        for (let [index, clickable] of this.engine.controls.clickNodes.entries()) {
          if (clickable.name === old.name) {
            idx = index;
            break;
          }
        }
        this.engine.controls.clickNodes.splice(idx, 1);
      }
    }
    this.board[x][y][0] = obj;
  }

  victory() {
    this.won = true;
    this.updateMusic();
    this.putRestartSquare("smiley_cool");
    this.message("Well done!<br><br>Walk onto the smiley to advance to the next level!", "#ff0");
    this.curBoardDef += 1;
    this.curBoardDef %= this.BOARD_DEFS.length;
  }

  boom(xx, yy) {
    this.blasted = true;
    this.musicLevel = -1;
    this.repl.editor.stop();
    this.updateMusic();
    this.clickElem.play();
    this.clickElem.loop = false;
    setTimeout(() => {
      this.boomElem.play();
      this.boomElem.loop = false;
      this.putAt(xx, yy, "blow");
      setTimeout(() => {
        const flashFade = document.createElement("div");
        flashFade.id = "flashFade";
        let flashStyle = flashFade.style;
        flashStyle.setProperty("position", "absolute");
        flashStyle.setProperty("top", "0px");
        flashStyle.setProperty("bottom", "0px");
        flashStyle.setProperty("left", "0px");
        flashStyle.setProperty("right", "0px");
        flashStyle.setProperty("z-index", "10200");
        document.body.appendChild(flashFade);
        flashFade.animate([{
          opacity: 0.9,
          background: "#fff",
        },{
          opacity: 0.7,
          background: "#fff",
          offset: 0.3,
        },{
          opacity: 0.5,
          background: "#000",
          offset: 0.8,
        },{
          opacity: 0.5,
          background: "#000",
        }],4900);
      }, 100);

      const video = document.getElementById('three-video');
      video.currentTime = 0;
      video.play();

      const plane = this.engine.camera.getObjectByName('plane');
      plane.scale.set(4,2,2);
      const oldDF = plane.material.depthFunc;
      plane.material.depthFunc = THREE.AlwaysDepth;
      const {x,y,z} = this.engine.camera.position;
      plane.position.set(x-0.7, y-0.7, z-0.6);
      plane.rotation.set(Math.PI / 2, 0, 0);
      this.engine.camera.add(plane);
      setTimeout(() => {
        this.message("You are dead.<br><br>Walk onto the smiley to restart!", "#f00");
      }, 3000);
      setTimeout(() => {
        this.putRestartSquare("smiley_cry");
        plane.material.depthFunc = oldDF;
        this.initPlane();
        document.getElementById("flashFade").remove();
      }, 5000);
    }, 300);
  }

  onTouch(intersects) {
    if (this.won || this.blasted) return;
    intersects.forEach(touched => {
      let [xx, yy] = this.posToCoords(touched.node.position);
      if (this.board[xx][yy][2]) return;
      let cur_state = touched.node.material.name;
      this.TRANSITIONS = {
        closed: "flag",
        flag: "closed",
      };
      let new_state = this.TRANSITIONS[cur_state];
      this.putAt(xx, yy, new_state);
    });
  }
}
