### Tunguso4ka's SS14 Map Viewer
(actually Image Viewer, but who cares?)

## How to launch locally?
`python -m http.server`
or
`npx http-server`

## maps.json
```
{
  "maps": {
    "map id":
    {
      "name": "map name",
      "url": "map url (internal or external)",
      "labels":
      [
        {"name": "name", "size": 12, "x": 0, "y": 0}
      ]
    }
  }
  "main": "id of main map"
}
```
