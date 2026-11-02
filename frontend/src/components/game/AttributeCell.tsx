import type { AttributeStatus } from "../../types/game.ts";
import DelayedDiv from "./DelayedDiv.tsx"
import SwapRes from "./SwapRes.tsx";

interface IAttributeCell {
  value?: string | number | string[] | boolean,
  value2?: number;
  value3?: string;
  comp?: AttributeStatus;
  comp2?: AttributeStatus;
  lastGuess?: boolean;
  delay: number;
};

function AttributeCell({value, value2, value3, comp, comp2, lastGuess = true, delay} : IAttributeCell) {
  const color = comp === "correct" && (value3 === undefined)
								? "bg-green-100 text-green-900"
								: comp === "incorrect"
									? "bg-red-100 text-red-900"
									: "bg-yellow-100 text-yellow-900";

  const content = value3 === undefined ? (
    <div className={`rounded-md p-3 text-sm ${color}`}>
		  {Array.isArray(value)
      ? value.length > 0 ? value.join(", ") : "N/A"
      : value2 !== undefined && value !== undefined && value2 !== value
        ? `${value} - ${value2}`
        : (<>
          {value?.toString() ?? value2?.toString() ?? "N/A"}
          {
            comp === "higher"
            ? "↑"
            : comp === "lower"
              ? "↓"
              : ""
          }</>)
      }
		</div>
  ) : (
    <div className={`rounded-md p-3 text-sm ${color}`}>
      {value3}
      <br/>
		  {value2 !== undefined && value !== undefined && value2 !== value
        ? `${value} - ${value2}`
        : (<>
          {value ?? value2}
          {
            comp === "higher"
            ? "↑"
            : comp === "lower"
              ? "↓"
              : ""
          }</>)
      }
		</div>
  );

  if (!lastGuess) {
    return content;
  }

  return (
    <DelayedDiv delay={delay}>
			<SwapRes delay={delay + 300} onMsg={content} offMsg="idk" />
		</DelayedDiv>
  );
}

export default AttributeCell;