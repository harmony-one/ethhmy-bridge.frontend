import React from 'react';
import Reel from 'react-reel'

const theme = {
    reel: {
      height: '1em',
      display: 'flex',
      alignItems: 'flex-end',
      overflowY: 'hidden',
      fontSize: '30px',
      fontWeight: '300',
      color: '#85bb65',
      lineHeight: '0.95em'
    },
    group: {
      transitionDelay: '0ms',
      transitionTimingFunction: 'ease-in-out',
      transform: 'translate(0, 0)',
      height: '1em'
    },
    number: {
      height: '1em'
    },
};

const OdometerValue = props => {
    return <Reel theme={theme} text={props.number}/>
}

export default OdometerValue;
