//--------------------------------------------------------------------------------------------------------------------------------|Variable Section
var pause = false;
var health = 64;
var hunger = 64;
var purity = 64;
var joy = 64;
var drawScreenInterval;
if (window.innerWidth<512) {var screenScale=Math.floor(window.innerWidth/128);
} else {var screenScale=4;}
var currentFires = [];
var timeCounter = 0;
var lastRandEvent = 0;


//--------------------------------------------------------------------------------------------------------------------------------|Class - Grid
class grid {
  constructor() {
    this.s = width/128;   // Cell Size
    this.cells = [];
    this.cellsLog;
    for (var row=0; row<128; row++) {
      var rowHold = [];
      for (var col=0; col<128; col++) {
        rowHold.push(0);
      }
      this.cells.push(rowHold);
    }

    for (var row=112; row<128; row++) {
      for (var col=0; col<128; col++) {
        this.cells[row][col] = 2;
      }
    }

    for (var row=0; row<16; row++) {
      for (var col=0; col<16; col++) {
        if (ui.dIcon1(row,col)) {this.cells[row+112][col]=1;}
        if (ui.dIcon2(row,col)) {this.cells[row+112][col+16]=1;}
        if (ui.dIcon3(row,col)) {this.cells[row+112][col+32]=1;}
        if (ui.dIcon4(row,col)) {this.cells[row+112][col+48]=1;}
        if (ui.dIcon5(row,col)) {this.cells[row+112][col+64]=1;}
        if (ui.dIcon6(row,col)) {this.cells[row+112][col+80]=1;}
        if (ui.dIcon7(row,col)) {this.cells[row+112][col+96]=1;}
      }
    }
  }

  update() {
    this.s = width/128;
  }

  draw() {
    this.cellsLog = this.cells;
    strokeWeight(0);
    for (var row=0; row<this.cells.length; row++) {
      for (var col=0; col<this.cells[0].length; col++) {
        if (this.cells[row][col]==0) {noFill();
        } else if (this.cells[row][col]==1) {fill(44,44,46);
        } else if (this.cells[row][col]==2) {fill(126,130,132);}
        rect(col*this.s,row*this.s,this.s,this.s);
      }
    }
  }
}


//--------------------------------------------------------------------------------------------------------------------------------|Class - VPet
class vPet {
  constructor() {
    this.stats = [health,hunger,purity,joy];
    this.x = 50;
    this.y = 50;
    this.statLog = [];
    this.idleFrame1 = stage1Art1;
    this.idleFrame2 = stage1Art2;
    this.idleFrame3 = stage1Art3;
    this.idleLog = [this.idleFrame1,this.idleFrame2,this.idleFrame1,this.idleFrame3];
    this.currentArt = this.idleLog[0];
    this.h = this.currentArt.length*2;
    this.w = this.currentArt[0].length*2;
    this.intervalCounter = 0;
  }

  detectClick() {
    if (mouseX>this.x*gameScreen.s&&mouseX<(this.x+32)*gameScreen.s&&mouseY>this.y*gameScreen.s&&mouseY<(this.y+32)*gameScreen.s) {
      animation.play("headpat");
      health+=shinotchi.statMod("health",health,4,true);
      hunger+=shinotchi.statMod("hunger",hunger,4,true);
      purity+=shinotchi.statMod("purity",purity,4,true);
      joy+=shinotchi.statMod("joy",joy,4,true);
    }
  }

  updateStats() {
    if (health>128) {health=128;} else if (health<0) {health=0;}
    if (hunger>128) {hunger=128;} else if (hunger<0) {hunger=0;}
    if (purity>128) {purity=128;} else if (purity<0) {purity=0;}
    if (joy>128) {joy=128;} else if (joy<0) {joy=0;}
    this.stats[0] = health;
    this.stats[1] = hunger;
    this.stats[2] = purity;
    this.stats[3] = joy;
  }

  randStatDown() {
    switch (Math.floor(Math.random()*5)) {
      case 0:
        health+=shinotchi.statMod("health",health,-1,false);
        break;
      case 1:
        hunger+=shinotchi.statMod("hunger",hunger,-1,false);
        break;
      case 2:
        purity+=shinotchi.statMod("purity",purity,-1,false);
        break;
      case 3:
        joy+=shinotchi.statMod("joy",joy,-1,false);
        break;
    }
  }

  statMod(statName,stat,amount,primary) {
    var returnVal;
    var randMod = Math.floor(Math.random()*40+80)/100;
    var repeatMod = 0;
    this.statLog.forEach(function(value,index) {if (value==statName) {repeatMod+=1;}});
    if (primary) {this.statLog.push(statName);}
    if (this.statLog.length>8) {this.statLog.shift();}

    if (amount>0) {
      if (stat<32) {returnVal=Math.floor(amount*1.4*randMod-repeatMod);
      } else if (stat>96) {returnVal=Math.floor(amount*.8*randMod-repeatMod);
      } else {returnVal=Math.floor(amount*randMod-repeatMod);}
      if (returnVal<4) {return 4;
      } else {return returnVal;}
    } else {
      if (stat<32) {returnVal=Math.floor(amount*.8*randMod+repeatMod);
      } else if (stat>96) {returnVal=Math.floor(amount*1.4*randMod+repeatMod);
      } else {returnVal=Math.floor(amount*randMod+repeatMod);}
      if (returnVal>-1) {return -1;
      } else {return returnVal;}
    }
  }

  movement() {
    if (!animation.playingAni&&!ui.displayingMenu) {
      switch (Math.floor(Math.random()*7)) {
        case 6:
          var xChange = 4;
          break;
        case 5:case 4:
        var xChange = 2;
        break;
        case 3:
          var xChange = -4;
          break;
        case 2:case 1:
          var xChange = -2;
          break;
        default:
          var xChange = 0;
      }
      switch (Math.floor(Math.random()*7)) {
        case 6:
          var yChange = 4;
          break;
        case 5:case 4:
        var yChange = 2;
        break;
        case 3:
          var yChange = -4;
          break;
        case 2:case 1:
          var yChange = -2;
          break;
        default:
          var yChange = 0;
      }
      if (shinotchi.x+xChange<=96&&shinotchi.x+xChange>=0) {shinotchi.x+=xChange;}
      if (shinotchi.y+yChange<=72&&shinotchi.y+yChange>=20) {shinotchi.y+=yChange;}}
  }

  intervalUpdate() {
    if (!pause&&!animation.playingAni&&!ui.displayingOptionsMenu) {
      shinotchi.idleLog.push(shinotchi.idleLog[0]);
      shinotchi.idleLog.shift();
      shinotchi.currentArt = shinotchi.idleLog[0];
    }
    if (!pause&&!ui.displayingMenu) {
      shinotchi.intervalCounter += 1;
      if (shinotchi.intervalCounter==2) {
        shinotchi.randStatDown();
      } else if (shinotchi.intervalCounter==4) {
        shinotchi.randStatDown();
        shinotchi.movement();
        shinotchi.intervalCounter = 0;
      }
    }
  }

  display(xPos,yPos) {
    for (var row=0; row<16; row++) {
      for (var col=0; col<16; col++) {
        if (this.currentArt[row][col]==1) {
          gameScreen.cells[row+row+yPos][col+col+xPos] = 1;
          gameScreen.cells[row+row+yPos+1][col+col+xPos] = 1;
          gameScreen.cells[row+row+yPos][col+col+xPos+1] = 1;
          gameScreen.cells[row+row+yPos+1][col+col+xPos+1] = 1;
        } else if (this.currentArt[row][col]==3) {
          gameScreen.cells[row+row+yPos][col+col+xPos] = 0;
          gameScreen.cells[row+row+yPos+1][col+col+xPos] = 0;
          gameScreen.cells[row+row+yPos][col+col+xPos+1] = 0;
          gameScreen.cells[row+row+yPos+1][col+col+xPos+1] = 0;
        }
      }
    }
  }
}


//--------------------------------------------------------------------------------------------------------------------------------|Class - Game Interface
class gameInterface {
  constructor() {
    this.icon1 = exerciseIcon;
    this.icon2 = eatIcon;
    this.icon3 = cleanIcon;
    this.icon4 = paintIcon;
    this.icon5 = statInfoIcon;
    this.icon6 = petInfoIcon;
    this.icon7 = optionsIcon;
    this.icon8 = pauseIcon;
    this.displayingMenu = false;
    this.displayingStatsMenu = false;
    this.displayingPetMenu = false;
    this.displayingOptionsMenu = false;
    this.menuButtons = [];
  }

  dIcon1(row,col) {if (this.icon1[row][col]==1) {return true;} else {return false;}}
  dIcon2(row,col) {if (this.icon2[row][col]==1) {return true;} else {return false;}}
  dIcon3(row,col) {if (this.icon3[row][col]==1) {return true;} else {return false;}}
  dIcon4(row,col) {if (this.icon4[row][col]==1) {return true;} else {return false;}}
  dIcon5(row,col) {if (this.icon5[row][col]==1) {return true;} else {return false;}}
  dIcon6(row,col) {if (this.icon6[row][col]==1) {return true;} else {return false;}}
  dIcon7(row,col) {if (this.icon7[row][col]==1) {return true;} else {return false;}}

  displayPauseIcons() {
    if (!pause) {this.icon8 = pauseIcon;
    } else if (pause) {this.icon8 = playIcon;}
    for (var row=0; row<16; row++) {
      for (var col=0; col<16; col++) {
        if (this.icon8[row][col]==1) {gameScreen.cells[row+112][col+112]=1;
        } else {gameScreen.cells[row+112][col+112]=2;}
      }
    }
  }

  displayStatsMenu() {
    gameScreen.cells[0].forEach(function(currentValue,index){
      gameScreen.cells[0][index] = 2;
      gameScreen.cells[1][index] = 2;
    });
    for (var i=0; i<112; i++) {
      [0,15,16,31,32,47,48,63,64,127].forEach(function(val) {
        gameScreen.cells[i][val] = 2;
      });
    }

    //stat value bar graph
    for (var col=0; col<14; col++) {
      for (var row=0; row<110*(health/128); row++) {gameScreen.cells[111-row][1+col]=1;}
      for (var row=0; row<110*(hunger/128); row++) {gameScreen.cells[111-row][17+col]=1;}
      for (var row=0; row<110*(purity/128); row++) {gameScreen.cells[111-row][33+col]=1;}
      for (var row=0; row<110*(joy/128); row++) {gameScreen.cells[111-row][49+col]=1;}
    }

    shinotchi.display(80,64);

    //display different icon depending on stat average (or "mood" if I have time to implement it)
    if ((health+hunger+purity+joy)/4>96) {
      for (var i=13; i<19; i++) {statusBubble[13][i]=0;}
      for (var i=12; i<20; i++) {statusBubble[12][i]=1;}
      for (var i=14; i<18; i++) {statusBubble[15][i]=1;}
      [[13,12],[13,19],[14,13],[14,18]].forEach(function(val){statusBubble[val[0]][val[1]]=1;});
    } else if ((health+hunger+purity+joy)/4<32) {
      for (var i=12; i<20; i++) {statusBubble[12][i]=0;}
      for (var i=14; i<18; i++) {statusBubble[15][i]=0;}
      [[13,12],[13,13],[13,18],[13,19]].forEach(function(val){statusBubble[val[0]][val[1]]=0;});
      for (var i=14; i<18; i++) {statusBubble[13][i]=1;}
      statusBubble[14][13] = 1;
      statusBubble[14][18] = 1;
    } else {
      for (var i=12; i<20; i++) {statusBubble[12][i]=0;}
      for (var i=14; i<18; i++) {statusBubble[15][i]=0;}
      [[13,12],[13,19],[14,13],[14,18]].forEach(function(val){statusBubble[val[0]][val[1]]=0;});
      for (var i=13; i<19; i++) {statusBubble[13][i]=1;}
    }

    statusBubble.forEach(function(currentValue,index) {
      statusBubble[index].forEach(function(currentValue2,index2) {
        if (statusBubble[index][index2]==1) {
          gameScreen.cells[index+22][index2+80] = 1;
        }
      });
    });
  }

  displayPetMenu() {
    gameScreen.cells[0].forEach(function(currentValue,index){
      gameScreen.cells[0][index] = 2;
      gameScreen.cells[1][index] = 2;
    });
    for (var i=0; i<112; i++) {
      [0,127].forEach(function(val) {gameScreen.cells[i][val]=2;});
    }

    //time text
    for (var row=0; row<petTimeText.length; row++) {
      for (var col=0; col<petTimeText[0].length; col++) {
        if (petTimeText[row][col]==1&&gameScreen.cells[row][col]!=1) {
          gameScreen.cells[row+6][col+3] = 1;
        }
      }
    }
    //minutes text
    for (var row=0; row<petMinText.length; row++) {
      for (var col=0; col<petMinText[0].length; col++) {
        if (petMinText[row][col]==1&&gameScreen.cells[row][col]!=1) {
          gameScreen.cells[row+6][col+71] = 1;
        }
      }
    }

    if (Math.floor(timeCounter/480)<10) {
      var timeMinNum1 = numbers[0];
      var timeMinNum2 = numbers[0];
      var timeMinNum3 = numbers[Math.floor(timeCounter/480)];
    }else if (Math.floor(timeCounter/480)<100) {
      let minNumHolder = [];
      var minNumString = Math.floor(timeCounter/480).toString();
      for (var i=0; i<minNumString.length; i++) {minNumHolder.push(minNumString.charAt(i));}
      var timeMinNum1 = numbers[0];
      var timeMinNum2 = numbers[minNumHolder[0]];
      var timeMinNum3 = numbers[minNumHolder[1]];
    } else {
      let minNumHolder = [];
      var minNumString = Math.floor(timeCounter/480).toString();
      for (var i=0; i<minNumString.length; i++) {minNumHolder.push(minNumString.charAt(i));}
      var timeMinNum1 = numbers[minNumHolder[0]];
      var timeMinNum2 = numbers[minNumHolder[1]];
      var timeMinNum3 = numbers[minNumHolder[2]];
    }
    for (var row=0; row<6; row++) {
      for (var col=0; col<6; col++) {
        if (timeMinNum1[row][col]==1) {gameScreen.cells[row+6][col+43]=1;}
        if (timeMinNum2[row][col]==1) {gameScreen.cells[row+6][col+51]=1}
        if (timeMinNum3[row][col]==1) {gameScreen.cells[row+6][col+59]=1}
      }
    }
  }

  displayOptionsMenu() {
    gameScreen.cells[0].forEach(function(currentValue,index) {
      gameScreen.cells[0][index] = 2;
      gameScreen.cells[1][index] = 2;
      gameScreen.cells[16][index] = 2;
      gameScreen.cells[17][index] = 2;
    });
    for (var i=0; i<112; i++) {
      gameScreen.cells[i][0] = 2;
      gameScreen.cells[i][127] = 2;
    }

    //screen scale text
    for (var row=0; row<optScreenSizeText.length; row++) {
      for (var col=0; col<optScreenSizeText[0].length; col++) {
        if (optScreenSizeText[row][col]==1&&gameScreen.cells[row][col]!=1) {
          gameScreen.cells[row+6][col+3] = 1;
        }
      }
    }

    //screen scale arrows
    for (var row=7; row<11; row++) {
      gameScreen.cells[row][98] = 1;
      gameScreen.cells[row][117] = 1;
    }
    gameScreen.cells[8][97] = 1;
    gameScreen.cells[9][97] = 1;
    gameScreen.cells[8][118] = 1;
    gameScreen.cells[9][118] = 1;

    // screen scale numbers
    if (screenScale<10) {
      var displayNum1 = numbers[0];
      var displayNum2 = numbers[screenScale];
    } else {
      let numHolder = [];
      var numString = screenScale.toString();
      for (var i=0; i<numString.length; i++) {numHolder.push(numString.charAt(i));}
      var displayNum1 = numbers[numHolder[0]];
      var displayNum2 = numbers[numHolder[1]];
    }
    for (var row=0; row<6; row++) {
      for (var col=0; col<6; col++) {
        if (displayNum1[row][col]==1) {gameScreen.cells[row+6][col+101]=1;}
        if (displayNum2[row][col]==1) {gameScreen.cells[row+6][col+109]=1}
      }
    }
  }

  draw() {
    if (this.displayingStatsMenu||this.displayingPetMenu||this.displayingOptionsMenu) {
      this.displayingMenu = true;
    } else {this.displayingMenu = false;}

    if (this.displayingMenu) {
      for (var i=0; i<112; i++) {
        gameScreen.cells[i].forEach(function(currentValue,index) {
          gameScreen.cells[i][index] = 0;
        });
      }
    }
    if (this.displayingStatsMenu) {
      this.displayStatsMenu();
    } else if (this.displayingPetMenu) {
      this.displayPetMenu();
    } else if (this.displayingOptionsMenu) {
      this.displayOptionsMenu();
      if (this.menuButtons.length==0) {
        this.menuButtons.push(new button(95,101,6,12,"gameSizeDown"));
        this.menuButtons.push(new button(115,121,6,12,"gameSizeUp"));
      }
    } else if (this.menuButtons.length>0) {
      this.menuButtons = [];
    }
  }
}


//--------------------------------------------------------------------------------------------------------------------------------|Class - Button
class button {
  constructor(xNeg,xPos,yNeg,yPos,func) {
    this.xn = xNeg;
    this.xp = xPos;
    this.yn = yNeg;
    this.yp = yPos;
    this.f = func;
  }

  detectHover() {
    if (mouseX>this.xn*gameScreen.s&&mouseX<this.xp*gameScreen.s&&mouseY>this.yn*gameScreen.s&&mouseY<this.yp*gameScreen.s) {
      return true;
    } else {
      return false;
    }
  }

  detectClick() {
    if (this.detectHover()) {
      switch (this.f) {
        case "exercise":
          animation.play("exercise");
          health+=shinotchi.statMod("health",health,16,true);
          hunger+=shinotchi.statMod("hunger",hunger,-8,false);
          break;
        case "eat":
          animation.play("eat");
          hunger+=shinotchi.statMod("hunger",hunger,16,true);
          purity+=shinotchi.statMod("purity",purity,-8,false);
          break;
        case "clean":
          animation.play("clean");
          purity+=shinotchi.statMod("purity",purity,16,true);
          joy+=shinotchi.statMod("joy",joy,-8,false);
          break;
        case "paint":
          animation.play("paint");
          joy+=shinotchi.statMod("joy",joy,16,true);
          health+=shinotchi.statMod("health",health,-8,false);
          break;
        case "statInfo":
          if (!ui.displayingStatsMenu) {ui.displayingStatsMenu = true;
          } else {ui.displayingStatsMenu = false;}
          break;
        case "petInfo":
          if (!ui.displayingPetMenu) {ui.displayingPetMenu = true;
          } else {ui.displayingPetMenu = false;}
          break;
        case "options":
          if (!ui.displayingOptionsMenu) {ui.displayingOptionsMenu = true;
          } else {ui.displayingOptionsMenu = false;}
          break;
        case "pause":
          if (!pause) {pause = true;
          } else {pause = false;}
          break;
        case "gameSizeDown":
          changeGameSize("down");
          break;
        case "gameSizeUp":
          changeGameSize("up");
          break;
      }
    }
  }

  displayOutline() {
    if (this.detectHover()) {
      for (var row=0; row<16; row++) {
        for (var col=0; col<16; col++) {
          if (btnOutline[row][col]==1) {gameScreen.cells[row+this.yn][col+this.xn]=1;}
        }
      }
    } else if (gameScreen.cells[this.yn][this.xn]==1) {
      for (var row=0; row<16; row++) {
        for (var col=0; col<16; col++) {
          if (btnOutline[row][col]==1) {gameScreen.cells[row+this.yn][col+this.xn]=2;}
        }
      }
    }
  }
}


//--------------------------------------------------------------------------------------------------------------------------------|Class - Animations
class animationsClass {
  constructor() {
    this.playingAni = false;
    this.x;
    this.y;
    this.currentArt;
    this.aniLog;
    this.currentObject;
    this.aniObjectLog;
    this.objectOff;
    this.aniInt;
    this.aniCounter = 0;
    this.frameCount;
    this.drawingAni = false;
  }

  play(name) {
    this.stopAni();
    this.x = shinotchi.x;
    this.y = shinotchi.y;
    this.playingAni = true;
    if (name=="exercise") {
      this.aniLog = [stage1ArtExercise2Temp,stage1ArtExercise1Temp];
      this.aniObjectLog = [sweatFrame1,sweatFrame2];
      this.objectOff = [0,-4];
      this.frameCount = 7;
    } else if (name=="eat") {
      this.aniLog = [stage1ArtEat1,stage1ArtEat2];
      this.aniObjectLog = [dangoFrame1,dangoFrame2,dangoFrame2,dangoFrame3,dangoFrame3,dangoFrame4];
      this.objectOff = [-26,0];
      this.frameCount = 6;
    } else if (name=="clean") {
      this.aniLog = [stage1ArtClean1,stage1ArtClean2,stage1ArtClean3,stage1ArtClean4,stage1ArtClean5,stage1ArtClean4,stage1ArtClean5,stage1ArtClean3];
      this.aniObjectLog = [showerCurtinArt];
      this.objectOff = [0,0];
      this.frameCount = 8;
    } else if (name=="paint") {
      this.aniLog = [stage1ArtDraw1,stage1ArtDraw2,stage1ArtDraw3,stage1ArtDraw4,stage1ArtDraw1,stage1ArtDraw2,shinotchi.idleFrame1];
      this.aniObjectLog = [drawTailFrame1,drawTailFrame2,drawTailFrame3,drawTailFrame4,drawTailFrame5,drawTailFrame6,0];
      this.objectOff = [4,4];
      this.frameCount = 7;
      this.drawingAni = true;
    } else if (name=="headpat") {
      this.aniLog = [stage1ArtHeadpat];
      this.aniObjectLog = [headpatHandFrame1,headpatHandFrame2,headpatHandFrame1,headpatHandFrame3];
      this.objectOff = [6,12];
      this.frameCount = 9;
    } else if (name=="32x32Art") {
      this.aniLog = [stage1Art32x32];
      this.aniObjectLog = [0];
      this.objectOff = [0,0];
      this.frameCount = 3;
    } else if (name=="glitch") {
      this.aniLog = [stage1Glitch1_1,stage1Glitch2_1];
      this.aniObjectLog = [stage1Glitch2_1,stage1Glitch2_2];
      this.objectOff = [3,-4];
      this.frameCount = 2;
    }
    this.currentArt = this.aniLog[0];
    this.currentObject = this.aniObjectLog[0];
    this.aniInt = setInterval(animation.initiateAni,500);
  }

  initiateAni() {
    if (animation.aniLog.length>1) {
      if (animation.aniLog.length<animation.frameCount) {
        animation.aniLog.push(animation.aniLog[0]);}
      animation.aniLog.shift();
      animation.currentArt = animation.aniLog[0];
    }

    if (animation.aniObjectLog.length>1) {
      if (animation.aniObjectLog.length<animation.frameCount) {
        animation.aniObjectLog.push(animation.aniObjectLog[0]);}
      animation.aniObjectLog.shift();
      animation.currentObject = animation.aniObjectLog[0];
    }

    animation.aniCounter += 1;
    if (animation.aniCounter>=animation.frameCount) {
      if (animation.drawingAni) {
        switch (Math.floor(Math.random()*12)) {
          case 0:
            animation.currentObject = drawingArt01;
            break;
          case 1:
            animation.currentObject = drawingArt02;
            break;
          case 2:
            animation.currentObject = drawingArt03;
            break;
          case 3:
            animation.currentObject = drawingArt04;
            break;
          case 4:
            animation.currentObject = drawingArt05;
            break;
          case 5:
            animation.currentObject = drawingArt06;
            break;
          case 6:
            animation.currentObject = drawingArt07;
            break;
          case 7:
            animation.currentObject = drawingArt08;
            break;
          case 8:
            animation.currentObject = drawingArt09;
            break;
          case 9:
            animation.currentObject = drawingArt10;
            break;
          case 10:
            animation.currentObject = drawingArt11;
            break;
          case 11:
            animation.currentObject = drawingArt12;
            break;
        }
        clearInterval(animation.aniInt);
      } else {
        animation.stopAni();
      }
    }
  }

  stopAni() {
    animation.aniCounter = 0;
    animation.playingAni = false;
    animation.drawingAni = false;
    clearInterval(animation.aniInt);
  }

  display() {
    if (this.currentArt.length>16) {
      for (var row=0; row<this.currentArt.length; row++) {
        for (var col=0; col<this.currentArt[0].length; col++) {
          if (this.currentArt[row][col]==1) {
            gameScreen.cells[row+this.y][col+this.x] = 1;
          } else if (this.currentArt[row][col]==3) {
            gameScreen.cells[row+this.y][col+this.x] = 0;
          }
        }
      }
    } else {
      for (var row=0; row<16; row++) {
        for (var col=0; col<16; col++) {
          if (this.currentArt[row][col]==1) {
            gameScreen.cells[row+row+this.y][col+col+this.x] = 1;
            gameScreen.cells[row+row+this.y+1][col+col+this.x] = 1;
            gameScreen.cells[row+row+this.y][col+col+this.x+1] = 1;
            gameScreen.cells[row+row+this.y+1][col+col+this.x+1] = 1;
          } else if (this.currentArt[row][col]==3) {
            gameScreen.cells[row+row+this.y][col+col+this.x] = 0;
            gameScreen.cells[row+row+this.y+1][col+col+this.x] = 0;
            gameScreen.cells[row+row+this.y][col+col+this.x+1] = 0;
            gameScreen.cells[row+row+this.y+1][col+col+this.x+1] = 0;
          }
        }
      }
    }
  }

  displayObj() {
    if (this.drawingAni&&this.aniCounter>=this.frameCount) {
      for (var i=0; i<66; i++) {
        gameScreen.cells[23+i][31] = 2;
        gameScreen.cells[23+i][96] = 2;
        gameScreen.cells[23][31+i] = 2;
        gameScreen.cells[88][31+i] = 2;
      }
      for (var row=0; row<32; row++) {
        for (var col=0; col<32; col++) {
          if (this.currentObject[row][col]==1) {
            gameScreen.cells[row+row+24][col+col+32] = 1;
            gameScreen.cells[row+row+24+1][col+col+32] = 1;
            gameScreen.cells[row+row+24][col+col+32+1] = 1;
            gameScreen.cells[row+row+24+1][col+col+32+1] = 1;
          } else if (this.currentObject[row][col]==3) {
            gameScreen.cells[row+row+24][col+col+32] = 0;
            gameScreen.cells[row+row+24+1][col+col+32] = 0;
            gameScreen.cells[row+row+24][col+col+32+1] = 0;
            gameScreen.cells[row+row+24+1][col+col+32+1] = 0;
          }
        }
      }
    } else {
      for (var row=0; row<this.currentObject.length; row++) {
        for (var col=0; col<this.currentObject[0].length; col++) {
          if (this.currentObject!=0&&this.currentObject[row][col]==1) {
            gameScreen.cells[row+row+this.y+this.objectOff[1]][col+col+this.x+this.objectOff[0]] = 1;
            gameScreen.cells[row+row+this.y+this.objectOff[1]+1][col+col+this.x+this.objectOff[0]] = 1;
            gameScreen.cells[row+row+this.y+this.objectOff[1]][col+col+this.x+this.objectOff[0]+1] = 1;
            gameScreen.cells[row+row+this.y+this.objectOff[1]+1][col+col+this.x+this.objectOff[0]+1] = 1;
          } else if (this.currentObject!=0&&this.currentObject[row][col]==2) {
            gameScreen.cells[row+row+this.y+this.objectOff[1]][col+col+this.x+this.objectOff[0]] = 2;
            gameScreen.cells[row+row+this.y+this.objectOff[1]+1][col+col+this.x+this.objectOff[0]] = 2;
            gameScreen.cells[row+row+this.y+this.objectOff[1]][col+col+this.x+this.objectOff[0]+1] = 2;
            gameScreen.cells[row+row+this.y+this.objectOff[1]+1][col+col+this.x+this.objectOff[0]+1] = 2;
          } else if (this.currentObject!=0&&this.currentObject[row][col]==3) {
            gameScreen.cells[row+row+this.y+this.objectOff[1]][col+col+this.x+this.objectOff[0]] = 0;
            gameScreen.cells[row+row+this.y+this.objectOff[1]+1][col+col+this.x+this.objectOff[0]] = 0;
            gameScreen.cells[row+row+this.y+this.objectOff[1]][col+col+this.x+this.objectOff[0]+1] = 0;
            gameScreen.cells[row+row+this.y+this.objectOff[1]+1][col+col+this.x+this.objectOff[0]+1] = 0;
          }
        }
      }
    }
  }
}


//--------------------------------------------------------------------------------------------------------------------------------|Class - Fire
class fire {
  constructor(x,y) {
    switch (Math.floor(Math.random()*4)) {
      case 0:default:
        this.aniFrames = [fireFrame1,fireFrame2,fireFrame3,fireFrame4];
        break;
      case 1:
        this.aniFrames = [fireFrame2,fireFrame3,fireFrame4,fireFrame1];
        break;
      case 2:
        this.aniFrames = [fireFrame3,fireFrame4,fireFrame1,fireFrame2];
        break;
      case 3:
        this.aniFrames = [fireFrame4,fireFrame1,fireFrame2,fireFrame3];
        break;
    }
    this.currentFrame = this.aniFrames[0];
    this.h = this.currentFrame.length;
    this.w = this.currentFrame[0].length;
    if (x!=0&&y!=0) {
      this.x=x;
      this.y=y;
      this.s=1;
    } else if (Math.floor(Math.random()*16)<=1) {
      this.s = 2;
      this.x = Math.floor(Math.random()*112);
      this.y = Math.floor(Math.random()*80);
    } else {
      this.s = 1;
      this.x = Math.floor(Math.random()*120);
      this.y = Math.floor(Math.random()*96);
    }
  }

  detectClick() {
    if (mouseX>this.x*gameScreen.s&&mouseX<(this.x+this.w*this.s)*gameScreen.s&&mouseY>this.y*gameScreen.s&&mouseY<(this.y+this.h*this.s)*gameScreen.s) {
      health+=shinotchi.statMod("health",health,Math.floor(8/currentFires.length)*this.s,false);
      hunger+=shinotchi.statMod("hunger",hunger,Math.floor(8/currentFires.length)*this.s,false);
      purity+=shinotchi.statMod("purity",purity,Math.floor(8/currentFires.length)*this.s,false);
      joy+=shinotchi.statMod("joy",joy,Math.floor(8/currentFires.length)*this.s,false);
      currentFires.splice(currentFires.indexOf(this),1);
    }
  }

  updateFrame() {
    if (!pause&&!ui.displayingOptionsMenu) {
      this.aniFrames.push(this.aniFrames[0]);
      this.aniFrames.shift();
      this.currentFrame = this.aniFrames[0];
    }
  }

  draw() {
    if (timeCounter%2==0) {this.updateFrame();}
    for (var row=0; row<this.h; row++) {
      for (var col=0; col<this.w; col++) {
        if (this.s==1) {
          if (this.currentFrame[row][col]==1) {
            gameScreen.cells[row+this.y][col+this.x] = 1;
          } else if (this.currentFrame[row][col]==2) {
            gameScreen.cells[row+this.y][col+this.x] = 2;
          } else if (this.currentFrame[row][col]==3) {
            gameScreen.cells[row+this.y][col+this.x] = 0;
          }
        } else if (this.s==2) {
          if (this.currentFrame[row][col]==1) {
            gameScreen.cells[row+row+this.y][col+col+this.x] = 1;
            gameScreen.cells[row+row+this.y+1][col+col+this.x] = 1;
            gameScreen.cells[row+row+this.y][col+col+this.x+1] = 1;
            gameScreen.cells[row+row+this.y+1][col+col+this.x+1] = 1;
          } else if (this.currentFrame[row][col]==2) {
            gameScreen.cells[row+row+this.y][col+col+this.x] = 2;
            gameScreen.cells[row+row+this.y+1][col+col+this.x] = 2;
            gameScreen.cells[row+row+this.y][col+col+this.x+1] = 2;
            gameScreen.cells[row+row+this.y+1][col+col+this.x+1] = 2;
          } else if (this.currentFrame[row][col]==3) {
            gameScreen.cells[row+row+this.y][col+col+this.x] = 0;
            gameScreen.cells[row+row+this.y+1][col+col+this.x] = 0;
            gameScreen.cells[row+row+this.y][col+col+this.x+1] = 0;
            gameScreen.cells[row+row+this.y+1][col+col+this.x+1] = 0;
          }
        }
      }
    }
  }
}


//--------------------------------------------------------------------------------------------------------------------------------|Function - Random Events
function randEvent() {
  console.log("Random Event Occured");
  lastRandEvent = timeCounter;
  switch (Math.floor(Math.random()*4)) {
    case 0:
      for (var i=0; i<Math.floor(Math.random()*8)+1; i++) {
        if (currentFires.length<64) {currentFires.push(new fire(0,0));}}
      break;
    case 1:
      currentFires.push(new fire(60,20));
      currentFires.push(new fire(45,10));
      currentFires.push(new fire(80,10));
      currentFires.push(new fire(25,20));
      currentFires.push(new fire(95,20));
      currentFires.push(new fire(20,35));
      currentFires.push(new fire(100,35));
      currentFires.push(new fire(30,50));
      currentFires.push(new fire(90,50));
      currentFires.push(new fire(45,65));
      currentFires.push(new fire(75,65));
      currentFires.push(new fire(60,75));
      break;
    case 2:
      if (!animation.playingAni) {animation.play("32x32Art");}
      break;
    case 3:
      if (!animation.playingAni) {animation.play("glitch");}
      break;
  }
}


//--------------------------------------------------------------------------------------------------------------------------------|Function Section
function keyPressed() {
  if (keyCode==27&&!animation.playingAni&&!ui.displayingMenu) {
    if (!pause) {pause = true;
    } else {pause = false;}
  }
}


function mouseClicked() {
  if (mouseX>0&&mouseX<width&&mouseY>0&&mouseY<height) {
    if (!animation.playingAni&&!ui.displayingMenu) {
      if (!pause) {
        exerciseBtn.detectClick();
        eatBtn.detectClick();
        cleanBtn.detectClick();
        paintBtn.detectClick();
        statInfoBtn.detectClick();
        petInfoBtn.detectClick();
        optionsBtn.detectClick();
        shinotchi.detectClick();
        if (currentFires.length>0) {
          currentFires.forEach(function(value,index) {
            currentFires[index].detectClick();
          });
        }
      }
      pauseBtn.detectClick();
    } else if (ui.displayingStatsMenu) {
      statInfoBtn.detectClick();
    } else if (ui.displayingPetMenu) {
      petInfoBtn.detectClick();
    } else if (ui.displayingOptionsMenu) {
      optionsBtn.detectClick();
    }

    if (ui.menuButtons.length>0) {
      ui.menuButtons.forEach(function(value,index) {
        ui.menuButtons[index].detectClick();
      });
    }

    if (animation.aniCounter>=animation.frameCount&&animation.drawingAni) {animation.stopAni();}
  }
}


function initiateClassInstances() {
  ui = new gameInterface();
  gameScreen = new grid();
  shinotchi = new vPet();
  animation = new animationsClass();
  exerciseBtn = new button(0,16,112,128,"exercise");
  eatBtn = new button(16,32,112,128,"eat");
  cleanBtn = new button(32,48,112,128,"clean");
  paintBtn = new button(48,64,112,128,"paint");
  statInfoBtn = new button(64,80,112,128,"statInfo");
  petInfoBtn = new button(80,96,112,128,"petInfo");
  optionsBtn = new button(96,112,112,128,"options");
  pauseBtn = new button(112,128,112,128,"pause");
}


function updateScreen() {
  for (var row=0; row<112; row++) {
    gameScreen.cells[row].forEach(function(currentValue,index){
      gameScreen.cells[row][index] = bgImg1[row][index];
    });
  }

  if (currentFires.length>0) {
    currentFires.forEach(function(value,index) {
      if (currentFires[index].y+currentFires[index].h*currentFires[index].s<=shinotchi.y+shinotchi.h) {
        currentFires[index].draw();
      }
    });
  }

  if (!animation.playingAni) {
    exerciseBtn.displayOutline();
    eatBtn.displayOutline();
    cleanBtn.displayOutline();
    paintBtn.displayOutline();
    statInfoBtn.displayOutline();
    petInfoBtn.displayOutline();
    optionsBtn.displayOutline();
    shinotchi.display(shinotchi.x,shinotchi.y);
  } else {
    animation.display();
    animation.displayObj();
  }

  if (currentFires.length>0) {
    currentFires.forEach(function(value,index) {
      if (currentFires[index].y+currentFires[index].h*currentFires[index].s>shinotchi.y+shinotchi.h) {
        currentFires[index].draw();
      }
    });
  }
}


function drawScreen() {
  background(84,86,90);
  shinotchi.updateStats();
  if (!pause&&!ui.displayingMenu) {
    updateScreen();
    timeCounter += 1;
    if (Math.random()*256<=0+(timeCounter-lastRandEvent)/32) {randEvent();}
  }
  if (!animation.playingAni&&!ui.displayingMenu) {
    ui.displayPauseIcons();
    pauseBtn.displayOutline();
  }
  ui.draw();
  gameScreen.draw();
}


function changeGameSize(opt) {
  if (opt=="down"&&screenScale>1) {
    screenScale -= 1;
    windowResized();
  } else if (opt=="up"&&screenScale<99) {
    screenScale += 1;
    windowResized();
  }
}


//--------------------------------------------------------------------------------------------------------------------------------|Setup & Window Resize
function setup() {
  initiateClassInstances();
  windowResized();
  setInterval(shinotchi.intervalUpdate,500);
  drawScreenInterval = setInterval(drawScreen,125);
}

function windowResized() {
  let canvas = createCanvas(screenScale*128, screenScale*128);
  canvas.position(windowWidth/2-width/2, windowHeight/2-height/2, 'absolute');
  canvas.style("display", "block");
  canvas.style("z-index", "-1");
  gameScreen.update();
}
