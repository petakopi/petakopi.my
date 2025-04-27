export const setupMapLayers = (map) => {
  // Add the coffee shops source
  map.addSource('coffee-shops', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    },
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50
  });

  // Add clusters layer
  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'coffee-shops',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#6B4F4F',
        10, '#5D4037',
        25, '#4E342E'
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        20,
        10, 30,
        25, 40
      ]
    }
  });

  // Add cluster count layer
  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'coffee-shops',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    },
    paint: {
      'text-color': '#ffffff'
    }
  });

  // Add unclustered points layer
  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'coffee-shops',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#6B4F4F',
      'circle-radius': 6,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  });
};
