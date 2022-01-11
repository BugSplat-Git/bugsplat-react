import { CSSProperties } from "react";

const basicFallbackStyles: CSSProperties = {
  display: "flex",
  justifyContent: "center",
};

export default function BasicFallback() {
  return (
    <div style={basicFallbackStyles}>
      <h2>Something went wrong.</h2>
    </div>
  );
}
