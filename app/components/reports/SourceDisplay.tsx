import type { SourceWithReports } from "@/lib/local-types";


interface SourceDisplayProps {
  index: number;
  source: SourceWithReports;
}

const SourceDisplay = ({ index, source }: SourceDisplayProps) => {
  return (
    <div>
      <div>
        Source #{index + 1}
      </div>
      {source.name && (
        <div>
          Name: {source.name}
        </div>
      )}
      <div>
        Type: {source.source_type}
      </div>
      {source.url && (
        <div>
          URL: {source.url}
        </div>
      )}
    </div>
  );
}

export default SourceDisplay;
