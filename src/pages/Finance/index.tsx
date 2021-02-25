import React, { useState } from 'react';
import { Box } from 'grommet';
import { Title, Text } from 'components/Base';
import * as styles from './styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { Icon } from 'components/Base/components/Icons';



export const FinancePage = () => {
  const [expandedIdxs, setExpandedIdxs] = useState([]);

  const addExpanded = idx => setExpandedIdxs(expandedIdxs.concat([idx]));
  const removeExpanded = idx => setExpandedIdxs(expandedIdxs.filter(item => item !== idx));

  return (
    <BaseContainer>
      <PageContainer>
       <h1 className={styles.pageName}>Defi Products</h1>
       <section className={styles.defiProducts}>
         <div className={styles.defiProduct}>
          <div className={styles.defiImage}>
            <img className="img-fluid" src={`${process.env.PUBLIC_URL}/static/defi01.svg`} alt="logo"/>
          </div>
          <h2 className={styles.defiTitle}>SCRT</h2>
          <p className={styles.defiDescription}>Navigate different use-cases for SCRT in Secret Network</p>
         </div>
         <div className={styles.defiProduct}>
          <div className={styles.defiImage}>
            <img className="img-fluid" src={`${process.env.PUBLIC_URL}/static/defi02.svg`} alt="logo"/>
          </div>
          <h2 className={styles.defiTitle}>Bridge</h2>
          <p className={styles.defiDescription}>Turn your Ethereum assets to Private Tokens on the Secret Network</p>
          <a href="/eth"><img className={styles.imgArrowLink} src={`${process.env.PUBLIC_URL}/static/arrow-go.svg`} alt="defi-product"/></a>
         </div>
         <div className={styles.defiProduct}>
          <div className={styles.defiImage}>
            <img className="img-fluid" src={`${process.env.PUBLIC_URL}/static/defi03.svg`} alt="defi-product"/>
          </div>
          <h2 className={styles.defiTitle}>SecretSwap</h2>
          <p className={styles.defiDescription}>Front-running resistant AMM for secretTokens</p>
         </div>
         <div className={styles.defiProduct}>
          <div className={styles.defiImage}>
            <img className="img-fluid" src={`${process.env.PUBLIC_URL}/static/defi04.svg`} alt="defi-product"/>
          </div>
          <h2 className={styles.defiTitle}>Auction</h2>
          <p className={styles.defiDescription}>Sealed bid auctions for large quantity Over-The-Counter book trading for secretTokens</p>
          <a target="blank" href="https://auctions.scrt.network/"><img className={styles.imgArrowLink} src={`${process.env.PUBLIC_URL}/static/arrow-go.svg`} alt="defi-product"/></a>
         </div>
         <div className={styles.defiProduct}>
          <div className={styles.defiImage}>
            <img className="img-fluid" src={`${process.env.PUBLIC_URL}/static/defi05.svg`} alt="logo"/>
          </div>
          <h2 className={styles.defiTitle}>Earn</h2>
          <p className={styles.defiDescription}>Explore yield opportunities in Secret Network</p>
         </div>
       </section>
      </PageContainer>
    </BaseContainer>
  );
};
