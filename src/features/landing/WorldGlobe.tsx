import { useState } from 'react';
const regions = [
  ['india', 'India'], ['united-states', 'United States'], ['canada', 'Canada'],
  ['germany', 'Germany'], ['nigeria', 'Nigeria'], ['singapore', 'Singapore'],
  ['united-kingdom', 'United Kingdom'], ['australia', 'Australia'],
] as const;
export default function WorldGlobe() {
  const [region, setRegion] = useState('overview');
  const label = regions.find(([id]) => id === region)?.[1] ?? 'Europe and Africa';
  return <div className="lp-globe">
    <img className="lp-geographic-globe" src={`/landing/globe/${region}.svg`} width="500" height="380" loading="lazy" alt={`Accurate orthographic globe centered on ${label}, showing coastlines and geographic markers on the visible hemisphere.`} />
    <div className="lp-country-labels" role="group" aria-label="Turn globe to a country">
      {regions.map(([id, name]) => <button key={id} type="button" aria-pressed={region === id} onClick={() => setRegion(id)}>{name}</button>)}
    </div>
    <div className="lp-globe-caption">
      <span aria-live="polite">{region === 'overview' ? 'Select a country to turn the globe' : `Viewing ${label}`}</span>
      {region !== 'overview' && <button type="button" onClick={() => setRegion('overview')}>Reset view</button>}
    </div>
    <small>Geographic markers · not a user distribution map</small>
  </div>;
}
