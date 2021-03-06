export function compareVertices(v0, v1) {
  return v0.x === v1.x ? v0.y - v1.y : v0.x - v1.x
}

export function minVertex(v0,v1) {
  return compareVertices(v0,v1) > 0 ? v1: v0;
}

export function maxVertex(v0,v1) {
  return compareVertices(v0,v1) > 0 ? v0: v1;
}

export function distanceFromTwoPoints(x0, y0, x1, y1) {
  return Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2));
}

export function horizontalLine(y) {
  return {a: 0, b: 1, c: -y}
}

export function verticalLine(x) {
  return {a: 1, b: 0, c: -x}
}

export function linePassingThroughTwoPoints(x1, y1, x2, y2) {
  // (x2 - x1)(y - y1) = (y2 - y1)(x - x1)
  // (y1 - y2)x + (x2 - x1)y + (y2x1 - x2y1) = 0

  if (x1 === x2 && y1 == y2) throw new Error("Geometry error");
  if (x1 === x2) return verticalLine(x);
  if (y1 === y2) return horizontalLine(y1);

  return {
    a: y1 - y2,
    b: x2 - x1,
    c: y2 * x1 - x2 * y1
  };
}

export function distancePointFromLine(a, b, c, x, y) {
  //https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
  return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
}

export function closestPointFromLine(a, b, c, x, y) {
  //https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
  let denom = a * a + b * b;
  return {
    x: (b * (b * x - a * y) - a * c) / denom,
    y: ((a * -b * x + a * y ) - b * c) / denom,
  }
}

export function intersectionFromTwoLines(a, b, c, j, k, l) {
  let det = (b * j - a * k);

  if (det === 0) return undefined; //no intersection

  let y = (a * l - c * j) / det;
  let x = (c * k - b * l) / det;
  return {x, y};
}

export function intersectionFromTwoLineSegment(p1, p2, p3, p4) {
  //https://github.com/psalaets/line-intersect/blob/master/lib/check-intersection.js

  let {x: x1, y: y1} = p1;
  let {x: x2, y: y2} = p2;
  let {x: x3, y: y3} = p3;
  let {x: x4, y:y4} = p4;

  let EPSILON = 10e-6;

  let denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
  let numA = ((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3));
  let numB = ((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3));

  if (Math.abs(denom) <= EPSILON) {
    if (Math.abs(numA) <= EPSILON && Math.abs(numB) <= EPSILON) {

      let comparator = (pa, pb) => pa.x === pb.x ? pa.y - pb.y : pa.x - pb.x;
      let line0 = [p1, p2].sort(comparator);
      let line1 = [p3.toJS(), p4.toJS()].sort(comparator);

      let [lineSX, lineDX] = [line0, line1].sort((lineA, lineB) => comparator(lineA[0], lineB[0]));

      if (lineSX[1].x === lineDX[0].x) {
        return {type: (lineDX[0].y <= lineSX[1].y) ? "colinear" : "none"};
      } else {
        return {type: (lineDX[0].x <= lineSX[1].x) ? "colinear" : "none"};
      }
    }
    return {type: "parallel"};
  }

  var uA = numA / denom;
  var uB = numB / denom;

  if (uA >= (0 - EPSILON) && uA <= (1 + EPSILON) && uB >= (0 - EPSILON) && uB <= (1 + EPSILON)) {
    let point = {
      x: x1 + (uA * (x2 - x1)),
      y: y1 + (uA * (y2 - y1))
    };
    return {type: "intersecting", point};
  }

  return {type: "none"};
}

export function distancePointFromLineSegment(x1, y1, x2, y2, xp, yp) {
  //http://stackoverflow.com/a/6853926/1398836

  let A = xp - x1;
  let B = yp - y1;
  let C = x2 - x1;
  let D = y2 - y1;

  let dot = A * C + B * D;
  let len_sq = C * C + D * D;
  let param = -1;
  if (len_sq != 0) //in case of 0 length line
    param = dot / len_sq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  let dx = xp - xx;
  let dy = yp - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

export function closestPointFromLineSegment(x1, y1, x2, y2, xp, yp) {
  if (x1 === x2) return {x: x1, y: yp};
  if (y1 === y2) return {x: xp, y: y1};

  let m = (y2 - y1) / (x2 - x1);
  let q = y1 - m * x1;

  let mi = -1 / m;
  let qi = yp - mi * xp;

  let x = (qi - q) / (m - mi);
  let y = (m * x + q);

  return {x, y};
}

export function pointPositionOnLineSegment(x1, y1, x2, y2, xp, yp) {
  let length = distanceFromTwoPoints(x1, y1, x2, y2);
  let distance = distanceFromTwoPoints(x1, y1, xp, yp);

  let offset = distance / length;
  if (x1 > x2) offset = mapRange(offset, 0, 1, 1, 0);

  return offset;
}

export function mapRange(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

export function angleBetweenTwoPointsAndOrigin(x1, y1, x2, y2) {
  let length = distanceFromTwoPoints(x1, y1, x2, y2);
  return (-Math.asin((y1 - y2) / length)) * 180 / Math.PI;
}

export function samePoints({x:x1, y:y1}, {x:x2, y:y2}) {
  let EPSILON = 10e-6;
  return Math.abs(x1 - x2) <= EPSILON && Math.abs(y1 - y2) <= EPSILON;
}
