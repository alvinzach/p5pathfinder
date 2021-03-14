let points = [];
let buffer = 50;
let adj = [];
let source, dest;
let nodeCount, edgeCount, speed;
let p5Instance = null;

class Node {
  constructor(_x, _y) {
    this.x = _x;
    this.y = _y;
    this.adj = [];
    this.delta = Number.POSITIVE_INFINITY;
    this.parent = null;
  }
}

$(document).ready(function(){
  resetValues();
  
  $("#run").click(run);

  $("#reset").click(function(){
    resetValues();
    run();
  })
});

function resetValues(){
  $('#node-count').val(10);
  $('#edge-count').val(2);
  $('#speed').val("1.5");
}

function fetchValues(){
  nodeCount = parseInt($('#node-count').val())||10;
  edgeCount = parseInt($('#edge-count').val())||3;
  speed = $('#speed').val()||1;
  console.log(nodeCount,edgeCount,speed)
}

function run(){
  fetchValues();
  if(p5Instance)
    p5Instance.remove();
  let sketch = function(p){
    p.remove();
    p.setup=dijkstraSetup(p);
    p.draw=dijkstraDraw(p);
  }
  p5Instance = new p5(sketch);
}

function calculateDelta(node1, node2) {
  return Math.sqrt(
    Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2)
  );
}

function dijkstraSetup(p) {
  return function(){
  p.createCanvas($("#playground").width(), $("#playground").height()).parent(
    "playground"
  );
  p.frameRate(24*speed);
  p.background(33, 37, 41);
  points = [];
  for (var i = 0; i < nodeCount; i++) {
    console.log(i)
    points.push(
      new Node(p.random(buffer, p.width - buffer), p.random(buffer, p.height - buffer))
    );
  }
  points.sort((a, b) => a.x - b.x);
  source = points[0];
  source.delta = 0;
  dest = points[points.length - 1];
  for (var i = 0; i < points.length - 2; i++) {
    var adjArray = [];
    for (var j = 1; j <= edgeCount; j++) {
      adjArray.push(points[Math.ceil(p.random(i + 1, points.length - 1))]);
    }
    points[i].adj = adjArray;
  }

  p.stroke(255);
  p.strokeWeight(0.25);

  for (var i = 0; i < points.length - 2; i++) {
    var node = points[i];
    for (var adjnode of node.adj) {
      p.line(node.x, node.y, adjnode.x, adjnode.y);
    }
  }
}
}

function dijkstraDraw(p) {
  return function(){
  p.stroke(255);
  p.strokeWeight(10);
  for (let point of points) {
    p.point(point.x, point.y);
  }
  p.stroke(23, 162, 184);
  p.strokeWeight(20);
  p.point(source.x, source.y);

  p.stroke(25, 135, 84);
  p.strokeWeight(20);
  p.point(dest.x, dest.y);

  points.sort((a, b) => a.delta - b.delta);
  let currentNode = points.shift();

  if (currentNode == dest || points.length == 0) {
    p.stroke(255, 193, 7);
    p.strokeWeight(2.5);

    while (currentNode.parent) {
      p.line(
        currentNode.x,
        currentNode.y,
        currentNode.parent.x,
        currentNode.parent.y
      );
      currentNode = currentNode.parent;
    }
    p.noLoop();
  }

  for (var node of currentNode.adj) {
    var distance = calculateDelta(node, currentNode);
    if (distance + currentNode.delta < node.delta) {
      p.stroke(255);
      p.strokeWeight(1);
      p.line(currentNode.x, currentNode.y, node.x, node.y);
      node.parent = currentNode;
      node.delta = distance + currentNode.delta;
    }
  }
}
}
