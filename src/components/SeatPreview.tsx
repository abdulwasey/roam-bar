import React from 'react';
import type { ActivityDisplay } from '../lib/types';

interface Props {
  name: string;
  image?: string;
  display?: ActivityDisplay;
}

const SeatPreview: React.FC<Props> = ({ name, image, display }) => {
  const color = display?.color ?? 'gray';
  return (
    <div className={`seat ${display ? `seat-active seat-${color}` : ''}`} aria-hidden="true">
      <div className="seat-name">{name || 'You'}</div>
      {display && <div className="seat-badge">{display.emoji}</div>}
      <div className="seat-avatar">{image ? <img src={image} alt="" /> : <span>{name.slice(0, 1) || '?'}</span>}</div>
    </div>
  );
};

export default SeatPreview;
