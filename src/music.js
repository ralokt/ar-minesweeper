// not a json because fuck json for not having multiline strings
({
  // layers of music to successively add
  main: [
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
`,`
    note(\`<
      d1
      c#1
      a0
      c#1
    >\`).sound("gm_electric_bass_pick").gain(2.5)
`,`
    sound(\`<
      ~ ~ ~ ~
      ~ ~ cp [bd cp]
      ~ ~ ~ ~
      ~ ~ [cp bd] cp
    >*8\`)
`,`
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
`,`
    note(\`<
      d6
      c#6
      a5
      c#6
    >\`).sound("gm_distortion_guitar").gain(1.5)
`,`
    note(\`<
      f#6
      e6
      g#5
      e6
    >\`).sound("gm_distortion_guitar").gain(1.5)
`,`
    note(\`<
      b6
      a6
      g#5
      a6
    >\`).sound("gm_distortion_guitar").gain(3)
`,`
    note(\`<
      [[c#5 [g#5 f#5]] d#5]
      [[c#5*2 [g#5 f#5]] d#5]
      [[c#5*2 [f#5 g#5]] d#5]
      [[d#5*2 [f#5 f#5]] c#5]
    >\`).sound("gm_distortion_guitar").gain(5)
`
  ],
  loss: `
    note(\`<
      a7
      a7
      a7
      a7
    >/2\`).sound("gm_distortion_guitar").gain(5),
    note(\`<
      g#7
      g#7
      g#7
      g#7
    >/2\`).sound("gm_distortion_guitar").gain(5)
`,
  victory: `
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
    >\`).sound("gm_trumpet").gain(5)
`
})
