function ProgressBar({ label, value }) {
  return (
    <div className="w-full space-y-2 mt-5">
      {/* Label */}
      {label && (
        <div className="flex justify-between items-center text-sm font-medium text-gray-500">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full h-3 rounded-lg bg-white overflow-hidden">
        <div
          className="h-full rounded-lg"
          style={{
            width: `${value}%`, // Dynamically set width based on the value
            background: `linear-gradient(to right, #F87171, #F472B6)`, // Gradient for the fill
          }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
