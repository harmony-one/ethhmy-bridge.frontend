import React from 'react';

export const PairAnalyticsLink: React.FC<{ pairAddress: string }> = ({ pairAddress }) => {
  return null; // until superfish fixes the site

  if (!pairAddress) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '0.5rem',
        border: '1px solid rgb(237, 238, 242)',
        borderRadius: '8px',
        padding: '6px',
      }}
    >
      <a href={`https://secretanalytics.xyz/secretswap/${pairAddress}`} target="_blank">
        <strong>View pair analytics ↗</strong>
      </a>
    </div>
  );
};
