"use client";

type ComparisonSliderProps = {
  beforeSrc: string;
  afterSrc: string;
  position: number;
  onPositionChange: (value: number) => void;
  afterLabel?: string;
  checkerboard?: boolean;
};

export default function ComparisonSlider({
  beforeSrc,
  afterSrc,
  position,
  onPositionChange,
  afterLabel = "After",
  checkerboard = false,
}: ComparisonSliderProps) {
  return (
    <div
      className={`slider${checkerboard ? " checkerboard" : ""}`}
      style={{ ["--pos" as string]: `${position}%` }}
    >
      <img src={beforeSrc} alt="Original photo" />
      <img className="after" src={afterSrc} alt={`${afterLabel} photo`} />
      <div className="handle" />
      <div className="labels">
        <span>Before</span>
        <span>{afterLabel}</span>
      </div>
      <input
        className="range"
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(event) => onPositionChange(Number(event.target.value))}
        aria-label="Before and after comparison"
      />
    </div>
  );
}
