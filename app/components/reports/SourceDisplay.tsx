import type { SourceWithReports } from "@/lib/local-types";


interface SourceDisplayProps {
  index: number;
  source: SourceWithReports;
}

const SourceDisplay = ({ index, source }: SourceDisplayProps) => {
  return (
    <div className="grid grid-cols-3 sm:w-1/2 mt-1">
      <div className="font-bold col-span-3">
        Source #{index + 1}
      </div>
      {source.name && (
        <>
          <div className="font-bold">
            Name:
          </div>
          <div className="col-span-2">
             {source.name}
          </div>
        </>
      )}
      <div className="font-bold">
        Type:
      </div>
      <div className="col-span-2">
        {source.source_type}
      </div>
      {source.url && (
        <>
          <div className="font-bold">
            URL:
          </div>
          <div className="col-span-2">
            {source.url}
          </div>
        </>
      )}
    </div>
  );
}

export default SourceDisplay;
