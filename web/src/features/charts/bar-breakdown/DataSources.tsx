import { ElectricityModeType } from 'types';

import ProductionSourceLegend from './ProductionSourceLegend';

export function DataSources({
  title,
  icon,
  sources,
  sourceToProductionSources,
}: {
  title: string;
  icon: React.ReactNode;
  sources?: string[];
  sourceToProductionSources?: Map<string, string[]>;
}) {
  return (
    <div className="flex flex-col py-2">
      <div className="flex flex-row pb-2">
        <div className="mr-1">{icon}</div>
        <div className="text-md font-semibold">{title}</div>
      </div>
      {sources && SourcesWithoutLegends({ sources: sources })}
      {sourceToProductionSources &&
        SourcesWithLegends({ sourceToProductionSources: sourceToProductionSources })}
    </div>
  );
}

function SourcesWithoutLegends({ sources }: { sources: string[] }) {
  return (
    <div className="flex flex-col gap-2 pl-5">
      {sources.map((source, index) => (
        <div key={index} className="text-sm">
          {source}
        </div>
      ))}
    </div>
  );
}

function SourcesWithLegends({
  sourceToProductionSources,
}: {
  sourceToProductionSources: Map<string, string[]>;
}) {
  return (
    <div className="flex flex-col gap-1 pl-5">
      {[...sourceToProductionSources.keys()].sort().map((source, index) => (
        <p key={index} className="text-sm">
          {source}
          <span className="inline-flex gap-1 pl-1.5">
            {sourceToProductionSources.get(source)?.map((productionSource, index) => (
              <span key={index} className="self-center object-center text-xs">
                <ProductionSourceLegend
                  electricityType={productionSource as ElectricityModeType}
                  transform="translate(0,3.5)"
                />
              </span>
            ))}
          </span>
        </p>
      ))}
    </div>
  );
}
