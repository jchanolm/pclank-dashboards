import { NextRequest, NextResponse } from 'next/server';
import { runQuery } from '@/lib/neo4j';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address.toLowerCase();

    const query = `
    MATCH (believerWallet:Wallet)-[r:HOLDS]->(token:Token {address:$address})
    MATCH (believerWallet)-[:ACCOUNT*..4]-(wc:Warpcast:Account)  
    WHERE wc.fcCredScore is not null       
    ORDER BY wc.fcCredScore DESC LIMIT 25
    RETURN 
      tointeger(wc.fid) as fid,
      wc.username as username,
      wc.bio as bio,
      wc.fcCredScore as fcred
    `;

    const results = await runQuery(query, { address });
    
    // Transform Neo4j records to a more friendly format
    const believers = results.map(record => {
      const properties = {};
      record.keys.forEach(key => {
        properties[key] = record.get(key);
      });
      return properties;
    });

    return NextResponse.json({ believers });
  } catch (error) {
    console.error('Error fetching believers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch believers' },
      { status: 500 }
    );
  }
}