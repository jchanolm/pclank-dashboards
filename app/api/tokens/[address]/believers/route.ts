import { NextRequest, NextResponse } from 'next/server';
import { runQuery } from '@/lib/neo4j';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address.toLowerCase();

  try {
    const query = `
      MATCH (believerWallet:Wallet)-[r:HOLDS]->(token:Token {address: tolower($address)})
      MATCH (believerWallet)-[:ACCOUNT*..4]-(wc:Warpcast:Account)
      WHERE wc.fcCredScore is not null
      WITH DISTINCT wc
      ORDER BY wc.fcCredScore DESC
      RETURN 
        tointeger(wc.fid) as fid,
        wc.username as username,
        wc.bio as bio,
        wc.fcCredScore as fcred
    `;
    
    const results = await runQuery(query, { address });
    
    const believers = results.map((record: any) => ({
      fid: record.get('fid') || 0,
      username: record.get('username') || '',
      bio: record.get('bio') || '',
      fcred: record.get('fcred') || 0,
    }));

    return NextResponse.json({ believers });
  } catch (error) {
    console.error('Error fetching believers:', error);
    return NextResponse.json({ error: 'Failed to fetch believers' }, { status: 500 });
  }
}
