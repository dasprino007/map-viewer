//
// Original pan and zoom code from https://codepen.io/chengarda/pen/wRxoyB
//

// TODO rewrite it all, add more comments, add map buttons from json file


const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

let selected_map = params.map;

if (!selected_map)
{
  selected_map = "Solaris";
}

selected_map = "maps/" + selected_map + "-0.png" // TODO unshitify this

console.log(selected_map);

let canvas;
let ctx;

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

let cameraOffset = { x: window.innerWidth/2, y: window.innerHeight/2 }
let cameraZoom = 0.1
let MAX_ZOOM = 3
let MIN_ZOOM = 0.1
let SCROLL_SENSITIVITY = 0.0015

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

  var image = new Image();

  image.src = selected_map;

  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  requestAnimationFrame( draw )
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

let isDragging = false
let dragStart = { x: 0, y: 0 }

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

let initialPinchDistance = null
let lastZoom = cameraZoom

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

  // TODO make it smooth
  if (zoomAmount)
  {
    cameraZoom -= zoomAmount;
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
