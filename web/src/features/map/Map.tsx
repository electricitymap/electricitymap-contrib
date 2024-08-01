import useGetState from 'api/getState';
import ExchangeLayer from 'features/exchanges/ExchangeLayer';
import { leftPanelOpenAtom } from 'features/panels/panelAtoms';
import SolarLayer from 'features/weather-layers/solar/SolarLayer';
import WindLayer from 'features/weather-layers/wind-layer/WindLayer';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { StyleSpecification } from 'maplibre-gl';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { ErrorEvent, Map, MapRef } from 'react-map-gl/maplibre';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { Mode } from 'utils/constants';
import { createToWithState, getCO2IntensityByMode, useUserLocation } from 'utils/helpers';
import {
  productionConsumptionAtom,
  selectedDatetimeStringAtom,
  spatialAggregateAtom,
  userLocationAtom,
} from 'utils/state/atoms';

import { useCo2ColorScale, useTheme } from '../../hooks/theme';
import BackgroundLayer from './map-layers/BackgroundLayer';
import StatesLayer from './map-layers/StatesLayer';
import ZonesLayer from './map-layers/ZonesLayer';
import CustomLayer from './map-utils/CustomLayer';
import { useGetGeometries } from './map-utils/getMapGrid';
import { getZoneIdFromLocation } from './map-utils/getZoneIdFromLocation';
import {
  hoveredZoneAtom,
  loadingMapAtom,
  mapMovingAtom,
  mousePositionAtom,
} from './mapAtoms';
import { FeatureId } from './mapTypes';

export const ZONE_SOURCE = 'zones-clickable';
const SOUTHERN_LATITUDE_BOUND = -78;
const NORTHERN_LATITUDE_BOUND = 85;
const MAP_STYLE = {
  version: 8,
  sources: {},
  layers: [],
  glyphs: 'fonts/{fontstack}/{range}.pbf',
};
const isMobile = window.innerWidth < 768;

type MapPageProps = {
  onMapLoad?: (map: maplibregl.Map) => void;
};

// TODO: Selected feature-id should be stored in a global state instead (and as zoneId).
// We could even consider not changing it hear, but always reading it from the path parameter?
export default function MapPage({ onMapLoad }: MapPageProps): ReactElement {
  const setIsMoving = useSetAtom(mapMovingAtom);
  const setMousePosition = useSetAtom(mousePositionAtom);
  const [isLoadingMap, setIsLoadingMap] = useAtom(loadingMapAtom);
  const [hoveredZone, setHoveredZone] = useAtom(hoveredZoneAtom);
  const selectedDatetimeString = useAtomValue(selectedDatetimeStringAtom);
  const setLeftPanelOpen = useSetAtom(leftPanelOpenAtom);
  const setUserLocation = useSetAtom(userLocationAtom);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isSourceLoaded, setSourceLoaded] = useState(false);
  const location = useLocation();
  const getCo2colorScale = useCo2ColorScale();
  const navigate = useNavigate();
  const theme = useTheme();
  const currentMode = useAtomValue(productionConsumptionAtom);
  const mixMode = currentMode === Mode.CONSUMPTION ? 'consumption' : 'production';
  const [selectedZoneId, setSelectedZoneId] = useState<FeatureId>();
  const spatialAggregate = useAtomValue(spatialAggregateAtom);
  // Calculate layer styles only when the theme changes
  // To keep the stable and prevent excessive rerendering.
  const { isLoading, isSuccess, isError, data } = useGetState();
  const { worldGeometries } = useGetGeometries();
  const [mapReference, setMapReference] = useState<MapRef | null>(null);
  const map = mapReference?.getMap();
  const userLocation = useUserLocation();

  const onMapReferenceChange = useCallback((reference: MapRef) => {
    setMapReference(reference);
  }, []);

  useEffect(() => {
    const setSourceLoadedForMap = () => {
      setSourceLoaded(
        Boolean(
          map?.getSource(ZONE_SOURCE) !== undefined &&
            map?.getSource('states') !== undefined &&
            map?.isSourceLoaded('states')
        )
      );
    };
    const onSourceData = () => {
      setSourceLoadedForMap();
    };
    map?.on('sourcedata', onSourceData);
    return () => {
      map?.off('sourcedata', onSourceData);
    };
  }, [map]);

  useEffect(() => {
    // This effect colors the zones based on the co2 intensity
    if (!map || isLoading || isError) {
      return;
    }
    map?.touchZoomRotate.disableRotation();
    map?.touchPitch.disable();

    if (!isSourceLoaded || isLoadingMap) {
      return;
    }
    for (const feature of worldGeometries.features) {
      const { zoneId } = feature.properties;
      const zone = data?.data.datetimes[selectedDatetimeString]?.z[zoneId];
      const co2intensity = zone ? getCO2IntensityByMode(zone, mixMode) : undefined;
      const fillColor = co2intensity
        ? getCo2colorScale(co2intensity)
        : theme.clickableFill;
      const existingColor = map.getFeatureState({
        source: ZONE_SOURCE,
        id: zoneId,
      })?.color;

      if (existingColor !== fillColor) {
        map.setFeatureState(
          {
            source: ZONE_SOURCE,
            id: zoneId,
          },
          {
            color: fillColor,
          }
        );
      }
    }
  }, [
    map,
    data,
    getCo2colorScale,
    mixMode,
    isLoadingMap,
    isSourceLoaded,
    spatialAggregate,
    isSuccess,
    isLoading,
    isError,
    worldGeometries.features,
    theme.clickableFill,
    selectedDatetimeString,
  ]);

  useEffect(() => {
    // Run on first load to center the map on the user's location
    if (!map || isError || !isFirstLoad || !isSourceLoaded || !userLocation) {
      return;
    }
    if (!selectedZoneId) {
      map.flyTo({ center: [userLocation[0], userLocation[1]] });

      const handleIdle = () => {
        if (map.isSourceLoaded(ZONE_SOURCE) && map.areTilesLoaded()) {
          const source = map.getSource(ZONE_SOURCE);
          const layer = map.getLayer('zones-clickable-layer');
          if (!source) {
            console.error(`Source "${ZONE_SOURCE}" not found`);
            return;
          }
          if (!layer) {
            console.error('Layer "zones-clickable-layer" not found or not rendered');
            return;
          }
          const zoneFeature = getZoneIdFromLocation(map, userLocation, ZONE_SOURCE);
          if (zoneFeature) {
            const zoneId = zoneFeature.properties.zoneId;
            setUserLocation(zoneId);
          }
          map.off('idle', handleIdle);
        }
      };
      setIsFirstLoad(false);
      map.on('idle', handleIdle);
    }
  }, [
    map,
    isSuccess,
    isError,
    isFirstLoad,
    userLocation,
    selectedZoneId,
    isSourceLoaded,
    setUserLocation,
  ]);

  useEffect(() => {
    // Run when the selected zone changes
    // deselect and dehover zone when navigating to /map (e.g. using back button on mobile panel)
    if (map && location.pathname === '/map' && selectedZoneId) {
      map.setFeatureState(
        { source: ZONE_SOURCE, id: selectedZoneId },
        { selected: false, hover: false }
      );
      setHoveredZone(null);
    }
    // Center the map on the selected zone
    const pathZoneId = matchPath('/zone/:zoneId', location.pathname)?.params.zoneId;
    setSelectedZoneId(pathZoneId);
    if (map && !isLoadingMap && pathZoneId) {
      const feature = worldGeometries.features.find(
        (feature) => feature?.properties?.zoneId === pathZoneId
      );
      // if no feature matches, it means that the selected zone is not in current spatial resolution.
      // We cannot include geometries in dependencies, as we don't want to flyTo when user switches
      // between spatial resolutions. Therefore we find an approximate feature based on the zoneId.
      if (feature) {
        const center = feature.properties.center;
        map.setFeatureState({ source: ZONE_SOURCE, id: pathZoneId }, { selected: true });
        setLeftPanelOpen(true);
        const centerMinusLeftPanelWidth = [center[0] - 10, center[1]] as [number, number];
        map.flyTo({ center: isMobile ? center : centerMinusLeftPanelWidth, zoom: 3.5 });
      }
    }
  }, [
    map,
    location.pathname,
    isLoadingMap,
    selectedZoneId,
    setHoveredZone,
    worldGeometries.features,
    setLeftPanelOpen,
  ]);

  const onClick = (event: maplibregl.MapLayerMouseEvent) => {
    if (!map || !event.features) {
      return;
    }
    const feature = event.features[0];

    // Remove state from old feature if we are no longer hovering anything,
    // or if we are hovering a different feature than the previous one
    if (selectedZoneId && (!feature || selectedZoneId !== feature.id)) {
      map.setFeatureState(
        { source: ZONE_SOURCE, id: selectedZoneId },
        { selected: false }
      );
    }

    if (hoveredZone && (!feature || hoveredZone.featureId !== selectedZoneId)) {
      map.setFeatureState(
        { source: ZONE_SOURCE, id: hoveredZone.featureId },
        { hover: false }
      );
    }
    setHoveredZone(null);
    if (feature?.properties) {
      const zoneId = feature.properties.zoneId;
      navigate(createToWithState(`/zone/${zoneId}`));
    } else {
      navigate(createToWithState('/map'));
    }
  };

  // TODO: Consider if we need to ignore zone hovering if the map is dragging
  const onMouseMove = (event: maplibregl.MapLayerMouseEvent) => {
    if (!map || !event.features) {
      return;
    }
    const feature = event.features[0];
    const isHoveringAZone = feature?.id !== undefined;
    const isHoveringANewZone = isHoveringAZone && hoveredZone?.featureId !== feature?.id;

    // Reset currently hovered zone if we are no longer hovering anything
    if (!isHoveringAZone && hoveredZone) {
      setHoveredZone(null);
      map.setFeatureState(
        { source: ZONE_SOURCE, id: hoveredZone?.featureId },
        { hover: false }
      );
    }

    // Do no more if we are not hovering a zone
    if (!isHoveringAZone) {
      return;
    }

    // Update mouse position to help position the tooltip
    setMousePosition({
      x: event.point.x,
      y: event.point.y,
    });

    // Update hovered zone if we are hovering a new zone
    if (isHoveringANewZone) {
      // Reset the old one first
      if (hoveredZone) {
        map.setFeatureState(
          { source: ZONE_SOURCE, id: hoveredZone?.featureId },
          { hover: false }
        );
      }

      setHoveredZone({ featureId: feature.id, zoneId: feature.properties?.zoneId });
      map.setFeatureState({ source: ZONE_SOURCE, id: feature.id }, { hover: true });
    }
  };

  const onMouseOut = () => {
    if (!map) {
      return;
    }

    // Reset hovered state when mouse leaves map (e.g. cursor moving into panel)
    if (hoveredZone?.featureId !== undefined) {
      map.setFeatureState(
        { source: ZONE_SOURCE, id: hoveredZone?.featureId },
        { hover: false }
      );
      setHoveredZone(null);
    }
  };

  const onError = (event: ErrorEvent) => {
    console.error(event.error);
    setIsLoadingMap(false);
    // TODO: Show error message to user
    // TODO: Send to Sentry
    // TODO: Handle the "no webgl" error gracefully
  };

  const onLoad = () => {
    setIsLoadingMap(false);
    if (onMapLoad && mapReference) {
      onMapLoad(mapReference.getMap());
    }
  };

  const onMoveStart = () => {
    setIsMoving(true);
  };

  const onMoveEnd = () => {
    setIsMoving(false);
  };

  return (
    <Map
      id="map"
      RTLTextPlugin={false}
      ref={onMapReferenceChange}
      initialViewState={{
        latitude: 50.905,
        longitude: 6.528,
        zoom: 2.5,
      }}
      interactiveLayerIds={['zones-clickable-layer', 'zones-hoverable-layer']}
      cursor={hoveredZone ? 'pointer' : 'grab'}
      onClick={onClick}
      onLoad={onLoad}
      onError={onError}
      onMouseMove={onMouseMove}
      onMouseOut={onMouseOut}
      onMoveStart={onMoveStart}
      onMoveEnd={onMoveEnd}
      dragPan={{ maxSpeed: 0 }} // Disables easing effect to improve performance on exchange layer
      dragRotate={false}
      minZoom={0.7}
      maxBounds={[
        [Number.NEGATIVE_INFINITY, SOUTHERN_LATITUDE_BOUND],
        [Number.POSITIVE_INFINITY, NORTHERN_LATITUDE_BOUND],
      ]}
      style={{ minWidth: '100vw', height: '100vh' }}
      mapStyle={MAP_STYLE as StyleSpecification}
    >
      <BackgroundLayer />
      <ZonesLayer />
      <StatesLayer />
      <CustomLayer>
        <WindLayer />
      </CustomLayer>
      <CustomLayer>
        <ExchangeLayer />
      </CustomLayer>
      <CustomLayer>
        <SolarLayer />
      </CustomLayer>
    </Map>
  );
}
