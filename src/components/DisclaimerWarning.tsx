import * as React from 'react';
import CookieBanner from 'react-cookie-banner';

const styles = {
  banner: {
    fontFamily: 'Nunito',
    height: 80,
    background: 'rgba(31, 39, 49, 0.88)',
    backgroundSize: '30px 30px',
    backgroundColor: '',
    fontSize: '16px',
    fontWeight: 600,
    position: 'relative',
    top: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 999,
    borderRadius: 5,
    // marginBottom: -10,
    // marginTop: -10
  },
  button: {
    position: 'static',
    border: '1px solid white',
    borderRadius: 4,
    width: 120,
    height: 40,
    background: 'transparent',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    opacity: 1,
    top: 0,
    marginTop: 0,
    right: 0,
    marginLeft: 40,
    marginRight: 32,
  },
  message: {
    display: 'block',
    lineHeight: 1.5,
    textAlign: 'left',
    color: 'red',
    marginLeft: 32,
    // fontWeight: "bold"
    fontSize: '17px',
  },
  link: {
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};

export const Disclaimer = () => (
  <CookieBanner
    styles={styles}
    message="NOTE: All transactions are on the Harmony Testnet and Kovan Test Network. Use at your own risk. If you find a bug, send them here support@harmony.one"
    onAccept={() => {}}
    cookie="soccerplayers-accept-no-commerce"
    dismissOnScroll={false}
    dismissOnClick={false}
  />
);
