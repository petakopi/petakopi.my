export const setupMapEvents = (map, setCurrentZoom, setHasClusters) => {
  // Handle zoom changes
  map.on('zoomend', () => {
    setCurrentZoom(map.getZoom());
  });

  // Handle cluster clicks
  map.on('click', 'clusters', (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['clusters']
    });
    const clusterId = features[0].properties.cluster_id;
    map.getSource('coffee-shops').getClusterExpansionZoom(
      clusterId,
      (err, zoom) => {
        if (err) return;
        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom
        });
      }
    );
  });

  // Check for clusters
  const checkForClusters = () => {
    const clusters = map.queryRenderedFeatures({ layers: ['clusters'] });
    setHasClusters(clusters.length > 0);
  };

  map.on('idle', checkForClusters);
  checkForClusters();

  return () => {
    map.off('idle', checkForClusters);
  };
};
