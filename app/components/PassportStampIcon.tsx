type PassportStampIconProps = {
  size?: number;
  animated?: boolean;
  id?: string;
};

let idCounter = 0;

export default function PassportStampIcon({
  size = 72,
  animated = true,
  id,
}: PassportStampIconProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '12px',
        background: '#e0e5ec',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '6px 6px 12px #b8b9be, -6px -6px 12px #ffffff',
      }}
    >
      <span
        style={{
          fontSize: size * 0.4,
          fontWeight: 'bold',
          color: '#64748b',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        RP
      </span>
    </div>
  );
}
