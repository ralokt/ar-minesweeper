[{
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
  // at how many open squares to add the respective music layer
  musicThresholds: [65, 67, 70, 72, 74, 76, 79],
  initialOpen: [0, 9]
},{
  w: 10,
  h: 10,
  victoryCoords: [4, 5],
  tiles: `
012*10001*
01*2100011
1221011100
1*2233*100
223***3111
1*347*301*
123***3111
01*444*111
0112*2112*
000111002*
  `.trim(),
  // at how many open squares to add the respective music layer
  musicThresholds: [13, 19, 26, 33, 62, 66, 69],
  initialOpen: [0, 9]
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
  // at how many open squares to add the respective music layer
  musicThresholds: [23, 27, 30, 38, 40, 42, 45],
  initialOpen: [0, 9]
}]
