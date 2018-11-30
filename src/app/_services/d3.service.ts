import { Injectable } from "@angular/core";
import * as d3 from "d3";

@Injectable()
export class D3TableService {
  // A method to bind a draggable behaviour to an svg element
  applyDraggableBehaviour(
    element,
    node,
    handle,
    handleEle,
    boundryEle,
    zoomValue
  ) {
    const d3Element = d3.select(element);
    const d3HandleElement = d3.select(handleEle);

    function started() {
      /** Preventing propagation of dragstart to parent elements */
      d3.event.sourceEvent.stopPropagation();
      d3.event.on("drag", dragged).on("end", ended);

      function dragged() {
        let x = Math.round(d3.event.x),
          y = Math.round(d3.event.y),
          w = node.width + 10;
        let gBox = element.parentNode.getBBox();
        let diffX = node.offsetX - Math.round(gBox.x - 5);
        let diffY = node.offsetY - Math.round(gBox.y - 5);

        function restrictBoundryForCircle() {
          node.offsetX =
            x < w / 2
              ? w / 2
              : x + w / 2 > boundryEle.x / zoomValue
                ? boundryEle.x / zoomValue - w / 2
                : d3.event.x;
          node.offsetY =
            y < w / 2
              ? w / 2
              : y + w / 2 > boundryEle.y / zoomValue
                ? boundryEle.y / zoomValue - w / 2
                : d3.event.y;
        }

        function restrictBoundryForSquare() {
          node.offsetX =
            x < diffX
              ? diffX
              : x + (gBox.width - diffX) > boundryEle.x / zoomValue
                ? boundryEle.x / zoomValue - (gBox.width - diffX)
                : d3.event.x;
          node.offsetY =
            y < diffY
              ? diffY
              : y + (gBox.height - diffY) > boundryEle.y / zoomValue
                ? boundryEle.y / zoomValue - (gBox.height - diffY)
                : d3.event.y;
        }

        if (node.shape == 3) {
          restrictBoundryForCircle();
        } else {
          restrictBoundryForSquare();
        }

        node.offsetX = Math.round(node.offsetX);
        node.offsetY = Math.round(node.offsetY);

        if (handle) {
          handle.offsetX =
            node.shape === 3 ? node.offsetX - node.radius : node.offsetX;
          handle.offsetY =
            node.shape === 3 ? node.offsetY - node.radius : node.offsetY;
        }
      }

      function ended() {
        d3Element.datum({ x: node.offsetX, y: node.offsetY });
        if (handle)
          d3HandleElement.datum({ x: handle.offsetX, y: handle.offsetY });
      }
    }

    d3Element
      .call(d3.drag().on("start", started))
      .datum({ x: node.offsetX, y: node.offsetY });
  }

  // A method to bind a draggable behaviour to a svg element
  applyResizableBehaviour(element, node, resizableNode) {
    const d3Element = d3.select(element);
    let minWidth = 5;
    let minHeight = 5;

    function started() {
      let posX = node.offsetX;
      let posY = node.offsetY;
      let rW = resizableNode.width;
      let rH = resizableNode.height;
      /** Preventing propagation of dragstart to parent elements */
      d3.event.sourceEvent.stopPropagation();

      d3.event.on("drag", dragged).on("end", ended);

      function dragged() {
        let newWidth = rW + (d3.event.x - posX);
        let newHeight = rH + (d3.event.y - posY);
        if (resizableNode.shape === 3) {
          resizableNode.radius =
            newWidth > minWidth ? newWidth / 2 : minWidth / 2;
        } else {
          resizableNode.radius = 0;
        }

        if (resizableNode.shape === 3) {
          resizableNode.width = resizableNode.radius * 2;
          resizableNode.height = resizableNode.radius * 2;
        } else {
          resizableNode.width = newWidth > minWidth ? newWidth : minWidth;
          resizableNode.height = newHeight > minHeight ? newHeight : minHeight;
        }

        let newX = resizableNode.offsetX;
        let newY = resizableNode.offsetY;
        node.offsetX =
          resizableNode.shape === 3 ? newX - resizableNode.radius : newX;
        node.offsetY =
          resizableNode.shape === 3 ? newY - resizableNode.radius : newY;
      }

      function ended() {
        d3Element.datum({ x: node.offsetX, y: node.offsetY });
        //Update model
      }
    }

    d3Element
      .call(d3.drag().on("start", started))
      .datum({ x: node.offsetX, y: node.offsetY });
  }

  // A method to bind zoomable behaviour to svg container
  /** A method to bind a pan and zoom behaviour to an svg element */
  applyZoomableBehaviour(svgElement, containerElement) {
    let svg, container, zoomed, zoom;

    svg = d3.select(svgElement);
    container = d3.select(containerElement);

    zoomed = () => {
      const transform = d3.event.transform;
      container.attr(
        "transform",
        "translate(" +
          transform.x +
          "," +
          transform.y +
          ") scale(" +
          transform.k +
          ")"
      );
    };

    zoom = d3.zoom().on("zoom", zoomed);
    svg.call(zoom);
  }
}
