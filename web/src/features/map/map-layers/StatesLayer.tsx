import { useTheme } from 'hooks/theme';
import { Layer, Source } from 'react-map-gl';

import { useGetGeometries } from '../map-utils/getMapGrid';

export default function StatesLayer() {
  const { statesGeometries } = useGetGeometries();
  const theme = useTheme();

  const statesBorderStyle = {
    'line-color': theme.stateBorderColor,
    'line-width': 1.4,
    'line-opacity': 0.9,
    'line-dasharray': [1, 1],
  } as mapboxgl.LinePaint;
  return (
    <Source id="states" type="geojson" data={statesGeometries}>
      <Layer
        id="states-border"
        type="line"
        paint={statesBorderStyle}
        minzoom={2.5}
        source="states"
      />
      <Layer
        id="state-labels-name"
        type="symbol"
        source="states"
        layout={{
          'text-field': ['get', 'stateName'],
          'symbol-placement': 'point',
          'text-size': 12,
          'text-letter-spacing': 0.12,
          'text-transform': 'uppercase',
          'text-font': ['poppins-semibold'],
        }}
        paint={{
          'text-color': 'white',
          'text-halo-color': '#111827',
          'text-halo-width': 0.5,
          'text-halo-blur': 0.25,
          'text-opacity': 0.9,
        }}
        minzoom={4.5}
      />
      <Layer
        id="state-labels-id"
        type="symbol"
        source="states"
        layout={{
          'text-field': ['get', 'stateId'],
          'symbol-placement': 'point',
          'text-size': 12,
          'text-letter-spacing': 0.12,
          'text-transform': 'uppercase',
          'text-font': ['poppins-semibold'],
        }}
        paint={{
          'text-color': 'white',
          'text-halo-color': '#111827',
          'text-halo-width': 0.5,
          'text-halo-blur': 0.25,
          'text-opacity': 0.9,
        }}
        maxzoom={4.5}
        minzoom={3}
      />
    </Source>
  );
}
