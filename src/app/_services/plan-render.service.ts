import { Injectable } from "@angular/core";
import { Table } from "../admin/floor-plan/floor-plan.service";
import * as _ from "underscore";

export class FitToView {
  isFit: boolean = false;
  zoomValue: number = 1;
  height: any = "100%";
  width: any = "100%";
  transFormX: number = 0;
  transFormY: number = 0;
}

const MERGE_COLORS = [
  "#E57373",
  "#E53935",
  "#F06292",
  "#D81B60",
  "#880E4F",
  "#BA68C8",
  "#8E24AA",
  "#6A1B9A",
  "#D500F9",
  "#7E57C2",
  "#4527A0",
  "#3F51B5",
  "#64B5F6",
  "#1E88E5",
  "#26C6DA",
  "#0097A7",
  "#26A69A",
  "#66BB6A",
  "#2E7D32",
  "#8BC34A",
  "#CDDC39",
  "#00C853",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#795548",
  "#FF5722"
];

@Injectable()
export class PlanRenderService {
  ngID: number = 0;
  renderedTables: any[] = [];
  renderedTable: Table;
  dropObject: boolean = false;
  layoutID: number = 0;
  newTable: Table;
  selectedId: number;
  trackFloorObjects: number = 0;
  trackid: number;
  newXSpace: number = 30;
  newYSpace: number = 30;
  tableColor: string = "#e6e6e6";
  chairColor: string = "#aeaeae";

  // SECTION COLORS
  getMergeColors() {
    return MERGE_COLORS;
  }

  getRandomColor() {
    let color = this.getMergeColors()[
      Math.floor(Math.random() * this.getMergeColors().length)
    ];
    return color;
  }

  // create a new table
  createNewTable(t, n, tblName) {
    var self = this;
    self.ngID = self.ngID + 1;
    t.ngID = self.ngID;
    t.name = tblName;
    t.offsetX = Math.round(n.coords.x);
    t.offsetY = Math.round(n.coords.y);
    t.shape = n.shape;
    t.totalCovers = n.table;
    t.type = "new";
    t.tableColor = self.tableColor;
    t.chairColor = self.chairColor;
    t.error = false;
    t.barSeat = n.barSeat;

    if (t.shape == 3) {
      t = self.createRoundedTable(t);
    } else {
      t = self.createRectTable(t);
    }

    t = self.createResizeHandle(t);

    return t;
  }

  // create a new table
  createNewImmovableShape(s, n) {
    var self = this;
    self.ngID = self.ngID + 1;
    s.ngID = self.ngID;
    s.width = 50;
    s.height = 50;
    s.offsetX = n.shape === 3 ? n.coords.x : n.coords.x - s.width / 2;
    s.offsetY = n.shape === 3 ? n.coords.y : n.coords.y - s.height / 2;
    s.shape = n.shape;
    s.radius = n.shape === 3 ? 25 : 0;
    s.name = "";
    s = self.createResizeHandle(s);
    return s;
  }

  createResizeHandle(s) {
    s.handle = {
      offsetX: s.shape === 3 ? s.offsetX - s.radius : s.offsetX,
      offsetY: s.shape === 3 ? s.offsetY - s.radius : s.offsetY
    };
    return s;
  }

  // update table
  updateTable(t) {
    var self = this;
    if (t.shape == 3) {
      t = self.createRoundedTable(t);
    } else {
      t = self.createRectTable(t);
    }
    return t;
  }

  // duplicate table
  duplicateItem(item, tblName, svgW, svgH) {
    let self = this;
    let autoXSpace = item.offsetX > svgW / 2 ? -30 : 30,
      autoYSpace = item.offsetY > svgH / 2 ? -30 : 30;
    self.newXSpace = self.trackid !== item.ngID ? autoXSpace : self.newXSpace;
    self.newYSpace = self.trackid !== item.ngID ? autoYSpace : self.newYSpace;

    self.trackid = item.ngID;
    self.ngID = self.ngID + 1;

    item.id = null;
    item.tableID = 0;
    item.ngID = self.ngID;
    item.name = item.chairs ? tblName : "";
    item.offsetX = item.offsetX + self.newXSpace;
    item.offsetY = item.offsetY + self.newYSpace;
    self.newXSpace = self.newXSpace + autoXSpace;
    self.newYSpace = self.newYSpace + autoYSpace;
    if (!item.chairs) {
      item = self.createResizeHandle(item);
    }
    return item;
  }

  //service to render tables
  createTables(data, LayoutID, sections, shiftID) {
    let self = this;
    _.each(data.tables, function(t) {
      t.tableColor = self.tableColor;
      t.chairColor = self.chairColor;
      t.error = false;

      if (sections) {
        let isExist = _.find(sections, function(section) {
          return _.find(section.shiftSectionTables, { tableID: t.id });
        });
        //t.tableColor = isExist ? isExist.section.colorCode : self.tableColor;
        t.chairColor =
          isExist && isExist.server && shiftID
            ? isExist.server.colorCode
            : isExist
              ? isExist.section.colorCode
              : self.chairColor;
      }

      self.ngID = self.ngID + 1;
      t.ngID = self.ngID;
      t.id = !LayoutID ? null : t.id;
      t.tableID = t.id;
      t.LayoutID = LayoutID;
      if (t.shape == 3) {
        t = self.createRoundedTable(t);
      } else {
        t = self.createRectTable(t);
      }
      if (t.seatedTime != null) t = self.updateTimeProgress(t, t.seatedTime);
    });
    data.tables = data.tables && this.groupMergedTables(data.tables);
    return data;
  }

  groupMergedTables(tables: any) {
    let self = this;
    let mergedTables = tables.filter(function(t) {
      return t.mergeDetails != null;
    });
    let groups = _.groupBy(mergedTables, function(table) {
      return table.mergeDetails.mergeID;
    });

    _.each(groups, function(group) {
      let primaryTable = _.find(group, function(table) {
        return table.tableID == table.mergeDetails.primaryTableID;
      });
      let serverAvailable = _.find(group, function(table) {
        return table.server != null;
      });

      let color = self.getRandomColor();
      if (primaryTable) {
        _.each(group, function(table) {
          table.mergeColor = color;
          table.expectedEndTime = primaryTable.expectedEndTime;
          let s = primaryTable.server
            ? primaryTable
            : serverAvailable
              ? serverAvailable
              : primaryTable;
          table.server = s.server;
          table.serverColor = s.serverColor;
          table.serverInitials = s.serverInitials;
        });
      }
    });

    return tables;
  }

  //service to render tables
  createImmovables(immovables, LayoutID) {
    var self = this;
    _.each(immovables, function(i) {
      self.ngID = self.ngID + 1;
      i.ngID = self.ngID;
      i.id = !LayoutID ? null : i.id;
      i.LayoutID = LayoutID;
      i.radius = i.shape === 3 ? i.width / 2 : 0;
      i = self.createResizeHandle(i);
    });
    return immovables;
  }

  //create rounded table
  createRoundedTable(t) {
    let x = 0;
    let y = 0;
    let chairHeight = 5;
    let chairWidth = t.barSeat ? 16 : 25;
    let roundTableRadius =
      t.totalCovers > 4 ? t.totalCovers * 8 : t.barSeat ? 20 : 32;
    let chairCorner = 4;

    let angle = 0;
    let Cirx = x + roundTableRadius - 1;
    let Ciry = y;

    addChairs();
    addTable();
    addName();
    updateSize();
    createHandle();

    function createHandle() {
      t.handle = {
        offsetX: t.shape === 3 ? t.offsetX - t.radius : t.offsetX,
        offsetY: t.shape === 3 ? t.offsetY - t.radius : t.offsetY
      };
    }

    function addChairs() {
      t.totalCovers = t.totalCovers < 1 ? 1 : t.totalCovers;
      t.chairs = [];
      for (let i = 1; i <= t.totalCovers; i++) {
        t.chairs.push({
          x: Cirx,
          y: Ciry - chairWidth / 2,
          rx: chairCorner,
          ry: chairCorner,
          width: chairHeight,
          height: chairWidth,
          angle: angle
        });
        angle = angle + 360 / t.totalCovers;
      }
      t.leftCovers = t.totalCovers;
      t.topCovers = 0;
      t.bottomCovers = 0;
      t.rightCovers = 0;
    }

    function addTable() {
      t.circle = {
        cx: x,
        cy: y,
        r: roundTableRadius
      };
    }

    // add name text
    function addName() {
      t.text = {
        x: 0,
        y: chairHeight
      };
    }

    function updateSize() {
      t.width = roundTableRadius * 2;
      t.height = t.width;
    }

    return t;
  }

  //create rect table
  createRectTable(t) {
    let x = 0;
    let y = 0;
    let chairHeight = 5;
    let chairWidth = 25;
    let chairDiff = 10;
    let chairCorner = 4;
    let tableCorner = 4;
    let sideDiff = 15;

    let eachSide: number;
    let sideChairs: number;
    let posX = x;
    let posY = y;

    calculateChairs();
    addTable();
    addChairs();
    addName();
    updateXYForNew();
    updateSize();
    createHandle();

    function createHandle() {
      t.handle = {
        offsetX: t.shape === 3 ? t.offsetX - t.radius : t.offsetX,
        offsetY: t.shape === 3 ? t.offsetY - t.radius : t.offsetY
      };
    }

    // calcilate chairs
    function calculateChairs() {
      if (t.shape == 1) {
        if (t.totalCovers >= 4) {
          let r = t.totalCovers % 4;
          if (r == 0) {
            eachSide = t.totalCovers / 4;
          } else {
            eachSide = (t.totalCovers - r) / 4;
            eachSide = eachSide + 1;
          }
        } else {
          eachSide = 1;
        }
        t.leftCovers = 0;
        t.rightCovers = 0;
      } else {
        eachSide =
          t.totalCovers == 4
            ? t.totalCovers / 2
            : t.totalCovers == 2 || t.totalCovers == 1
              ? 1
              : t.totalCovers % 2 == 0
                ? (t.totalCovers - 2) / 2
                : (t.totalCovers - 1) / 2;

        sideChairs =
          t.totalCovers == 1 || t.totalCovers == 4 || t.totalCovers == 2
            ? 0
            : 1;

        t.leftCovers = sideChairs;
        t.rightCovers = t.totalCovers % 2 == 0 ? sideChairs : 0;
      }
      t.topCovers = eachSide;
      t.bottomCovers =
        t.totalCovers == 1 || (t.totalCovers == 5 && t.shape == 1)
          ? 0
          : eachSide;
    }

    // add a table
    function addTable() {
      t.rect = {
        x: posX + chairDiff,
        y: posX + chairDiff,
        rx: tableCorner,
        ry: tableCorner,
        width:
          2 * sideDiff + (eachSide - 1) * chairDiff + eachSide * chairWidth,
        height:
          t.shape == 1
            ? 2 * sideDiff + (eachSide - 1) * chairDiff + eachSide * chairWidth
            : 2 * sideDiff + 1 * chairWidth
      };
    }

    // add chairs to table
    function addChairs() {
      t.chairs = [];
      //render top chairs
      posX = posX + sideDiff;
      renderYChairs("top");

      //render right chairs
      posX = posX + sideDiff;
      posY = posY + sideDiff;
      let sides = t.shape == 1 ? eachSide : sideChairs;
      if (
        (t.totalCovers > 3 && (t.totalCovers % 2 == 0 && t.shape == 2)) ||
        (t.shape == 1 && t.totalCovers > 3)
      ) {
        renderXChairs("right");
        t.rightCovers = sides;
      }

      //render left chairs
      posX = x;
      posY = y + sideDiff;
      renderXChairs("left");

      //render bottom chairs
      posX = x + sideDiff;
      posY =
        t.shape == 1
          ? posY + sideDiff
          : y + 2 * sideDiff + 1 * chairDiff + 1 * chairWidth;
      t.totalCovers > 1 && renderYChairs("bottom");

      function renderYChairs(side) {
        for (let i = 1; i <= eachSide; i++) {
          t.chairs.push({
            x: posX + chairDiff,
            y: side == "top" ? posY + chairHeight : posY,
            rx: chairCorner,
            ry: chairCorner,
            width: chairWidth,
            height: chairHeight
          });
          posX = posX + chairDiff + chairWidth;
        }
      }

      function renderXChairs(side) {
        for (let i = 1; i <= sides; i++) {
          if (t.totalCovers > 2) {
            t.chairs.push({
              x: side == "left" ? posX + chairHeight : posX,
              y: posY + chairDiff,
              rx: chairCorner,
              ry: chairCorner,
              width: chairHeight,
              height: chairWidth
            });
            t.leftCovers =
              t.shape == 2
                ? sides
                : t.totalCovers % 4 == 0
                  ? sides
                  : t.totalCovers == 3
                    ? 1
                    : t.totalCovers % sides;
          }
          posY = posY + chairDiff + chairWidth;
        }
      }
    }

    // add name text
    function addName() {
      t.text = {
        x: t.rect.width / 2 + chairHeight * 2,
        y: t.rect.height / 2 + chairHeight * 3
      };
    }

    function updateXYForNew() {
      if (t.type === "new") {
        let x = Math.round(t.offsetX - (t.rect.width / 2 + chairHeight * 2));
        let y = Math.round(t.offsetY - (t.rect.height / 2 + chairHeight * 2));
        t.offsetX = x > 0 ? x : 0;
        t.offsetY = y > 0 ? y : 0;
      }
    }

    function updateSize() {
      t.width = t.rect.width;
      t.height = t.rect.height;
    }
    delete t.type;
    return t;
  }


  updateTimeProgress(t, time) {
    let defaultTurnOverTime = 30;
    let seatedTime = new Date(time),
      currentTime = new Date(),
      expectedEndTime = new Date(t.expectedEndTime),
      diff = (currentTime.getTime() - seatedTime.getTime()) / 60000,
      temp = expectedEndTime.getTime() - seatedTime.getTime(),
      turnover =
        t.expectedEndTime && temp > 0
          ? (expectedEndTime.getTime() - seatedTime.getTime()) / 60000
          : defaultTurnOverTime;
    t.spentTime = this.getStringHoursAndMins(diff);
    t.spentTimeinMins = Math.floor(diff);
    t.turnOverTime = this.getStringHoursAndMins(turnover);
    t.percent = (diff / turnover) * 100;
    return t;
  }

  getStringHoursAndMins(time) {
    let hours =
        Math.floor(time / 60) > 9
          ? Math.floor(time / 60)
          : "0" + Math.floor(time / 60),
      minutes =
        Math.floor(time % 60) > 9
          ? Math.floor(time % 60)
          : "0" + Math.floor(time % 60);

    return hours + ":" + minutes;
  }

  // fit layout to view
  fitPlanToView(planC, svgC, tables, shapes) {
    let view: FitToView = new FitToView();
    let offset = 10,
      pw = Math.round(planC.nativeElement.getBBox().width) + offset,
      ph = Math.round(planC.nativeElement.getBBox().height) + offset,
      svgW: number = svgC.nativeElement.parentNode.clientWidth,
      svgH = svgC.nativeElement.parentNode.clientHeight;

    let minX = Math.min.apply(
      Math,
      tables.map(function(t) {
        let size = t.shape == 3 ? t.width / 2 : 0;
        return t.offsetX - size;
      })
    );

    let minY = Math.min.apply(
      Math,
      tables.map(function(t) {
        let size = t.shape == 3 ? t.width / 2 : 0;
        return t.offsetY - size;
      })
    );

    let zoomXValue = pw + minX > svgW ? svgW / (pw + minX) : 1;
    zoomXValue = Number(zoomXValue.toFixed(2));

    let zoomYValue = ph + minY > svgH ? svgH / (ph + minY) : 1;
    zoomYValue = Number(zoomYValue.toFixed(2));

    view.zoomValue = zoomXValue > zoomYValue ? zoomYValue : zoomXValue;
    view.height = Math.round(ph * view.zoomValue) + minY;
    view.width = Math.round(pw * view.zoomValue) + minX;

    let calcXSpace = (svgW - view.width) / 2;
    let transFormX = calcXSpace - minX;
    let calcYSpace = (svgH - view.height) / 2;
    let transFormY = calcYSpace - minY;
    //transFormX

    view.transFormX = transFormX;
    view.transFormY = transFormY;
    view.isFit = true;

    return view;
  }

  //trim tables
  trimTableProperties(tables) {
    _.each(tables, function(t) {
      delete t.chairs;
      delete t.expectedEndTime;
      delete t.isSuggestedOnWaitList;
      delete t.mealCourse;
      delete t.mergeDetails;
      delete t.seatedTime;
      delete t.server;
      delete t.tableStatus;
      delete t.rect;
      delete t.circle;
      delete t.text;
      delete t.type;
      delete t.chairColor;
      delete t.tableColor;
      delete t.handle;
      delete t.waitListDataHistoryID;
      delete t.reservationHistoryID;
      delete t.isEvent;
    });
    return tables;
  }

  //trim tables
  trimImmovableProperties(immovables) {
    _.each(immovables, function(i) {
      delete i.handle;
      delete i.radius;
      delete i.ngID;
      delete i.tableID;
    });
    return immovables;
  }
}
