import { ScaleLinear } from 'd3-scale';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

import { LABEL_MAX_WIDTH, SCALE_TICKS, X_AXIS_HEIGHT } from '../constants';

type Props = {
  height: number;
  scale: ScaleLinear<number, number, never>;
  formatTick: (tick: number) => string | number;
  hasLegend?: boolean;
};

export default function Axis({ formatTick, height, scale, hasLegend }: Props) {
  const axisTicks = scale.ticks(SCALE_TICKS);

  return (
    <g
      className="text-gray-500/30"
      fill="none"
      fontSize="10"
      fontFamily="sans-serif"
      textAnchor="middle"
      transform={`translate(${scale.range()[0] + LABEL_MAX_WIDTH}, ${X_AXIS_HEIGHT})`}
    >
      <path
        stroke="currentColor"
        fill="none"
        shapeRendering="auto"
        d={`M${scale.range()[0] + 0.5},0.5H${scale.range()[1] + 0.5}`}
      />
      {axisTicks.map((t) => (
        <g key={t} className="tick" opacity="1" transform={`translate(${scale(t)}, 0)`}>
          <line
            stroke="currentColor"
            strokeWidth={1}
            shapeRendering={'auto'}
            y2={height - X_AXIS_HEIGHT}
          />
          <text
            fill="gray"
            fontSize={axisTicks.length > SCALE_TICKS ? '0.5rem' : '0.6rem'}
            y="-3"
            dy="0"
          >
            {formatTick(t)}
          </text>
          {hasLegend && t == 0 && (
            <>
              <line
                stroke="currentColor"
                strokeWidth={1}
                shapeRendering={'auto'}
                y1={height - X_AXIS_HEIGHT}
                y2={height - X_AXIS_HEIGHT + 15}
              />
              <text
                fill="rgba(163, 163, 163, 1)"
                fontSize={'0.7rem'}
                y={height - X_AXIS_HEIGHT + 10}
                x={-40}
                dy="0"
              >
                {'Exported'}
              </text>
              <FaArrowLeft x={-15} y={height - X_AXIS_HEIGHT + 2} />
              <FaArrowRight x={5} y={height - X_AXIS_HEIGHT + 2} />
              <text
                fill="rgba(163, 163, 163, 1)"
                fontSize={'0.7rem'}
                y={height - X_AXIS_HEIGHT + 10}
                x={40}
                dy="0"
              >
                {'Imported'}
              </text>
            </>
          )}
        </g>
      ))}
    </g>
  );
}
