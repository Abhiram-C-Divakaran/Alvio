# Geographic globe artwork

Source: Natural Earth, 1:110m land, version 5.1.2 (public domain).
https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/
https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_land.geojson

SVGs are preprojected using d3-geo 3.1.1 geoOrthographic, spherical horizon clipping,
and a 30-degree graticule. No mapping library or external map requests are needed
at runtime. Viewport: 500 × 380; globe center: (250, 185); radius: 158.

View centers / representative geographic markers (longitude, latitude):
- Overview: (20, 18)
- India: (78.96, 20.59)
- United States: (-98.58, 39.83)
- Canada: (-106.35, 56.13)
- Germany: (10.45, 51.17)
- Nigeria: (8.68, 9.08)
- Singapore: (103.82, 1.35)
- United Kingdom: (-3.44, 55.38)
- Australia: (133.78, -25.27)

Markers represent approximate country locations, not users or exact centroids.
Only markers on the visible hemisphere are drawn. Coastlines are generalized
for this small scale; political boundaries are deliberately not shown.
