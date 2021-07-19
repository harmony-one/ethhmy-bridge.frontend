
import React from 'react';
import { useQuery, gql } from '@apollo/client';

interface RocketInventory {
  id: number;
  model: string;
  year: number;
  stock: number;
}

interface Assets {
  assets: Asset[];
}

interface Asset {
  address: string;
  burnsCount: string;
  eventsCount:  string;
  id: string;
  mappedAddress:  string;
  mintsCount:  string;
  network:  string;
  symbol:  string;
  totalLocked:  string;
}

const GET_ASSETS_LIST = gql`
  {
    assets(orderBy: eventsCount, orderDirection: desc) {
      id
      symbol
      network
      address
      mappedAddress
      eventsCount
      ... on Token {
        locksCount
        unlocksCount
        totalLocked
      }
      ... on BridgedToken {
        mintsCount
        burnsCount
        totalLocked
      }
      ... on BridgedNFT {
        mintsCount
        burnsCount
        inventory
      }
    }
  }`;

export function AssetList() {
  const { loading, data } = useQuery<Assets>(
    GET_ASSETS_LIST
  );
  return (
    // <div>
    //   <h3>Available Inventory</h3>
    //   {loading ? (
    //     <p>Loading ...</p>
    //   ) : (
    //     <table>
    //       <thead>
    //         <tr>
    //           <th>Model</th>
    //           <th>Stock</th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {data && data.rocketInventory.map(inventory => (
    //           <tr>
    //             <td>{inventory.model}</td>
    //             <td>{inventory.stock}</td>
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table>
    //   )}
    // </div>
  );
}