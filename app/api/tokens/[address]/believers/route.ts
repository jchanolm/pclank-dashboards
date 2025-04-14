import { runQuery } from '@/lib/neo4j';

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address.toLowerCase();

    const query = `
    MATCH (believerWallet:Wallet)-[holds:HOLDS]->(token:Token {address:tolower($address)})
    MATCH (believerWallet)-[:ACCOUNT*..4]-(wc:Warpcast:Account)  
    WHERE wc.fcCredScore is not null       
    WITH DISTINCT wc, tofloat(sum(holds.balance)) as balance
    ORDER BY wc.fcCredScore DESC 
    RETURN 
      tointeger(wc.fid) as fid,
      balance,
      wc.username as username,
      wc.bio as bio,
      wc.fcCredScore as fcred
    `;

    const results = await runQuery(query, { address });
    
    const believers = results.map(record => ({
      fid: record.get('fid') || 0,
      username: record.get('username') || '',
      bio: record.get('bio') || '',
      balance: record.get('balance') || 0,
      fcred: record.get('fcred') || 0
    }));

    return Response.json({ believers });
  } catch (error) {
    console.error('Error fetching believers:', error);
    return Response.json(
      { error: 'Failed to fetch believers' },
      { status: 500 }
    );
  }
}
