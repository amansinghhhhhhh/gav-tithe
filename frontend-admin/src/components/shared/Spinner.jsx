import guicon from "../../assets/guicon.svg";

export function Spinner({ size = 40, style = {} }) {
  return (
    <img
      src={guicon}
      alt=""
      style={{
        width: size,
        height: size,
        animation: "gu-spin 1s linear infinite",
        display: "block",
        ...style,
      }}
    />
  );
}
