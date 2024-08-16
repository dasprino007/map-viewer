//
// Original pan and zoom code from https://codepen.io/chengarda/pen/wRxoyB
//

// TODO rewrite it all, add more comments, add map buttons from json file

// get Query parametres
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

let is_legend_hidden = false;

load_json("maps/maps.json");
let labels = {};

let image = new Image();
let canvas;
let ctx;

let cameraOffset = { x: window.innerWidth/2, y: window.innerHeight/2 };
let cameraZoom = 0.15;
let MAX_ZOOM = 2.5;
let MIN_ZOOM = 0.1;
let SCROLL_SENSITIVITY = 0.025;
let initialPinchDistance = null;
let lastZoom = cameraZoom;

let isDragging = false;
let dragStart = { x: 0, y: 0 };

window.onload = () =>
{
  canvas = document.getElementById("canvas")
  ctx = canvas.getContext('2d')

  canvas.addEventListener('mousedown', onPointerDown)
  canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
  canvas.addEventListener('mouseup', onPointerUp)
  canvas.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp))
  canvas.addEventListener('mousemove', onPointerMove)
  canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
  canvas.addEventListener( 'wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))

  draw()
}

async function load_json(url)
{
  var response = await fetch(url);
  let maps = await response.json();

  let map_name = maps.main;

  if (params.map in maps.maps)
  {
    // use value from Query
    map_name = params.map;
  }

  let map_url = maps.maps[map_name].url;
  labels = maps.maps[map_name].labels;

  for (const [key, value] of Object.entries(maps.maps))
  {
    var new_button = document.createElement("button");

    new_button.innerText = value.name;
    new_button.onclick = function () {
        location.href = `?map=${key}`;
    };

    mapsbar.appendChild(new_button);
  }

  image.src = map_url;

  console.log(`Loaded map ${map_url} with ${Object.keys(labels).length} labels.`);
}

function draw()
{
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
    
  // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
  ctx.translate( window.innerWidth / 2, window.innerHeight / 2 )
  ctx.scale(cameraZoom, cameraZoom)
  ctx.translate( -window.innerWidth / 2 + cameraOffset.x, -window.innerHeight / 2 + cameraOffset.y )
  ctx.clearRect(0,0, window.innerWidth, window.innerHeight)

  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  if ( ! is_legend_hidden )
  {
    for (const iter in labels)
    {
      value = labels[iter];
      drawText(value.name, value.x, value.y, value.size);
    }
  }

  requestAnimationFrame( draw )
}

function drawText(text, x, y, font_size=12, stroke_size=3, font="Arial")
{
  ctx.fillStyle = "white";
  ctx.strokeStyle = "#011627";
  ctx.lineWidth = stroke_size;

  ctx.shadowBlur = 5;
  ctx.shadowColor = "black";

  ctx.font = `${font_size}em ${font}`;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

// Gets the relevant location from a mouse or single touch event
function getEventLocation(e)
{
    if (e.touches && e.touches.length == 1)
    {
        return { x:e.touches[0].clientX, y: e.touches[0].clientY }
    }
    else if (e.clientX && e.clientY)
    {
        return { x: e.clientX, y: e.clientY }        
    }
}

function onPointerDown(e)
{
    isDragging = true
    dragStart.x = getEventLocation(e).x/cameraZoom - cameraOffset.x
    dragStart.y = getEventLocation(e).y/cameraZoom - cameraOffset.y
}

function onPointerUp(e)
{
    isDragging = false
    initialPinchDistance = null
    lastZoom = cameraZoom
}

function onPointerMove(e)
{
  if (!isDragging)
  {
    return;
  }

  cameraOffset.x = getEventLocation(e).x/cameraZoom - dragStart.x;
  cameraOffset.y = getEventLocation(e).y/cameraZoom - dragStart.y;
}

function handleTouch(e, singleTouchHandler)
{
    if ( e.touches.length == 1 )
    {
        singleTouchHandler(e)
    }
    else if (e.type == "touchmove" && e.touches.length == 2)
    {
        isDragging = false
        handlePinch(e)
    }
}

function handlePinch(e)
{
    e.preventDefault()
    
    let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }
    
    // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    let currentDistance = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2
    
    if (initialPinchDistance == null)
    {
        initialPinchDistance = currentDistance
    }
    else
    {
        adjustZoom( null, currentDistance/initialPinchDistance )
    }
}

function adjustZoom(zoomAmount, zoomFactor)
{
  if (isDragging)
  {
    return
  }

  if (zoomAmount)
  {
    cameraZoom -= (cameraZoom * 0.1) * zoomAmount;
  }
  else if (zoomFactor)
  {
    console.log(zoomFactor)
    cameraZoom = zoomFactor*lastZoom
  }

  cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
  cameraZoom = Math.max( cameraZoom, MIN_ZOOM )
}

function toggleMapsHidden()
{
  button = document.getElementById("mapsbar");
  button.hidden = ! button.hidden;
}

function toggleLegendHidden()
{
  is_legend_hidden = ! is_legend_hidden;
}
